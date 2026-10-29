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
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
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
| `CRON_SECRET` | reminder cron | Vercel Cron sends it automatically. In production `/api/cron/reminders` refuses to run without it, so the endpoint can never be triggered by strangers. |
| `NEXT_PUBLIC_SITE_URL` | email links | Absolute card / unsubscribe URLs. Defaults to `https://birthday.nirbhay.online`. |

The reminder sweep runs daily at 05:00 UTC via `vercel.json`. A card gets one
email per birthday, inside the 7-day window before it. Cards without a
birthday date, and cards created fewer than 30 days before the birthday, are
skipped. Unsubscribing sets `reminderOptOutAt`; the card and its photos stay
saved.

Apply the additive database migration before deploying (run this SQL file in
your database, or use `prisma db push` in a disposable environment):

```bash
prisma/migrations/20261027000000_email_delivery/migration.sql
```

Preview the reminder queue locally without sending anything:

```bash
curl "http://localhost:3000/api/cron/reminders?dryRun=1"

# If CRON_SECRET is also set in your local .env:
curl -H "Authorization: Bearer $CRON_SECRET" \
  "http://localhost:3000/api/cron/reminders?dryRun=1"
```

# Birthday-Card-Generator
