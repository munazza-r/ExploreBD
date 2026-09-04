# ExploreBD - Module 3, Feature 3

QR-Based Booking Verification System for CSE471 Group 10.

After a successful payment, a tourist receives a signed QR booking pass. The assigned guide can scan the QR code during the trip and verify the booking without exposing private contact or payment details inside the QR payload.

## What is included

- Polished tourist booking-pass screen with a downloadable and printable QR pass
- Guide verification workspace with camera scanning, image upload, and manual-code fallback
- HMAC-signed, time-limited QR tokens
- Checks for payment state, assigned guide, booking/pass identity, expiry, and duplicate scans
- Friendly local demo data and one-click reset
- Responsive UI carried forward from the emerald/teal ExploreBD design language
- Express backend and React + Vite + Tailwind CSS frontend

## Run locally

Requirements: Node.js 20.19+ (or 22.12+) and npm.

```bash
npm install
npm run dev
```

Open `http://localhost:5173`. The API runs on `http://127.0.0.1:5073`.

No database or external service is required for the demonstration. Demo bookings are held in memory and reset when the backend restarts. For a real deployment, set a strong `QR_PASS_SECRET` and replace the demo store with the project's authenticated MongoDB/Prisma booking repository.

## Useful scripts

```bash
npm run dev       # frontend and backend together
npm run build     # production frontend build
npm test          # backend security tests + frontend build
npm start         # serve the API and built frontend
```

## Environment variables

Copy `backend/.env.example` to `backend/.env` only when you want to override the local defaults. The frontend uses Vite's `/api` proxy in development.

## Demo flow

1. Open **Booking pass** as the tourist.
2. Download/print the pass or select **Open guide verifier**.
3. On **Guide verify**, scan the pass with a camera, upload a QR screenshot, or use the loaded demo pass.
4. A successful first scan checks the tourist in. A repeated scan is recognized safely as already verified.
