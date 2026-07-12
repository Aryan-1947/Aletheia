# Aletheia — Frontend (rag-frontend)

React + Vite + Tailwind frontend for [Aletheia](https://aletheia-engine.vercel.app), a hybrid RAG search engine.

> For the full project overview, live demo, and features, see the [root README](../README.md).

## 🛠️ Tech Stack

- React 19 + Vite
- Tailwind CSS v4
- React Router
- Auth0 (Google + GitHub OAuth)
- Lucide icons, react-icons

## 🚀 Local Setup

```bash
# 1. Install dependencies
npm install

# 2. Set environment variables (see .env.example)
VITE_API_URL=http://localhost:8000   # or your deployed backend URL

# 3. Start the dev server
npm run dev
```

The app will be available at `http://localhost:5173`.

## 📁 Key Structure

src/
├── auth/            # Auth0 config
├── components/       # Navbar, Footer, DotField (background), CountUp
├── lib/              # api.js — all backend API calls
└── pages/            # Landing, Ask, Documents, Evaluation, Login

## 🔨 Build

```bash
npm run build
```

Output goes to `dist/`, deployed via Vercel with automatic GitHub integration.