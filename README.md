# 🚀 AI Cold Mail Agent

AI Cold Mail Agent is a modern full-stack outreach automation platform that helps users extract HR emails from PDFs/CSVs, connect their Gmail account securely, and send personalized cold emails at scale using AI-powered workflows.

Built with:

* Next.js
* FastAPI
* Google OAuth
* Gmail API
* Tailwind CSS
* TypeScript

---

# ✨ Features

## ✅ HR Email Extraction

* Upload PDF or CSV files
* Automatically extract HR emails
* Smart parsing system

## ✅ Google OAuth Authentication

* Secure Login with Google
* Gmail permission integration
* User-controlled email sending

## ✅ Bulk Email Automation

* Send emails to multiple HRs
* Select number of recipients
* Personalized message support

## ✅ Modern SaaS Dashboard

* Responsive UI
* Glassmorphism design
* Real-time analytics cards

## ✅ Gmail API Integration

* Emails are sent directly from the user's Gmail account
* No password storage
* Secure OAuth-based authentication

---

# 🛠️ Tech Stack

## Frontend

* Next.js
* TypeScript
* Tailwind CSS
* Axios
* NextAuth

## Backend

* FastAPI
* Python
* Pandas
* Gmail API

## Authentication

* Google OAuth
* NextAuth.js

## APIs

* Gmail API
* Google Cloud OAuth

---

# 📂 Project Structure

```bash
cold-mail-agent/
│
├── frontend/
│   ├── app/
│   ├── public/
│   ├── package.json
│
├── backend/
│   ├── routes/
│   ├── services/
│   ├── uploads/
│   ├── main.py
│
└── README.md
```

---

# ⚙️ Setup Instructions

## 1️⃣ Clone Repository

```bash
git clone YOUR_GITHUB_REPO_URL

cd cold-mail-agent
```

---

# 2️⃣ Frontend Setup

```bash
cd frontend

npm install
```

Create:

```bash
.env.local
```

Add:

```env
GOOGLE_CLIENT_ID=

GOOGLE_CLIENT_SECRET=

NEXTAUTH_SECRET=

NEXTAUTH_URL=http://localhost:3000
```

Run frontend:

```bash
npm run dev
```

---

# 3️⃣ Backend Setup

Open new terminal:

```bash
cd backend
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Backend email sending uses the signed-in user's Google access token and the Gmail REST API, so no backend secret is needed.

Run backend:

```bash
uvicorn main:app --reload
```

---

# 🔐 Google OAuth Setup

## Enable Gmail API

Go to Google Cloud Console:

* Create project
* Enable Gmail API
* Configure OAuth Consent Screen
* Create OAuth Client

Add redirect URI:

```bash
http://localhost:3000/api/auth/callback/google
```

---

# 🚀 Future Roadmap

* AI Personalized Emails
* Resume Attachment Support
* Email Open Tracking
* PostgreSQL Integration
* Redis Queue Workers
* Docker Support
* Kubernetes Deployment
* Analytics Dashboard
* Campaign Scheduling

---

# 📸 Screenshots

(Add screenshots here)

---

# 🤝 Contributing

Contributions are welcome.

Fork the repository and create a pull request.

---

# 📄 License

MIT License

---

# ⭐ Support

If you like this project, consider starring the repository.

---

# 💡 Inspiration

Built to simplify cold outreach automation for:

* Developers
* Students
* Freelancers
* Startups
* Recruiters

---

# 🌐 Vision

Transform cold outreach into an intelligent AI-powered workflow platform.
