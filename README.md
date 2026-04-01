<div align="center">

# X Scanner

**Open-source Twitter/X monitoring dashboard with an AI memory layer**

[![FastAPI](https://img.shields.io/badge/FastAPI-0.104+-009688?style=flat&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat&logo=next.js&logoColor=white)](https://nextjs.org)
[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=flat&logo=python&logoColor=white)](https://python.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?style=flat&logo=typescript&logoColor=white)](https://typescriptlang.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=flat)](LICENSE)

Monitor Twitter/X accounts in real-time, auto-fetch tweets on a schedule, and build a structured AI reasoning memory on top of them — all through a clean, dark-mode dashboard.

[Features](#features) · [Quick Start](#quick-start) · [Architecture](#architecture) · [API Reference](#api-reference) · [Deployment](#deployment) · [Contributing](#contributing)

</div>

---

## Features

- **Account Monitoring** — Add/remove Twitter/X usernames to track
- **Scheduled Polling** — Background worker fetches tweets every N minutes (configurable live via UI)
- **Deduplication** — Tweets stored by ID, never double-ingested
- **AI Memory Layer** — Store interpretations, tags, and importance scores per tweet
- **Live Dashboard** — Auto-refreshes every 5 seconds with a live indicator
- **Settings UI** — Change the poll interval on the fly — reschedules the background job instantly
- **API Docs Explorer** — Built-in page that reads your OpenAPI spec live, with cURL copy buttons
- **Auth Gate** — Password-protected frontend with session cookies
- **API Key Auth** — Optional `X-API-Key` header protection on all backend endpoints
- **Mobile Responsive** — Collapsible sidebar with full mobile drawer navigation

---

## Quick Start

### Prerequisites

- Python 3.11+
- Node.js 18+
- A [twitterapi.io](https://twitterapi.io) API key

### 1. Clone the repo

```bash
git clone https://github.com/rajdeepchaudhari-work/X-scanner.git
cd X-scanner
```

### 2. Backend

```bash
cd backend
cp .env.example .env
# Edit .env — set TWITTER_API_KEY (required) and API_KEY (optional, for endpoint auth)

python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt

uvicorn main:app --reload --port 8000
```

> API: **http://localhost:8000** · Swagger UI: **http://localhost:8000/docs**

### 3. Frontend

```bash
cd frontend
cp .env.local.example .env.local
# Edit .env.local — set AUTH_PASSWORD and AUTH_SECRET for the login gate

npm install
npm run dev
```

> Dashboard: **http://localhost:3000**

### 4. Start monitoring

1. Open **http://localhost:3000/accounts** and add usernames (e.g. `elonmusk`, `sama`)
2. Go to **Dashboard** and click **Fetch Now** — or wait for auto-poll
3. Adjust the poll interval at **http://localhost:3000/settings**

---

## Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                     Frontend  (Next.js 14)                    │
│                                                               │
│   Dashboard ─── Accounts ─── Memory ─── Settings ─── API Docs│
│        │            │           │           │            │     │
│        └────────────┴───────────┴───────────┴────────────┘     │
│                        lib/api.ts  (typed client)              │
└──────────────────────────┬───────────────────────────────────┘
                           │  HTTP
┌──────────────────────────▼───────────────────────────────────┐
│                     Backend  (FastAPI)                         │
│                                                               │
│  /accounts  /tweets  /memory  /fetch  /settings  /health      │
│                                                               │
│  ┌──────────────────────┐    ┌─────────────────────────────┐  │
│  │  APScheduler         │    │       SQLite                │  │
│  │  (configurable poll) │───>│  accounts | tweets | memory │  │
│  └──────────┬───────────┘    │           | settings        │  │
│             │                └─────────────────────────────┘  │
└─────────────┼────────────────────────────────────────────────┘
              │  HTTPS
      ┌───────▼────────┐
      │ twitterapi.io  │
      │ advanced_search│
      └────────────────┘
```

**Flow:** APScheduler triggers `fetch_and_store_tweets()` → builds a dynamic `(from:user1 OR from:user2)` query → calls twitterapi.io → deduplicates by tweet ID → inserts into SQLite. The frontend polls `/tweets/new` every 5s. AI agents can read unprocessed tweets and POST structured interpretations to `/memory`.

---

## Project Structure

```
X-scanner/
├── backend/
│   ├── main.py                 # FastAPI app + lifespan (init DB, start scheduler)
│   ├── database.py             # SQLite connection manager + schema init
│   ├── models.py               # Pydantic request models
│   ├── routes/
│   │   ├── accounts.py         # GET / POST / DELETE /accounts
│   │   ├── tweets.py           # GET /tweets/new · GET /tweets
│   │   ├── memory.py           # GET / POST /memory
│   │   ├── fetch.py            # POST /fetch (manual trigger)
│   │   └── settings.py         # GET / PUT /settings
│   ├── services/
│   │   ├── twitter.py          # Twitter API client + dedup logic
│   │   └── scheduler.py        # APScheduler + live reschedule
│   ├── requirements.txt
│   └── .env.example
│
├── frontend/
│   ├── app/
│   │   ├── layout.tsx          # Root layout + dark theme
│   │   ├── page.tsx            # Dashboard — live tweet feed
│   │   ├── login/page.tsx      # Password auth gate
│   │   ├── accounts/page.tsx   # Account CRUD
│   │   ├── memory/page.tsx     # Memory viewer
│   │   ├── settings/page.tsx   # Poll interval config
│   │   └── api-docs/page.tsx   # Live OpenAPI spec explorer
│   ├── components/
│   │   ├── Sidebar.tsx         # Responsive sidebar + mobile drawer
│   │   ├── TweetCard.tsx       # Tweet display card
│   │   ├── MemoryCard.tsx      # Memory entry card
│   │   └── ui/                 # Button · Card · Input · Badge
│   ├── lib/
│   │   ├── api.ts              # Typed API client
│   │   └── utils.ts            # Utility helpers
│   ├── middleware.ts           # Auth session check
│   └── .env.local.example
│
├── LICENSE
└── README.md
```

---

## API Reference

Base URL: `http://localhost:8000`

### Accounts

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/accounts` | List all monitored accounts |
| `POST` | `/accounts` | Add account `{ "username": "elonmusk" }` |
| `DELETE` | `/accounts/{username}` | Remove an account |

### Tweets

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/tweets/new` | Unprocessed tweets (default limit 50) |
| `GET` | `/tweets` | All tweets, newest first |
| `POST` | `/fetch` | Manually trigger a fetch cycle |

### Memory

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/memory` | Recent memory entries (joined with tweet text) |
| `POST` | `/memory` | Store an AI interpretation |

**POST /memory body:**

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
| `PUT` | `/settings` | Update config `{ "poll_interval_minutes": 5 }` |

### Health & Docs

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Returns `{ "status": "ok" }` |
| `GET` | `/docs` | Swagger UI |
| `GET` | `/openapi.json` | Raw OpenAPI spec |

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `TWITTER_API_KEY` | Yes | — | Your [twitterapi.io](https://twitterapi.io) API key |
| `DATABASE_URL` | No | `tweets.db` | Path to SQLite database file |
| `API_KEY` | No | — | If set, all endpoints require `X-API-Key` header |

### Frontend (`frontend/.env.local`)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NEXT_PUBLIC_API_URL` | No | `http://localhost:8000` | Backend API base URL |
| `NEXT_PUBLIC_API_KEY` | No | — | API key sent as `X-API-Key` header |
| `AUTH_PASSWORD` | No | — | Password for the login gate |
| `AUTH_SECRET` | No | — | Secret used for session cookie validation |

---

## Database Schema

```sql
CREATE TABLE accounts (
    username   TEXT PRIMARY KEY,
    added_at   TEXT NOT NULL
);

CREATE TABLE tweets (
    id         TEXT PRIMARY KEY,
    text       TEXT NOT NULL,
    author     TEXT NOT NULL,
    created_at TEXT NOT NULL,
    processed  INTEGER DEFAULT 0,
    fetched_at TEXT NOT NULL
);

CREATE TABLE memory (
    id             TEXT PRIMARY KEY,
    tweet_id       TEXT NOT NULL REFERENCES tweets(id),
    interpretation TEXT NOT NULL,
    tags           TEXT NOT NULL DEFAULT '',
    importance     REAL NOT NULL DEFAULT 0.0,
    created_at     TEXT NOT NULL
);

CREATE TABLE settings (
    key        TEXT PRIMARY KEY,
    value      TEXT NOT NULL,
    updated_at TEXT NOT NULL
);
```

---

## Deployment

### Backend (Railway / any Docker host)

The backend includes a `Procfile` and `railway.toml` for one-click Railway deployment. Set your env vars in the Railway dashboard.

### Frontend (Vercel)

```bash
cd frontend
npx vercel
```

Set `NEXT_PUBLIC_API_URL` to your deployed backend URL in Vercel environment variables.

### CORS

Add your production frontend URL to the `CORS_ORIGINS` env var (comma-separated) on the backend, or edit the origins list in `backend/main.py`.

---

## Roadmap

- [ ] AI auto-processing — connect an LLM to read `/tweets/new` and auto-POST to `/memory`
- [ ] Webhook notifications — fire a webhook on high-importance tweets
- [ ] Keyword filtering — filter tweets by keyword before storing
- [ ] Tweet scoring — pre-rank tweets by relevance before AI processing
- [ ] PostgreSQL support — swap SQLite for Postgres for multi-instance deploys
- [ ] Docker Compose — one-command local setup
- [ ] Dark/light mode toggle

---

## Contributing

Contributions are welcome! Here's how:

1. **Fork** the repo
2. **Create** a feature branch: `git checkout -b feat/your-feature`
3. **Commit** with conventional commits: `git commit -m "feat: add webhook support"`
4. **Push** and open a **Pull Request**

Please open an issue first for large changes so we can discuss the approach.

---

## License

MIT &copy; [Rajdeep Chaudhari](https://github.com/rajdeepchaudhari-work)

<img width="1600" height="900" alt="image" src="https://github.com/user-attachments/assets/a6dabebf-d58c-4074-ae10-dc4b2b0284f3" />

