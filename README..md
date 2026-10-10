# Clinic Queue System

A real-time clinic token and waiting-room system. Patients book a token, the doctor claims and treats patients, and every waiting-room screen updates live.

## Features

- Register / login with role-based access (patient, doctor)
- Patients book tokens; each doctor has a separate daily queue
- Doctor panel with Claim and Treated actions
- Live waiting-room screen using Socket.IO (no page refresh)
- Email confirmation when a token is booked (Nodemailer)
- Daily cron job that cancels leftover tokens from previous days (Node-Cron)

## Tech Stack

Node.js, Express, EJS, Bootstrap, MongoDB (Mongoose), Redis, Socket.IO, JWT (httpOnly cookie), bcrypt, Nodemailer, Node-Cron

## How the hard parts work

**Race condition on claiming a token**
Claiming uses a single atomic MongoDB `findOneAndUpdate` with the condition `status: "waiting"`. If many requests hit the same token at once, only one succeeds and the rest get `409`. A unique index on `(doctor, queueDate, number)` is a second safety net.

Tested with 10 parallel claim requests: 1 succeeded (200), 9 rejected (409). Run it with `node scripts/testClaim.js`.

**Token numbers**
Redis `INCR` gives each booking a unique, increasing number per doctor per day, even under concurrent bookings.

**Live updates**
Each doctor has a Socket.IO room (`doctor:<id>`). After book, claim or treated, the server emits `queue:update` to that room.

**Auth**
Passwords are hashed with bcrypt. A JWT is stored in an httpOnly cookie. `protect` and `authorize(role)` middleware guard the routes.

## Setup

```bash
git clone https://github.com/GayatriB06/clinic-queue.git
cd clinic-queue
npm install
```

Create a `.env` file (see `.env.example`):

```
PORT=3000
MONGO_URI=
JWT_SECRET=
REDIS_URL=
MAIL_USER=
MAIL_PASS=
```

Create a doctor account, then start the server:

```bash
node scripts/createDoctor.js
npm run dev
```

## Pages

- `/register`, `/login`: authentication
- `/doctor`: doctor panel (doctor role only)
- `/waiting/:doctorId`: live waiting-room screen

## Scripts

- `scripts/createDoctor.js`: creates a test doctor
- `scripts/bookToken.js`: books a test token
- `scripts/testClaim.js`: race-condition test (10 parallel claims)
- `scripts/testCron.js`: tests the cleanup logic

## Note

Built as a learning project with AI assistance (Claude) while learning backend development.