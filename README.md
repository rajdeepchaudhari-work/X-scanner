<div align="center">

# 🛰 X Scanner

### Production-ready Twitter/X AI Monitoring Dashboard

[![FastAPI](https://img.shields.io/badge/FastAPI-0.104+-009688?style=flat&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat&logo=next.js&logoColor=white)](https://nextjs.org)
[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=flat&logo=python&logoColor=white)](https://python.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?style=flat&logo=typescript&logoColor=white)](https://typescriptlang.org)
[![SQLite](https://img.shields.io/badge/SQLite-lightblue?style=flat&logo=sqlite&logoColor=003B57)](https://sqlite.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4+-38B2AC?style=flat&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=flat)](LICENSE)

Monitor tweets from selected accounts, store them, and feed an AI reasoning memory layer — all in a clean dark-mode dashboard.

[Features](#-features) · [Architecture](#-architecture) · [Quick Start](#-quick-start) · [API Reference](#-api-reference) · [Roadmap](#-roadmap)

</div>

---

## ✨ Features

| Feature | Description |
|---|---|
| **Account Manager** | Add / remove Twitter/X usernames to monitor |
| **Auto Polling** | Background worker fetches tweets every N minutes (configurable) |
| **Deduplication** | Tweets stored by ID — never double-ingested |
| **Memory Layer** | Store AI interpretations, tags, and importance scores per tweet |
| **Live Dashboard** | Auto-refreshes every 5 seconds, no page reload needed |
| **Settings UI** | Change the poll interval live — reschedules the job instantly |
| **API Docs Explorer** | Reads `/openapi.json` live, grouped endpoints with cURL copy |
| **Swagger UI** | Full interactive API docs at `/docs` |

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend (Next.js)                       │
│                                                                  │
│  ┌────────────┐  ┌──────────────┐  ┌───────────┐  ┌─────────┐  │
│  │ Dashboard  │  │   Accounts   │  │  Memory   │  │Settings │  │
│  │ (5s poll) │  │  Manager     │  │  Viewer   │  │+ API    │  │
│  └─────┬──────┘  └──────┬───────┘  └─────┬─────┘  └────┬────┘  │
│        └────────────────┴──────────────── ┴─────────────┘        │
│                         lib/api.ts (typed client)                 │
└─────────────────────────┬───────────────────────────────────────┘
                           │ HTTP (localhost:8000)
┌─────────────────────────▼───────────────────────────────────────┐
│                        Backend (FastAPI)                         │
│                                                                  │
│   /accounts   /tweets   /memory   /fetch   /settings   /docs    │
│                                                                  │
│  ┌─────────────────────────┐   ┌──────────────────────────────┐  │
│  │   APScheduler           │   │        SQLite                │  │
│  │   (configurable poll)   │   │                              │  │
│  │   fetch_and_store() ────┼──►│  accounts │ tweets │ memory │  │
│  └────────────┬────────────┘   │           │        │settings│  │
│               │                └──────────────────────────────┘  │
└───────────────┼─────────────────────────────────────────────────┘
                │ HTTPS
        ┌───────▼────────┐
        │ twitterapi.io  │
        │ advanced_search│
        └────────────────┘
```

**System flow:**

1. APScheduler runs `fetch_and_store_tweets()` every N minutes
2. Builds dynamic query: `(from:user1 OR from:user2 OR ...)`
3. Calls twitterapi.io Advanced Search (Latest)
4. Deduplicates by tweet ID → inserts into `tweets` table
5. Frontend polls `GET /tweets/new` every 5 seconds
6. AI agent reads unprocessed tweets → `POST /memory` with interpretation
7. Memory Viewer surfaces stored reasoning

---

## 📁 Project Structure

```
x-scanner/
├── backend/
│   ├── main.py               # FastAPI app entry + lifespan
│   ├── database.py           # SQLite connection context manager
│   ├── models.py             # Pydantic request models
│   ├── routes/
│   │   ├── accounts.py       # GET / POST / DELETE /accounts
│   │   ├── tweets.py         # GET /tweets/new · GET /tweets
│   │   ├── memory.py         # GET / POST /memory
│   │   ├── fetch.py          # POST /fetch  (manual trigger)
│   │   └── settings.py       # GET / PUT /settings
│   ├── services/
│   │   ├── twitter.py        # API fetcher · dedup · query builder
│   │   └── scheduler.py      # APScheduler + live reschedule
│   ├── requirements.txt
│   └── .env.example
│
├── frontend/
│   ├── app/
│   │   ├── layout.tsx        # Root layout + dark theme
│   │   ├── page.tsx          # Dashboard — live tweet feed
│   │   ├── accounts/page.tsx # Account CRUD
│   │   ├── memory/page.tsx   # Memory Viewer
│   │   ├── settings/page.tsx # Poll interval + system config
│   │   └── api-docs/page.tsx # Live OpenAPI spec explorer
│   ├── components/
│   │   ├── Sidebar.tsx       # Fixed sidebar navigation
│   │   ├── TweetCard.tsx     # Tweet display card
│   │   ├── MemoryCard.tsx    # Memory entry card
│   │   └── ui/               # Button · Card · Input · Badge
│   ├── lib/
│   │   ├── api.ts            # Typed API client
│   │   └── utils.ts          # cn() helper
│   └── .env.local.example
│
├── .gitignore
└── README.md
```

---

## 🚀 Quick Start

### Prerequisites

- Python 3.11+
- Node.js 18+
- A [twitterapi.io](https://twitterapi.io) API key

---

### 1 · Backend

```bash
cd backend

# Copy and configure environment
cp .env.example .env
# Open .env and set your TWITTER_API_KEY

# Create virtual environment
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start the API server
uvicorn main:app --reload --port 8000
```

> API available at **http://localhost:8000**
> Interactive Swagger docs at **http://localhost:8000/docs**

---

### 2 · Frontend

```bash
cd frontend

# Copy and configure environment
cp .env.local.example .env.local
# NEXT_PUBLIC_API_URL is set to http://localhost:8000 by default

# Install dependencies
npm install

# Start the dev server
npm run dev
```

> Dashboard available at **http://localhost:3000**

---

### 3 · Add Accounts & Start Monitoring

1. Open `http://localhost:3000/accounts`
2. Add Twitter/X usernames you want to monitor (e.g. `elonmusk`, `sama`)
3. Go to **Dashboard** and click **Fetch Now** — or wait for the auto-poll
4. Adjust the poll interval at `http://localhost:3000/settings`

---

## 🔌 API Reference

All endpoints return JSON. Base URL: `http://localhost:8000`

### Accounts

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/accounts` | List all monitored accounts |
| `POST` | `/accounts` | Add account `{ "username": "elonmusk" }` |
| `DELETE` | `/accounts/{username}` | Remove account |

### Tweets

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/tweets/new` | Unprocessed tweets (default limit 50) |
| `GET` | `/tweets` | All tweets, newest first |
| `POST` | `/fetch` | Manually trigger a fetch cycle |

### Memory

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/memory` | Recent memory entries (with tweet text joined) |
| `POST` | `/memory` | Store AI interpretation, marks tweet processed |

**POST /memory payload:**

```json
{
  "tweet_id": "1234567890",
  "interpretation": "Hints at a new hardware product launch.",
  "tags": ["product", "hardware", "launch"],
  "importance": 0.87
}
```

### Settings

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/settings` | Get current configuration |
| `PUT` | `/settings` | Update config (reschedules job live) |

**PUT /settings payload:**

```json
{
  "poll_interval_minutes": 5
}
```

### Health

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | `{ "status": "ok" }` |
| `GET` | `/docs` | Swagger UI |
| `GET` | `/openapi.json` | Raw OpenAPI spec |

---

## 🗄 Database Schema

```sql
-- Accounts to monitor
CREATE TABLE accounts (
    username   TEXT PRIMARY KEY,
    added_at   TEXT NOT NULL
);

-- Ingested tweets
CREATE TABLE tweets (
    id         TEXT PRIMARY KEY,       -- Twitter tweet ID (dedup key)
    text       TEXT NOT NULL,
    author     TEXT NOT NULL,
    created_at TEXT NOT NULL,
    processed  INTEGER DEFAULT 0,      -- 1 = AI has processed it
    fetched_at TEXT NOT NULL
);

-- AI reasoning memory
CREATE TABLE memory (
    id             TEXT PRIMARY KEY,   -- UUID
    tweet_id       TEXT NOT NULL REFERENCES tweets(id),
    interpretation TEXT NOT NULL,
    tags           TEXT NOT NULL DEFAULT '',   -- comma-separated
    importance     REAL NOT NULL DEFAULT 0.0, -- 0.0 – 1.0
    created_at     TEXT NOT NULL
);

-- System configuration
CREATE TABLE settings (
    key        TEXT PRIMARY KEY,
    value      TEXT NOT NULL,
    updated_at TEXT NOT NULL
);
```

---

## ⚙ Environment Variables

### Backend (`backend/.env`)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `TWITTER_API_KEY` | ✅ | — | Your twitterapi.io API key |
| `DATABASE_URL` | ❌ | `tweets.db` | Path to SQLite database file |

### Frontend (`frontend/.env.local`)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NEXT_PUBLIC_API_URL` | ❌ | `http://localhost:8000` | Backend API base URL |

---

## 🗺 Roadmap

- [ ] AI auto-processing — hook Claude/OpenAI to read `/tweets/new` and auto-POST to `/memory`
- [ ] Webhook support — fire a webhook when high-importance tweets are detected
- [ ] Keyword filtering — filter tweets by keyword before storing
- [ ] Tweet scoring — pre-rank tweets by relevance before AI processing
- [ ] PostgreSQL migration — swap SQLite for Postgres for multi-instance deployments
- [ ] Docker Compose — one-command local setup
- [ ] Authentication — API key middleware for FastAPI endpoints
- [ ] Dark/light mode toggle in UI

---

## 🤝 Contributing

1. Fork the repo
2. Create a feature branch: `git checkout -b feat/your-feature`
3. Commit with conventional commits: `git commit -m "feat: add webhook support"`
4. Push and open a pull request

---

## 📄 License

MIT © [Rajdeep Chaudhari](https://github.com/rajdeepchaudhari)
