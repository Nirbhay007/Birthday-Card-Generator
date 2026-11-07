# Birthday Page Generator

I built this **Birthday Page Generator** to help people create ultra-smooth, visually rich, and personalized birthday microsites for their loved ones. It's designed to be mobile-first and incredibly interactive.

## Why I Built This

I wanted to create a way to send a digital birthday card that feels premium and special, not just a static image. This project allows users to:
- **Create a personalized page** with a recipient's name, photo, and message.
- **Interactive Candle Blowing**: I implemented a microphone-based interaction where you can physically blow into your phone's mic to extinguish the candles on the screen!
- **Premium Aesthetics**: I focused heavily on smooth animations, glassmorphism, and vibrant color palettes.

## How It Works

1. **Create**: Enter the birthday person's details and upload photos.
2. **Preview**: See exactly what they will see in real-time.
3. **Share**: Generate a unique link to send to them.

## Tech Stack

I used the following technologies to bring this to life:
- **Next.js**: For the framework and routing.
- **Tailwind CSS**: For rapid, beautiful styling.
- **Framer Motion**: To add those buttery smooth animations.
- **Canvas Confetti**: For the celebration effects.
- **Web Audio API**: For the candle blowing detection.

## Getting Started

If you want to run my project locally:

1. Clone the repo.
2. Install dependencies:
   ```bash
   pnpm install
   ```
