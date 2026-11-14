# ExploreBD - Smart Tourist Guide and Booking System

ExploreBD is a web marketplace that connects tourists in Bangladesh with verified student and local guides. Tourists can find a guide, book a tour, pay securely and plan their trip in one place. Guides get a structured way to earn from their language skills and local knowledge.

**Website link:** [ExploreBD](https://cse-471-project-delta.vercel.app)

Built for the course CSE471: System Analysis and Design, BRAC University.

## Features

- **Role-based accounts** for Tourists, Student Guides and Admins
- **Guide verification:** guides upload Student ID, university details and NID/Passport and admins approve or reject them. Confirmations go out by email.
- **Smart guide matching:** search and filter guides by location, language, rating, experience and budget
- **Guide profiles and tour packages:** live preview, with publish or save as draft
- **Booking and scheduling:** pick a date, time, package and guide
- **Meeting points on Google Maps:** the app suggests points near the midpoint between tourist and guide, the guide approves some and the tourist picks the final one from the approved meeting points.
- **In-app chat:** talk before paying, without sharing phone numbers
- **AI itinerary builder:** day-by-day plans and guide recommendations from Google Gemini
- **Escrow payments** through SSLCOMMERZ (bKash, Nagad, Rocket, cards). Funds are held until the tour is completed.
- **Automatic commission and payouts** shown on the guide's earnings dashboard
- **QR booking pass:** the guide scans it to check in the tourist
- **Cancellations, refunds and SOS requests:** handled by admins, with SOS given priority

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React (Vite), React Router, Tailwind CSS |
| Backend | Node.js, Express |
| Database | MongoDB with Prisma |
| External APIs | Google Maps Embed, Google Gemini, Gmail API, SSLCOMMERZ, HTML5 QR scanner |
| Deployment | Vercel & Render |

## Getting Started

**Prerequisites:** Node.js 18+ and a MongoDB database (e.g. MongoDB Atlas)

```bash
git clone https://github.com/munazza-r/CSE471-project.git
cd CSE471-project
```

**Backend**

```bash
cd backend
npm install
cp .env.example .env   # add your DATABASE_URL, JWT secret and API keys
npx prisma generate
npx prisma db push
npm run dev
```

**Frontend** (in a second terminal)

```bash
cd frontend
npm install
cp .env.example .env   # set VITE_API_URL to your backend URL
npm run dev
```

Google Maps, Gemini and SSLCOMMERZ keys are optional for local testing. The meeting point feature falls back to sample map data when no Maps key is set.

## Team

| Member | Features |
|---|---|
| (**Munazza Binte Rafiq**)[https://github.com/munazza-r] | Smart guide matching, Google Maps meeting points, payment release and commission |
| (Md. Muntasir Rahman Layek)[https://github.com/MRL-World] | Guide profiles and auth, in-app chat, QR booking verification |
| (Taseen Nujaira)[https://github.com/taseennujaira-sys] | Tour packages, AI itinerary builder, cancellations, refunds and SOS |
| Mohammad Asif Al Mahfuz | Guide verification, booking and scheduling, escrow payments |
