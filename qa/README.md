# Browser QA suite

One command, local-only.

```bash
npm run qa
```

That command:

1. Starts Postgres 16 in Docker on `127.0.0.1:5433` (data is ephemeral).
2. Regenerates the Prisma client against the local database.
3. Starts Next dev on `127.0.0.1:3100` with `NEXT_DIST_DIR=.next-qa`.
4. Pushes the schema, wipes the QA tables, and runs the Playwright suite,
   including the real Razorpay test-mode spec when a test key pair is present.

The developer's `.env` is never used for production writes: `qa/env.js` forces
the QA database URL and blanks `R2_*`, `RESEND_API_KEY`, and
`BLOB_READ_WRITE_TOKEN`. It does auto-detect a Razorpay *test* key pair
(`rzp_test_...`) from the gitignored `.env` or explicit `QA_RAZORPAY_*` env, so
the real test-mode checkout runs by default. Live keys are ignored and rejected
under explicit opt-in. It refuses to run against a non-local DB host unless
`QA_ALLOW_REMOTE=1` is set for a dedicated QA database.

## Useful commands

| Command | What it does |
| --- | --- |
| `npm run qa` | Full suite (includes Razorpay test mode when test keys exist) |
| `npm run qa:smoke` | `@smoke` subset |
| `npm run qa:critical` | `@critical` subset |
| `npm run qa:razorpay` | Razorpay test-mode spec only (auto-loads test keys) |
| `npm run qa:ui` | Playwright UI mode |
| `npm run qa:headed` | Headed Chromium |
| `npm run qa:setup` | Docker + Prisma + schema only |
| `npm run qa:db` | Start the QA database without running tests |
| `npm run qa:db:stop` | Stop the container and drop its data volume |
| `npm run qa:report` | Open the last HTML report |

After `npm run qa:db`, you can run subsets directly:

```bash
npm run qa:setup
npx playwright test e2e/share-tracking.spec.js
```

## What is covered

- Public pages, OG image, robots, and 404s.
- Three-step free card creation, validation, edit-token storage, success modal,
  clipboard copy, and creator ownership.
- Gift reveal, candles (mic + tap fallback), love dedupe, view dedupe, photo
  caps, preview no-op, and owner-only tools.
- Share tracking: creator modal + footer, channel/source rows, 6-hour/session
  dedupe, new-session counting, preview skip, legacy counter reconciliation.
- Photo upload: the real form UI with `/api/upload` mocked at the network
  boundary, plus upload API validation (missing/unsupported/oversized).
- VIP card checkout in test mode, VIP photo cap, customizer save, premium
  universe checkout in test mode, and a seeded paid magic link.
- API contracts: create/edit auth, view/love/share endpoints, stats auth,
  support tracking, and cleanup retention.
- Analytics CLI JSON: event-time shares, channel/source rows, legacy counter.

## Razorpay test-mode coverage

`npm run qa` automatically loads a *test* key pair from the gitignored `.env`
(keys named `RAZORPAY_KEY_ID`/`NEXT_PUBLIC_RAZORPAY_KEY_ID` and
`RAZORPAY_KEY_SECRET`). To run just that flow:

```bash
npm run qa:razorpay
```

You can also pass the pair explicitly; this wins over `.env`:

```bash
QA_ALLOW_RAZORPAY=1 \
QA_RAZORPAY_KEY_ID=rzp_test_... \
QA_RAZORPAY_KEY_SECRET=... \
npm run qa:razorpay
```

Only key IDs starting with `rzp_test_` are used. Live keys (`rzp_live_...`) are
ignored by the default run and rejected when `QA_ALLOW_RAZORPAY=1` is set.
`QA_ALLOW_RAZORPAY=0` disables Razorpay even when test keys are present, for a
keyless/offline run. The spec creates real test-mode orders (no money moves),
asserts the hosted payment UI rendered, and verifies a signed test payment end
to end: DB order paid, card VIP unlocked, and magic link unlocked. The final
card/UPI entry inside Razorpay's hosted modal is still a manual step. Never
commit the key secret; `.env` is gitignored and stays local.

Because the default run creates real test-mode orders when keys are configured,
it needs network access to Razorpay. Use `QA_ALLOW_RAZORPAY=0` offline.

## Deliberately manual

The default suite covers the failure-safe path (test-mode unlock) and the paid
magic link. The Razorpay spec (included by default when test keys are
configured) covers real order creation, hosted checkout rendering, and signed
verification. Entering a test card or UPI ID inside Razorpay's hosted modal
remains a human step. No test ever writes to live R2, Resend, or a production
database.

## Artifacts

Failures keep traces, screenshots, and video under `test-results/`; the HTML
report is written to `playwright-report/` and opened with `npm run qa:report`.
