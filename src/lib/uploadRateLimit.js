/**
 * Best-effort per-instance upload throttle shared by the normal upload route
 * and the Vercel Blob token route.
 *
 * Serverless instances each keep their own Map, so this is a speed bump rather
 * than a global quota. It exists to stop one client from hammering storage in
 * a tight loop; the storage provider remains the real cost guard.
 */
const WINDOW_MS = 60 * 60 * 1000; // 1 hour
const LIMIT = 40; // 40 uploads per hour per IP
const buckets = new Map();

export function isUploadRateLimited(ip) {
    if (!ip) return false;

    const now = Date.now();
    const timestamps = buckets.get(ip) || [];
    const validTimestamps = timestamps.filter((t) => now - t < WINDOW_MS);

    if (validTimestamps.length >= LIMIT) {
        buckets.set(ip, validTimestamps);
        return true;
    }

    validTimestamps.push(now);
    buckets.set(ip, validTimestamps);

    // Periodically clean up stale IPs from map.
    if (buckets.size > 500) {
        for (const [key, times] of buckets.entries()) {
            if (times.every((t) => now - t >= WINDOW_MS)) {
                buckets.delete(key);
            }
        }
    }

    return false;
}
