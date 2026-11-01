# QuickShow

QuickShow is a movie-ticket booking website where visitors can discover movies, choose a showtime and seats, and pay online.

## Live website

[Open QuickShow](https://quickshow-95gj.vercel.app)

## Features

- Browse movies and view movie details, trailers, and available showtimes.
- Choose seats and create a ticket booking.
- Sign in with Clerk and manage favorite movies.
- Pay for bookings through Stripe Checkout and review bookings in **My Bookings**.
- Admin pages for show management, bookings, and dashboard information.
- Send booking confirmation emails after successful payment.
- Automatically release seats and remove bookings that remain unpaid after 10 minutes.

## Built with

- **Frontend:** React, Vite, Tailwind CSS, React Router
- **Backend:** Node.js, Express
- **Database:** MongoDB with Mongoose
- **Authentication:** Clerk
- **Movie data:** Watchmode
- **Payments:** Stripe
- **Background workflows:** Inngest
- **Email:** Nodemailer with Brevo SMTP
- **Deployment:** Vercel

## Run locally

Requirements: Node.js and access to configured MongoDB, Clerk, Watchmode, Stripe, and Inngest accounts. Brevo SMTP settings are needed for email delivery.

1. Install server dependencies:

   ```bash
   cd server
   npm install
   ```

2. Create `server/.env` with the server variables listed below.

3. Start the API server:

   ```bash
   npm run server
   ```

4. In a second terminal, install and start the frontend:

   ```bash
   cd client
   npm install
   npm run dev
   ```

5. Open the Vite URL printed in the terminal (normally `http://localhost:5173`).

## Environment variables

Create local `.env` files; never commit real credentials.

### `server/.env`

```env
MONGODB_URL=
CLERK_SECRET_KEY=
WATCHMODE_API_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_KEY=
INNGEST_EVENT_KEY=
INNGEST_SIGNING_KEY=
SENDER_EMAIL=
SMTP_USER=
SMTP_PASS=
```

Configure the Stripe webhook to send events to the server's `/api/stripe` endpoint. Configure the Inngest app to use the server's `/api/inngest` endpoint.

### `client/.env`

```env
VITE_CLERK_PUBLISHABLE_KEY=
VITE_BASE_URL=http://localhost:3000
VITE_CURRENCY=$
```

For a deployed frontend, set `VITE_BASE_URL` to the deployed API server URL and configure the variables in the hosting provider's environment settings. Vite environment variables are included in the client build, so do not put secrets in `client/.env`.

## Project structure

```text
client/   React frontend
server/   Express API, database models, Stripe webhook, and Inngest workflows
```

## Useful commands

From `client/`:

```bash
npm run dev
npm run build
npm run lint
```

From `server/`:

```bash
npm run server
npm start
```
