// OpenNext Cloudflare config with R2 Incremental Cache & DO Queue
import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import r2IncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/r2-incremental-cache";
import doQueue from "@opennextjs/cloudflare/overrides/queue/do-queue";

export default defineCloudflareConfig({
	buildCommand: "npm run build",
	incrementalCache: r2IncrementalCache,
	queue: doQueue,
	enableCacheInterception: true,
});