3. Run the development server:
   ```bash
   pnpm dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) to see it in action.

I hope you enjoy using this tool as much as I enjoyed building it!

## Email & reminders

Payment receipts and the annual birthday reminder use the same Resend account
as the internal alerts. Add these to the deployment environment:

| Variable | Needed for | Notes |
| --- | --- | --- |
| `RESEND_API_KEY` | all email | Already used by admin alerts |
| `EMAIL_FROM` | all email | Verified sender, e.g. `BirthdayGen <hello@yourdomain.com>`. Falls back to `ALERT_FROM_EMAIL`. `onboarding@resend.dev` only delivers to the Resend account owner. |
| `EMAIL_REPLY_TO` | reminders | Optional. Replies to reminder emails go here. |
| `EMAIL_TOKEN_SECRET` | unsubscribe links | Signs one-click unsubscribe tokens. Falls back to `CRON_SECRET`, then `RAZORPAY_KEY_SECRET`, so existing deployments work without a new secret. |
| `CRON_SECRET` | all cron routes | Vercel Cron sends it automatically. In production every `/api/cron/*` route refuses to run without it, so the endpoints can never be triggered by strangers. |
| `NEXT_PUBLIC_SITE_URL` | email links | Absolute card / unsubscribe URLs. Defaults to `https://birthday.nirbhay.online`. |

The reminder sweep runs daily at 05:00 UTC via `vercel.json`. A card gets one
email per birthday, inside the 7-day window before it. Cards without a
birthday date, and cards created fewer than 30 days before the birthday, are
skipped. Unsubscribing sets `reminderOptOutAt`; the card and its photos stay
saved.

Scheduled delivery is date-based. The creator picks a delivery date and the
card goes out in that day's single sweep at 03:00 UTC (08:30–09:30 IST; Hobby
cron timing is per-hour). A recipient email sends the card automatically;
without one, the creator gets a ready-to-send WhatsApp link. This keeps the
feature fully usable on Vercel Hobby, which only allows daily cron jobs.

Apply the database migrations before deploying. See
[Database migrations](#database-migrations) for the one-time baseline command
used by the existing production database.

Preview the reminder queue locally without sending anything:

```bash
curl "http://localhost:3000/api/cron/reminders?dryRun=1"

# If CRON_SECRET is also set in your local .env:
curl -H "Authorization: Bearer $CRON_SECRET" \
  "http://localhost:3000/api/cron/reminders?dryRun=1"
```

## Deploying to Vercel

The app targets Vercel's Next.js runtime. The previous Cloudflare Workers /
OpenNext setup (`worker.js`, `wrangler.jsonc`, `open-next.config.ts`) has been
removed; media still lives in Cloudflare R2 because every existing card points
at an R2 object URL.

### Project settings

| Setting | Value |
| --- | --- |
| Framework preset | Next.js |
| Install command | `pnpm install` (a `pnpm-lock.yaml` is committed) |
| Build command | `pnpm build` |
| Output directory | `.next` (default) |
| Node.js | 22.x (pinned in `engines`) |

`vercel.json` only defines the cron schedule and per-route memory/time limits.
It does not override the framework build.

### Environment variables

Add these in **Project → Settings → Environment Variables** for Production and
Preview:

| Variable | Required | Purpose |
| --- | --- | --- |
| `PRISMA_DATABASE_URL` | yes | Runtime database URL. Production uses Prisma Accelerate (`prisma+postgres://…`); Preview and local development may use a direct Postgres URL. The build runs the standard `prisma generate`, so both work. |
| `POSTGRES_URL` | yes | Direct PostgreSQL URL. The Prisma schema uses it as `directUrl` for migrations. |
| `NEXT_PUBLIC_SITE_URL` | recommended | Canonical site origin used by metadata, OG images and emails. Set it to the production domain. |
| `CRON_SECRET` | yes | Vercel Cron sends `Authorization: Bearer $CRON_SECRET`; production cron routes reject calls without it. |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | for payments | Public Razorpay key id. |
| `RAZORPAY_KEY_SECRET` | for payments | Razorpay secret used to create orders and verify signatures. |
| `RAZORPAY_WEBHOOK_SECRET` | for payments | Verifies webhook deliveries. |
| `RESEND_API_KEY` | for email | Reminders, receipts and admin alerts. |
| `EMAIL_FROM` | for email | Verified sender, e.g. `BirthdayGen <hello@yourdomain.com>`. |
| `EMAIL_REPLY_TO` | optional | Reply-to address for reminder emails. |
| `EMAIL_TOKEN_SECRET` | optional | Signs unsubscribe links. Falls back to `CRON_SECRET`, then `RAZORPAY_KEY_SECRET`. |
| `ALERT_FROM_EMAIL` / `ALERT_TO_EMAIL` | for alerts | Internal failure alerts. |
| `R2_ACCOUNT_ID` | yes | Cloudflare R2 S3 endpoint account id. |
| `R2_ACCESS_KEY_ID` / `R2_SECRET_ACCESS_KEY` | yes | R2 S3 credentials. |
| `R2_BUCKET_NAME` | recommended | Defaults to `birthday-card-assets`. |
| `R2_PUBLIC_DOMAIN` | recommended | Public bucket origin, e.g. `https://pub-….r2.dev`. Also used for stored OG images. |
| `BLOB_READ_WRITE_TOKEN` | recommended | Vercel Blob token. Used for the R2 fallback and for browser → Blob uploads over 4MB. Create a Blob store in the Vercel dashboard; the token is added automatically. |
| `NEXT_PUBLIC_SUPPORT_WHATSAPP` | optional | Support button destination. |
| `NEXT_PUBLIC_DEMO_VIDEO_URL` | optional | Demo video in SEO markup. |
| `STATS_TOKEN` | optional | Enables the private `/api/stats?token=…` dashboard. Unset disables it. |
| `NEXT_PUBLIC_GA_ID` | optional | Google Analytics. |
| `NEXT_PUBLIC_ENABLE_ADS` / `NEXT_PUBLIC_ENABLE_AFFILIATE` / `NEXT_PUBLIC_ENABLE_PRO_TIER` | optional | Monetization feature flags. |
| `NEXT_PUBLIC_ADSENSE_ID` | optional | AdSense publisher id when ads are enabled. |

### Database migrations

Migrations are not run by the build. `prisma/migrations` now contains a single
Postgres baseline that matches `prisma/schema.prisma`.

For a brand-new database:

```bash
PRISMA_DATABASE_URL="prisma+postgres://…" \
POSTGRES_URL="postgres://…" \
pnpm prisma migrate deploy
```

The existing production database was created before migration history was
tracked. Baseline it once so Prisma knows the schema is already applied (this
only records the migration; it does not change tables):

```bash
PRISMA_DATABASE_URL="prisma+postgres://…" \
POSTGRES_URL="postgres://…" \
pnpm prisma migrate resolve --applied 20261107000000_baseline
```

After that, `pnpm prisma migrate deploy` applies only new migrations. The local
`.env` can use a direct Postgres URL for `PRISMA_DATABASE_URL`; the standard
client generated by the build works with both direct Postgres and Accelerate.

### Cron jobs

`vercel.json` schedules four jobs, all once per day so they work on the Vercel
Hobby plan:

| Path | Schedule | What it does |
| --- | --- | --- |
| `/api/cron/delivery` | daily 03:00 UTC (08:30–09:30 IST) | Sends cards whose chosen delivery date has arrived, or WhatsApp-assist emails. |
| `/api/cron/cleanup` | daily 04:00 UTC | Deletes expired and orphaned media from R2 and Vercel Blob. |
| `/api/cron/reminders` | daily 05:00 UTC | Annual birthday reminder emails. |
| `/api/cron/recovery` | daily 06:00 UTC | Abandoned-checkout recovery emails (24 hours to 7 days old). |

Vercel automatically adds the `Authorization: Bearer $CRON_SECRET` header.
Every cron route refuses to run in production when the secret is missing.
Hobby cron timing is per-hour (±59 minutes), so delivery is a morning window,
not an exact minute.

### Media uploads

- Small photo/audio uploads go to Cloudflare R2 through its S3-compatible API.
  This keeps every existing card working without moving stored objects.
- If R2 is unavailable, the server falls back to Vercel Blob.
- Files over 4MB (mainly custom songs) bypass the 4.5MB serverless request-body
  limit and upload directly from the browser to Vercel Blob through
  `/api/upload/blob`. `BLOB_READ_WRITE_TOKEN` is required for that path.
- The cleanup cron understands both providers: R2 URLs are deleted by S3 key,
  and `vercel-storage.com` URLs are deleted with `@vercel/blob`.

### Deploying

Connect the repository to Vercel and deploy from Git, or run:

```bash
vercel --prod
```

# Birthday-Card-Generator
