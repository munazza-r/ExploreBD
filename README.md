# ExploreBD — Integrated Modules 1, 2, and 3

This workspace now runs the three member features as one application:

- Module 1: direct signup, login, guide profile, and tourist profile
- Module 2: authenticated two-way guide/tourist messaging
- Module 3: tourist QR pass generation and guide-only QR scanning/verification

All persistent data uses one MongoDB database. The unified backend accepts either `MONGO_URI` or `DATABASE_URL`. For this local merge it automatically reuses the existing `mod-2/backend/.env` MongoDB URL when the unified backend does not have its own `.env`; it does not create or copy another database configuration.

## First-time setup

From `/Users/md.muntasirrahmanlayek/Desktop/ExploreBD`:

```bash
npm run setup
```

Copy `mod-1/CSE471-project/member3-mod1-backend/.env.example` to `.env` in the same backend directory. Set:

- `MONGO_URI` only if you do not want to reuse the existing Module 2 `DATABASE_URL`
- `JWT_SECRET` and `QR_PASS_SECRET` to long random values
- Gmail OTP is temporarily disabled in the active signup form. The optional Gmail settings in `.env.example` are retained for re-enabling it later.

If the system resolver refuses an Atlas SRV lookup, the backend retries with `8.8.8.8` and `1.1.1.1`. You can override those fallback resolvers with `MONGO_DNS_SERVERS` in the local `.env`.

For an offline UI/backend check only, `EMAIL_MODE=console` prints the OTP in the backend terminal in non-production mode.

## Run locally

```bash
npm run dev
```

Open [http://127.0.0.1:5053](http://127.0.0.1:5053). The command builds the existing Module 2 and Module 3 React UIs, then serves every module from the same origin so one login session works everywhere.

## Role flow

- A tourist lands on `tourist-profile.html`, can open Messages, and can generate/download their own QR booking pass.
- A guide lands on `guide-profile.html`, can open Messages, and sees only the QR scanner/verification workspace.
- Messages are stored with authenticated sender and recipient IDs. A guide message appears for that tourist, and the tourist reply appears for that guide.
- The QR pass contains a signed, expiring token. Only the guide assigned in the MongoDB booking can verify it.

## Verification

```bash
npm test
```

This runs backend QR security tests and production-build checks for both React frontends.
