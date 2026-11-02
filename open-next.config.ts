// OpenNext Cloudflare config with R2 Incremental Cache
import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import r2IncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/r2-incremental-cache";

export default defineCloudflareConfig({
	buildCommand: "npm run build",
	incrementalCache: r2IncrementalCache,
});
