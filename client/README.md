# 🎬 QuickShow — Movie Ticket Booking Platform

> **Discover movies. Choose your seats. Book your show. Enjoy the experience. 🍿**

**QuickShow** is a full-stack movie ticket booking platform built with the **MERN stack**. It allows users to explore movies, view showtimes, select seats, make secure online payments, and receive booking confirmations.

The project also includes an **admin dashboard** for managing movies, shows, bookings, and the overall cinema experience.

### 🌐 Live Demo

🚀 **[Visit QuickShow](https://quickshow-95gj.vercel.app/)**

---

## ✨ Features

### 🎥 For Users

- 🔍 Browse and explore movies
- 🎬 View movie details
- 🕐 Explore available showtimes
- 💺 Interactive seat selection
- 🎟️ Book movie tickets
- ❤️ Add movies to favorites
- 📋 View booking history
- 💳 Secure Stripe payment integration
- 📧 Booking confirmation emails
- 👤 Clerk authentication
- 📱 Responsive user interface

### 👨‍💼 Admin Dashboard

- 📊 Admin dashboard with booking/show information
- 🎬 Add new movies and shows
- 📋 View all shows
- 🎟️ Manage bookings
- 👥 Manage users
- 📈 Monitor booking activity
- 🔐 Protected admin routes

### ⚡ Automated Background Tasks

QuickShow uses **Inngest** for background workflows, including:

- ⏳ Checking unpaid bookings
- 💺 Releasing seats when payment is not completed
- 🗑️ Removing expired bookings
- 📧 Sending booking confirmation emails
- 🔄 Synchronizing Clerk users with MongoDB

---

## 🛠️ Tech Stack

### Frontend

| Technology | Purpose |
|---|---|
| ⚛️ React | User interface |
| ⚡ Vite | Frontend development & build |
| 🎨 Tailwind CSS | Styling |
| 🧭 React Router | Application routing |
| 🔐 Clerk | Authentication |
| 💳 Stripe | Online payments |
| 📡 Axios | API communication |

### Backend

| Technology | Purpose |
|---|---|
| 🟢 Node.js | Backend runtime |
| 🚂 Express.js | REST API |
| 🍃 MongoDB | Database |
| 🐍 Mongoose | MongoDB ODM |
| 🔐 Clerk | Authentication |
| 💳 Stripe | Payment processing |
| ⚡ Inngest | Background jobs & workflows |

### Deployment

- ▲ Vercel
- 🐙 GitHub
- 🍃 MongoDB Atlas

---

## 🏗️ Application Architecture

```text
                    ┌─────────────────────┐
                    │      QuickShow      │
                    │   Movie Platform    │
                    └──────────┬──────────┘
                               │
                ┌──────────────┴──────────────┐
                │                             │
        ┌───────▼────────┐           ┌────────▼───────┐
        │    Frontend    │           │     Backend    │
        │     React      │◄─────────►│ Node + Express │
        │     Vite       │   API     │                │
        └───────┬────────┘           └────────┬───────┘
                │                             │
        ┌───────▼────────┐           ┌────────▼────────┐
        │     Clerk      │           │    MongoDB       │
        │ Authentication │           │     Atlas        │
        └────────────────┘           └─────────────────┘
                                             │
                         ┌───────────────────┼──────────────────┐
                         │                   │                  │
                  ┌──────▼──────┐    ┌──────▼──────┐   ┌──────▼──────┐
                  │    Stripe   │    │   Inngest   │   │   Watchmode  │
                  │   Payments  │    │ Background  │   │ Movie Data   │
                  └─────────────┘    │   Jobs      │   └─────────────┘
                                     └─────────────┘
```

---

## 📂 Project Structure

```text
QUICKSHOW/
│
├── client/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   │   └── admin/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
├── server/
│   ├── configs/
│   ├── controllers/
│   ├── inngest/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── server.js
│   └── package.json
│
├── .gitignore
└── README.md
```

---

## 🔐 Authentication

QuickShow uses **Clerk** for authentication.

Users can securely sign in and access protected features such as:

- 🎟️ Ticket booking
- ❤️ Favorites
- 📋 Booking history
- 👤 User profile

Admin functionality is protected using server-side authorization.

---

## 🎟️ Movie Booking Flow

The booking process works like this:

```text
Choose Movie
     ↓
Select Show
     ↓
Choose Seats
     ↓
Create Booking
     ↓
Proceed to Payment
     ↓
Stripe Payment
     ↓
Payment Successful
     ↓
Booking Confirmed
     ↓
Confirmation Email 📧
```

If payment is not completed within the allowed time, Inngest automatically processes the booking and releases the reserved seats.

---

## 💳 Payment Integration

QuickShow integrates **Stripe** for secure online ticket payments.

The application handles:

- Payment creation
- Payment verification
- Booking status
- Stripe webhook events
- Failed/uncompleted payments
- Automatic seat release

> 🔒 Secret keys and environment variables are never committed to GitHub.

---

## 📧 Booking Confirmation

After a successful booking, QuickShow can send a confirmation email containing information such as:

- 👤 Customer name
- 🎬 Movie name
- 📅 Show date
- 🕐 Show time
- 🎟️ Booking confirmation

---

## ⚡ Inngest Background Jobs

Inngest is used to handle asynchronous workflows.

For example:

```text
User books seats
       ↓
Booking created
       ↓
Wait for payment
       ↓
Payment completed?
     ↙       ↘
   YES        NO
    ↓          ↓
Keep seats   Release seats
    ↓          ↓
Send email   Delete booking
```

This prevents unpaid bookings from permanently blocking seats.

---

## 🗄️ Database

QuickShow uses **MongoDB Atlas** with Mongoose.

Main models include:

```text
User
Movie
Show
Booking
```

Relationships between movies, shows, users, and bookings allow the application to manage the complete booking lifecycle.

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/NarmataGoel/QUICKSHOW.git

cd QUICKSHOW
```

### 2. Install frontend dependencies

```bash
cd client
npm install
```

### 3. Install backend dependencies

```bash
cd ../server
npm install
```

---

## 🔑 Environment Variables

Create a `.env` file inside both `client` and `server`.

### Client

```env
VITE_CURRENCY=$
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
VITE_BASE_URL=your_backend_url
```

### Server

```env
MONGODB_URI=your_mongodb_connection_string

CLERK_SECRET_KEY=your_clerk_secret_key

STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

WATCHMODE_API_KEY=your_watchmode_api_key

INNGEST_EVENT_KEY=your_inngest_event_key
INNGEST_SIGNING_KEY=your_inngest_signing_key
```

> ⚠️ **Never commit `.env` files or secret API keys to GitHub.**

---

## ▶️ Run the Project Locally

### Start the backend

```bash
cd server
npm run server
```

### Start the frontend

Open another terminal:

```bash
cd client
npm run dev
```

Then open the local Vite URL shown in your terminal.

---

## 🌍 Deployment

The application is deployed using **Vercel**.

```text
GitHub
   ↓
Push to main
   ↓
Vercel detects changes
   ↓
Build
   ↓
Deployment
   ↓
Live QuickShow 🚀
```

Live application:

### 🎬 [QuickShow](https://quickshow-95gj.vercel.app/)

---

## 🛡️ Security

QuickShow follows several security practices:

- 🔐 Authentication through Clerk
- 🛡️ Protected admin routes
- 🔑 Environment variables for sensitive credentials
- 💳 Stripe server-side payment handling
- 🚫 Secret keys excluded from Git
- 🗄️ MongoDB Atlas database security
- 🔒 Server-side authorization checks

---

## 📸 Project Highlights

### 🎬 Movie Discovery

Explore available movies and discover their details before booking.

### 💺 Interactive Seat Selection

Choose available seats through an interactive booking interface.

### 🎟️ Booking Management

Users can review their previous bookings and manage their movie-ticket experience.

### 👨‍💼 Admin Dashboard

Administrators can manage shows, movies, and bookings from a dedicated dashboard.

---

## 💡 What I Learned

Building QuickShow helped me gain practical experience with:

- Building a full-stack MERN application
- React component architecture
- React Context API
- REST API development
- MongoDB data modeling
- Authentication with Clerk
- Payment integration with Stripe
- Webhooks
- Background jobs with Inngest
- Protected admin routes
- API integration
- Git and GitHub workflows
- Vercel deployment
- Production debugging

---

## 🚧 Future Improvements

Some features that could be added in future versions:

- ⭐ Movie ratings and reviews
- 🔎 Advanced movie search
- 🎭 Genre-based filtering
- 🔔 Booking reminders
- 🎫 Downloadable tickets
- 📱 Progressive Web App support
- 🌐 More payment methods
- 📊 More detailed admin analytics

---

## 👩‍💻 Author

### Narmata Goel

Full-stack developer passionate about building modern web applications with React, Node.js, and MongoDB.

**Project:** QuickShow — Movie Ticket Booking Platform 🎬

🌐 **Live:** [quickshow-95gj.vercel.app](https://quickshow-95gj.vercel.app/)

---

## ⭐ Support

If you found this project interesting, consider giving the repository a ⭐ on GitHub.

---

### 🎬 QuickShow

**Book your seat. Watch your movie. Enjoy the show. 🍿**