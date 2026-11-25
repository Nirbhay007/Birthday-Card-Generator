import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const cfContextSymbol = Symbol.for('__cloudflare-context__');
const requestPrismaClients = new WeakMap();
const globalForPrisma = globalThis;

const READ_METHODS = new Set([
    'findUnique',
    'findUniqueOrThrow',
    'findFirst',
    'findFirstOrThrow',
    'findMany',
    'count',
    'aggregate',
    'groupBy',
]);

// Append-only analytics events are safe to retry even on timeout errors.
const IDEMPOTENT_ANALYTICS_MODELS = new Set(['supportEvent', 'shareEvent']);

function normalizePostgresUrl(raw) {
    if (typeof raw !== 'string') return null;
    const url = raw.trim();
    if (!url.startsWith('postgres://') && !url.startsWith('postgresql://')) {
        return null;
    }
    try {
        const parsed = new URL(url);
        const sslmode = parsed.searchParams.get('sslmode');
        // pg-connection-string treats 'prefer', 'require', and 'verify-ca' as
        // aliases for 'verify-full' and emits a noisy SECURITY WARNING per pool.
        if (sslmode && ['prefer', 'require', 'verify-ca'].includes(sslmode) && !parsed.searchParams.has('uselibpqcompat')) {
            parsed.searchParams.set('sslmode', 'verify-full');
            return parsed.toString();
        }
    } catch {
        // Keep original string if URL parsing fails (e.g. special characters).
    }
    return url;
}

function getPostgresUrl(env = process.env) {
    const candidates = [
        env?.HYPERDRIVE?.connectionString,
        env?.DATABASE_URL_POOLED,
        env?.POSTGRES_URL,
        env?.DATABASE_URL,
        env?.PRISMA_DATABASE_URL,
    ];
    for (const raw of candidates) {
        const normalized = normalizePostgresUrl(raw);
        if (normalized) return normalized;
    }
    return null;
}

function createPrismaEntry(env = process.env, isCloudflare = false) {
    const connectionString = getPostgresUrl(env);
    if (!connectionString) {
        throw new Error('Database connection string missing (set POSTGRES_URL or DATABASE_URL).');
    }

    const pool = new Pool({
        connectionString,
        // Keep one connection per Worker request context so I/O sockets never bleed across requests.
        max: isCloudflare ? 1 : 10,
        idleTimeoutMillis: isCloudflare ? 5000 : 30000,
        connectionTimeoutMillis: 10000,
    });
    const adapter = new PrismaPg(pool);

    const client = new PrismaClient({
        adapter,
        log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    });

    return { client, pool };
}

function getClient() {
    const cfContext = globalThis[cfContextSymbol];
    if (cfContext) {
        let entry = requestPrismaClients.get(cfContext);
        if (!entry) {
            const mergedEnv = { ...process.env, ...(cfContext.env || {}) };
            entry = createPrismaEntry(mergedEnv, true);
            requestPrismaClients.set(cfContext, entry);
        }
        return entry.client;
    }

    if (!globalForPrisma.prisma) {
        globalForPrisma.prisma = createPrismaEntry(process.env, false).client;
    }
    return globalForPrisma.prisma;
}

function resetRequestClient() {
    const cfContext = globalThis[cfContextSymbol];
    if (!cfContext) return;
    const entry = requestPrismaClients.get(cfContext);
    if (entry) {
        requestPrismaClients.delete(cfContext);
        entry.pool?.end?.().catch(() => {});
    }
}

