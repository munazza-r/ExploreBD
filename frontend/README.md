# ExploreBD — Unified Frontend

One React app (Vite + React Router + Tailwind) covering all 11 backend features, talking to your single unified backend on port 5050.

## Setup

```bash
npm install
cp .env.example .env
npm run dev
```

`.env` already points at `http://localhost:5050/api` — change it only if your backend runs elsewhere.

Make sure your unified **backend** is running first (`npm run dev` in that project), then start this frontend.

## How routing works

- `/login`, `/register` — public
- `/` — redirects based on role: Tourist → `/guides`, Guide → `/guide-profile`, Admin → `/admin/verification`
- Every other route is protected — some open to any logged-in user, some locked to a specific role (see `App.jsx`)
- The Navbar automatically shows different links depending on whether you're logged in as a Tourist, Guide, or Admin

## What's genuinely new here (didn't exist as React pages before)

- **Login / Register** — the actual auth UI, using Muntasir's backend
- **Guide Profile settings** — the guide's own profile editor (original was plain HTML/JS)
- **Verification admin queue** — approve/reject guide documents with image previews
- **Payment pages** — tourist checkout/tracking, guide earnings, admin oversight (the release/commission UI existed before, but tourist-facing escrow checkout + admin views are new)
- **QR Pass pages** — issue/scan, adapted from Muntasir's token logic to work with the real Booking/Payment models
- **Support page** — cancellation, compensation claims, and SOS forms (backend existed, no React UI existed before)

## Known simplifications worth knowing about

- **QR passes display as a copyable text token**, not a rendered QR code image. Adding a real QR image is a small addition (e.g. the `qrcode.react` package) if you want that polish for your demo.
- **`/api/payments/:id` has no ownership check** on the backend — any logged-in user can look up any payment by ID if they know it. Fine for a class project, but worth tightening (add a check that `payment.touristId === req.user.id` or the user is an admin/the assigned guide) before treating this as production-ready.
- **Meeting creation isn't automatically triggered** by a booking being accepted — right now you create a meeting manually via `POST /api/meetings`. Wiring `bookingController.updateBookingStatus` to also create a `Meeting` when status becomes `ACCEPT` would close this gap nicely later.
- **Chat uses one shared `conversationId`** ("demo-1") for everyone, not per-booking conversations. Fine for demoing the feature; real per-booking conversations would need `conversationId` tied to a real `Booking.id`.
- **`My Payments` and `QR Pass`** require typing in a real Booking ID and Guide ID manually, since there's no "my accepted bookings" dropdown yet — copy these from your `Booking` collection in Atlas, or from the Bookings page's data, while testing.

None of these block the app from working end to end — they're just places you (or your team) might want to polish before final submission, consistent with how you've been reviewing each backend phase.

## Testing checklist

1. Register a Tourist and a Guide (Guide needs a `university` field)
2. As Guide: fill out Guide Profile, submit Verification, create a Tour Package
3. As an Admin (manually promote a user's role to ADMIN in Atlas): approve the verification
4. As Tourist: search guides, send a booking request
5. As Guide: accept the booking
6. As Tourist: create a meeting request, then as Guide approve meeting points, then as Tourist confirm
7. Try the chat between the two accounts (open two browsers/incognito windows, one logged in as each)
8. Try the Itinerary Builder
9. Test payments: initiate as tourist, manually set to `ESCROW_HELD` in Atlas, mark complete, release as admin, check guide earnings
10. Test QR pass: issue as tourist, scan/verify as guide
11. Test Support: submit a cancellation and an SOS alert, review both as admin

This mirrors the same Postman flow you've already tested on the backend — just through the actual UI now.
