# ExploreBD — Module 3 Standalone

This folder contains only the QR booking-pass feature extracted from the merged ExploreBD application. It keeps the same tourist pass UI, guide scanner UI, MongoDB booking model, signed pass verification, payment/assignment checks, duplicate-scan protection, and deleted-guide relinking behavior.

## Role flow

- Sign in with an existing ExploreBD tourist account to generate and download that tourist's booking QR.
- Sign out, then sign in with the assigned guide account to scan or upload the QR and verify the booking.
- Authentication, booking data, pass status, and verification timestamps come from the same MongoDB database used by the merged project.

Account registration and messaging are intentionally not included because they belong to Modules 1 and 2.

## Run locally

```bash
npm install
npm run dev
```

Open `http://127.0.0.1:5173`. The API runs on `http://127.0.0.1:5073`.

The local `backend/.env` reuses the existing ExploreBD MongoDB URL and is ignored by Git. For a new machine, copy `backend/.env.example` to `backend/.env` and add the database URL and secrets.

## Verify

```bash
npm test
```

This runs the QR signature tests and a production frontend build.
