# Golf Charity Subscription Platform ⛳️

A full-stack web application designed for a golf charity subscription service. Users can subscribe, enter their golf scores, participate in monthly lucky draws, and win payouts, while unmatched funds are automatically donated to selected charities.

## 🚀 Live Deployments
- **Frontend (UI):** Securely deployed on **Vercel** (HTTPS) -> `[Insert your Vercel Link Here]`
- **Backend (API):** Securely deployed on **Microsoft Azure** (HTTPS) -> `[Insert your Azure Link Here]`

*Note: Access to the production Backend APIs is handled safely over HTTPS to ensure no mixed-content blocking occurs on modern web browsers.*

## 💻 Tech Stack
- **Frontend:** React.js, Vite, Tailwind CSS, Axios, React Router, Lucide React
- **Backend:** Node.js, Express.js, JSON Web Tokens (JWT) for Auth, node-cron
- **Database:** MongoDB (Atlas) via Mongoose

## ✨ Key Features
- **User Authentication:** Secure JWT-based registration and login for both standard users and administrators.
- **Player Dashboard:** Users dynamically enter their stableford golf scores (range 1-45). The system maintains a rolling array of their latest 5 scores, which automatically converts into their "Lucky Pick 5" numbers for the monthly draw.
- **Automated Monthly Draws:** 
  - Admins can trigger the draw logic. 
  - System automatically splits the subscription revenue pool between 5-matches, 4-matches, and 3-matches.
  - Missed jackpots automatically "rollover" into next month's pool.
  - Automatically calculates and attributes charitable donations.
- **Winner Claims & Payouts:** If a user wins a draw, their payout status becomes pending until they upload an image URL proving their winning golf score.
- **Admin Command Center:** 
  - Dedicated tabbed interface to manage user lists and delete accounts.
  - Track total system telemetry (revenue, active participants).
  - Manage and feature dynamic Charity Organizations.
  - Single-click approval for verifying and unlocking pending UI payouts.

## 🛠 Local Setup & Installation

### Prerequisites
- Node.js installed on your machine
- A MongoDB Cluster URI (e.g., MongoDB Atlas)

### 1. Clone the repository
```bash
git clone https://github.com/anant1947x/assessment_intern.git
cd assessment_intern
```

### 2. Backend Setup
Install root dependencies:
```bash
npm install
```
Create a `.env` file in the root directory:
```properties
MONGODB_URI="mongodb+srv://<db_user>:<db_pass>@cluster0...mongodb.net/golf-charity"
ADMIN_EMAIL="admin@platform.com"
ADMIN_PASSWORD="Admin123!"
PORT=5001
```
Start the backend Express server:
```bash
npm start
```

### 3. Frontend Setup
Open a second terminal, navigate to the frontend folder, and install dependencies:
```bash
cd frontend
npm install
```
Create a `.env` file directly inside the `frontend/` folder:
```properties
VITE_API_URL="http://localhost:5001"
```
*(Note for Production: If deployed on Vercel, inject the Azure HTTPS URL as `VITE_API_URL` without the `/api` route path, as the frontend architecture appends it programmatically).*

Start the frontend Vite server:
```bash
npm run dev
```

Visit `http://localhost:5173` to view up your local instance.
