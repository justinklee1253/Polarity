# 🧠 MintMind — Smarter Budgeting for College Students

MintMind is a web application that helps college students gain control of their spending by combining traditional budgeting tools with AI-powered financial insights. The app encourages responsible financial behavior through intelligent dashboards, reminders, and a personal budgeting assistant.

---

## 💡 Problem

College students often struggle with:

- Peer pressure and impulsive spending (e.g., partying, gambling, takeout).
- Lack of accountability and financial education.
- No centralized way to visualize income vs. expenses.

---

## ✅ Solution

MintMind provides:

- 📊 A visual, mobile-friendly **budget dashboard**.
- ✍️ Easy input for tracking income and expenses.
- ⏰ **Smart reminders** when users approach their budget limits.
- 🤖 An AI-powered assistant ("Ask Minty") that gives personal spending advice and budgeting insights.

---

## 🚀 MVP Features

- **User Authentication**: Signup/Login with JWT-secured sessions.
- **Onboarding**: Set initial balance, weekly income, and goals.
- **Transactions**: Add, edit, delete categorized expenses/income.
- **Dashboard**: Charts and summaries of user finances.
- **AI Assistant (rudimentary)**: Ask “Can I afford to go out this weekend?” or “Where can I cut costs?”
- **Persistent Storage**: PostgreSQL (NeonDB) database for user data.

---

## 🧠 AI Features (Planned)

### Smart Budgeting Assistant (LLM-powered)
> "You've spent 35% of your income on food. Consider cooking more meals."

How it works:

- Extract user’s expense summaries (e.g., top categories, balance, monthyl_spending) via onboarding.
- Use OpenAI GPT-4 (or Ollama) to generate tailored budget advice.
- Future: integrate RAG pipeline and sentence embeddings for deeper insights.


---

## 🧱 Tech Stack

### Frontend
- React (Vite) + Tailwind CSS
- Recharts for data visualization
- JWT-based auth (or cookies)

### Backend
- Python Flask
- Flask-JWT-Extended (auth)
- SQLAlchemy + PostgreSQL (NeonDB)
- dotenv for secret config management

---

## 🗺️ Frontend Routes

| Route | Purpose |
|-------|---------|
| `/login` | Login screen |
| `/signup` | Signup screen |
| `/onboarding` | User enters balance, income, and goals |
| `/dashboard` | Main dashboard with charts + transactions |
| `/add-transaction` | Add/edit transaction (modal or page) |
| `/profile` (optional) | Edit onboarding info |

---

## 📡 Backend API Routes

### 🔐 Auth

| Method | Route | Purpose |
|--------|-------|---------|
| POST | `/api/auth/signup` | Create user |
| POST | `/api/auth/login` | Authenticate |
| GET  | `/api/auth/user` | Get current user |
| POST | `/api/auth/logout` | Logout |

### 👋 Onboarding

| Method | Route | Purpose |
|--------|-------|---------|
| POST | `/api/onboarding` | Submit balance/income/goal |
| GET  | `/api/onboarding` | Fetch user onboarding data |

### 📊 Dashboard Summary

| Method | Route | Purpose |
|--------|-------|---------|
| GET | `/api/summary` | Balance, income, spending summary |
| GET | `/api/top-categories?period=month` | Top 3 spending categories |
| GET | `/api/charts/:type` | Data for visualizations |

### 💸 Transactions

| Method | Route | Purpose |
|--------|-------|---------|
| POST | `/api/transactions` | Add transaction |
| GET | `/api/transactions` | Get all transactions (filterable) |
| PUT | `/api/transactions/:id` | Edit transaction |
| DELETE | `/api/transactions/:id` | Delete transaction |

### 🗂️ Categories

| Method | Route | Purpose |
|--------|-------|---------|
| GET | `/api/categories` | Get default categories |
| POST | `/api/categories` | Add custom category |

---

## 🔐 Security Notes

- All dashboard/backend routes are JWT- or cookie-protected.
- Refresh token stored securely as `HttpOnly` cookie.
- Frontend prevents dashboard access until onboarding is complete.

---

## 📈 Future Enhancements

- Full AI chatbot ("Ask Minty") for natural budgeting questions.
- Anomaly detection for suspicious spending.
- Budget-sharing mode for roommates.
- WebSocket updates for live budget sync.

---

## 🛠️ Setup Instructions

1. Clone the repo:

   ```bash
   git clone https://github.com/yourusername/mintmind.git
   cd mintmind
