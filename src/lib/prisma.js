import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const cfContextSymbol = Symbol.for('__cloudflare-context__');
const requestPrismaClients = new WeakMap();
const globalForPrisma = globalThis;

function getPostgresUrl(env = process.env) {
    const candidates = [
        env?.POSTGRES_URL,
        env?.DATABASE_URL,
        env?.PRISMA_DATABASE_URL,
    ];
    for (const raw of candidates) {
        if (typeof raw !== 'string') continue;
        const url = raw.trim();
        if (url.startsWith('postgres://') || url.startsWith('postgresql://')) {
            return url;
        }
    }
    return null;
}

function createPrismaClient(env = process.env, isCloudflare = false) {
    const connectionString = getPostgresUrl(env);
    if (!connectionString) {
        throw new Error('Database connection string missing (set POSTGRES_URL or DATABASE_URL).');
    }

    const pool = new Pool({
        connectionString,
        // Keep one connection per Worker request context so I/O sockets never bleed across requests.
        max: isCloudflare ? 1 : 10,
        idleTimeoutMillis: isCloudflare ? 1000 : 30000,
        connectionTimeoutMillis: 10000,
    });
    const adapter = new PrismaPg(pool);

    return new PrismaClient({
        adapter,
        log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    });
}

function getClient() {
    const cfContext = globalThis[cfContextSymbol];
    if (cfContext) {
        let client = requestPrismaClients.get(cfContext);
        if (!client) {
            const mergedEnv = { ...process.env, ...(cfContext.env || {}) };
            client = createPrismaClient(mergedEnv, true);
            requestPrismaClients.set(cfContext, client);
        }
        return client;
    }

    if (!globalForPrisma.prisma) {
        globalForPrisma.prisma = createPrismaClient(process.env, false);
    }
    return globalForPrisma.prisma;
}

const prisma = new Proxy(
    {},
    {
        get(_target, prop) {
            const client = getClient();
            const value = Reflect.get(client, prop, client);
            return typeof value === 'function' ? value.bind(client) : value;
        },
    }
);

export default prisma;