function classifyTransientDbError(error) {
    const msg = String(error?.message || '').toLowerCase();
    const code = String(error?.code || '').toUpperCase();

    // Unambiguous pre-execution connection/proxy errors (query never reached DB).
    if (
        code === 'P1001' ||
        code === 'ECONNREFUSED' ||
        code === 'ENOTFOUND' ||
        code === 'EAI_AGAIN' ||
        msg.includes('proxy request failed') ||
        msg.includes('cannot connect to the specified address') ||
        msg.includes('failed to connect to upstream database')
    ) {
        return 'connect';
    }

    // Socket drop / timeout after handshake began.
    if (
        code === 'P1002' ||
        code === 'P1017' ||
        code === 'ECONNRESET' ||
        code === 'ETIMEDOUT' ||
        msg.includes('connection terminated') ||
        msg.includes('connection timeout')
    ) {
        return 'transport';
    }

    return null;
}

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function withRetry(fn, { allowTransportRetry = false, maxAttempts = 3 } = {}) {
    let lastError;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error;
            const kind = classifyTransientDbError(error);
            const retryable = kind === 'connect' || (allowTransportRetry && kind === 'transport');
            if (!retryable || attempt >= maxAttempts) {
                throw error;
            }
            resetRequestClient();
            const delayMs = attempt === 1 ? 120 : 350;
            await sleep(delayMs + Math.floor(Math.random() * 80));
        }
    }
    throw lastError;
}

const RAW_PROMISE = Symbol('rawPrismaPromise');
const REBUILD_QUERY = Symbol('rebuildPrismaQuery');

function wrapPrismaPromise(modelName, methodName, args, rawPromise, allowTransportRetry) {
    let inFlight = null;
    const run = () => {
        if (!inFlight) {
            let first = true;
            inFlight = withRetry(() => {
                if (first) {
                    first = false;
                    return rawPromise;
                }
                return getClient()[modelName][methodName](...args);
            }, { allowTransportRetry });
        }
        return inFlight;
    };

    return new Proxy(rawPromise, {
        get(target, prop) {
            if (prop === RAW_PROMISE) return rawPromise;
            if (prop === REBUILD_QUERY) return (client) => client[modelName][methodName](...args);
            if (prop === 'then') return (onFulfilled, onRejected) => run().then(onFulfilled, onRejected);
            if (prop === 'catch') return (onRejected) => run().catch(onRejected);
            if (prop === 'finally') return (onFinally) => run().finally(onFinally);
            const value = Reflect.get(target, prop, target);
            return typeof value === 'function' ? value.bind(target) : value;
        },
    });
}

function wrapModelDelegate(modelName, delegate) {
    return new Proxy(delegate, {
        get(target, method) {
            const value = Reflect.get(target, method, target);
            if (typeof method === 'symbol' || typeof value !== 'function') return value;
            const methodName = method;
            const allowTransportRetry =
                READ_METHODS.has(methodName) ||
                (IDEMPOTENT_ANALYTICS_MODELS.has(modelName) && methodName === 'create');
            return (...args) => {
                const currentDelegate = getClient()[modelName];
                const rawPromise = currentDelegate[methodName](...args);
                if (rawPromise && typeof rawPromise.then === 'function') {
                    return wrapPrismaPromise(modelName, methodName, args, rawPromise, allowTransportRetry);
                }
                return rawPromise;
            };
        },
    });
}

const prisma = new Proxy(
    {},
    {
        get(_target, prop) {
            const client = getClient();
            const value = Reflect.get(client, prop, client);
            if (typeof prop === 'symbol') {
                return typeof value === 'function' ? value.bind(client) : value;
            }
            if (value && typeof value === 'object' && !prop.startsWith('$')) {
                return wrapModelDelegate(prop, value);
            }
            if (typeof value === 'function') {
                if (prop === '$queryRaw' || prop === '$executeRaw') {
                    return (...args) =>
                        withRetry(() => getClient()[prop](...args), { allowTransportRetry: false });
                }
                if (prop === '$transaction') {
                    return (arg, options) => {
                        if (Array.isArray(arg)) {
                            let first = true;
                            return withRetry(() => {
                                const activeClient = getClient();
                                const ops = arg.map((item) => {
                                    if (first) return item?.[RAW_PROMISE] ?? item;
                                    return item?.[REBUILD_QUERY] ? item[REBUILD_QUERY](activeClient) : item;
                                });
                                first = false;
                                return activeClient.$transaction(ops, options);
                            }, { allowTransportRetry: false });
                        }
                        if (typeof arg === 'function') {
                            return withRetry(() => getClient().$transaction(arg, options), { allowTransportRetry: false });
                        }
                        return client.$transaction(arg, options);
                    };
                }
                return value.bind(client);
            }
            return value;
        },
    }
);

export default prisma;
