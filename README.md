<div align="center">

<img src="client/src/assets/logo.png" alt="SolverCell Logo" width="120" height="120" style="border-radius: 24px;" />

# Solver*Cell*

### Where Coding Meets Community

A social-first competitive programming platform where developers create, solve, and share coding challenges — all within a sleek, real-time experience.

[![React](https://img.shields.io/badge/React_19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite_8-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vite.dev)
[![Express](https://img.shields.io/badge/Express_5-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com)
[![Prisma](https://img.shields.io/badge/Prisma_6-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://prisma.io)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://neon.tech)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-010101?style=for-the-badge&logo=socket.io&logoColor=white)](https://socket.io)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Clerk](https://img.shields.io/badge/Clerk-6C47FF?style=for-the-badge&logo=clerk&logoColor=white)](https://clerk.com)

</div>

---

## 📸 Screenshots

<div align="center">

| | |
|:---:|:---:|
| ![Feed](client/src/assets/shot1.png) | ![Workspace](client/src/assets/shot2.png) |
| **Home Feed** — Browse, like, comment, and bookmark problems from people you follow | **Code Workspace** — Split-pane IDE with Monaco Editor, problem description, and custom test cases |
| ![Messages](client/src/assets/shot3.png) | ![Profile](client/src/assets/shot4.png) |
| **Real-time Chat** — DM other developers, share problems inline, and see typing/read indicators | **Profile Dashboard** — ELO rating, solve streaks, leaderboard ranks, and authored problems |

</div>

---

## ✨ Features

### 🧩 Problem Creation & Solving
- **Post problems** with full Markdown descriptions, difficulty tags (Easy / Medium / Hard), topic tags, constraints, visible examples, and hidden test cases
- **Solve in-browser** with a full-featured Monaco code editor supporting **11 languages** — Python, C++, C, Java, JavaScript, TypeScript, C#, PHP, Ruby, Go, and Rust
- **Run & Submit** — test against custom inputs or submit against hidden test cases with instant verdicts (Accepted, Wrong Answer, Runtime Error, TLE, Compilation Error)
- **Draft persistence** — your code is saved per-problem, per-language in localStorage so you never lose work

### 🏆 Competitive System
- **ELO Rating** — earn points for first solves scaled by difficulty (Easy +5, Medium +10, Hard +20)
- **Solve Streaks** — daily streak tracking with longest-streak records
- **Weekly Leaderboard** — compete for the top spot each week; scores reset every Monday at 00:00 UTC while ELO is permanent
- **All-Time Leaderboard** — lifetime rankings based on cumulative ELO
- **Personal best tracking** — best runtime and memory are recorded per problem

### 💬 Social Layer
- **Social Feed** — "For You" and "Following" tabs with infinite scroll, likes, comments, bookmarks, and shares
- **Real-time Messaging** — WebSocket-powered DMs with typing indicators, online/offline presence, read receipts, and shared problem cards
- **Follow System** — follow other developers, view their profiles, and see their problems in your feed
- **Notifications** — real-time push notifications for follows, likes, comments, and when someone solves your problem
- **Problem Sharing** — share problems via DM with rich preview cards embedded in the chat

### 🔍 Discovery & Search
- **Discover page** — search problems and users with advanced filters for difficulty, tags, and sort order (newest, most solved, most liked, most attempted)
- **Trending sidebar** — see the hottest problems based on recent community activity
- **Tag-based browsing** — filter by popular DSA tags (Arrays, DP, Graphs, Trees, and more)

### 👤 Profile & Stats
- **Rich profile pages** — avatar, bio, location, join date, follower/following counts
- **Stats dashboard** — problems solved, success rate, ELO rating, all-time rank, weekly rank, best weekly rank, current streak, longest streak, and total likes received
- **Tabbed content** — view a user's authored posts, saved problems, solved problems, and attempted problems
- **Edit profile** — update display name, bio, location, and avatar

---

## 🏗️ Architecture

```
SolverCell/
├── client/                          # Frontend (React + Vite)
│   ├── src/
│   │   ├── assets/                  # Logo, screenshots, static assets
│   │   ├── components/              # Reusable UI components
│   │   │   ├── chat/                # ChatWindow, MessageBubble, ConversationList
│   │   │   ├── workspace/           # CodeEditorPanel, ProblemDescription, TestcasePanel
│   │   │   ├── profile/             # EditProfileModal, FollowModal, MyPosts
│   │   │   └── create-problem/      # BasicInfoSection, DescriptionSection, TestCasesSection
│   │   ├── context/                 # CurrentUserContext (global auth state)
│   │   ├── hooks/                   # useSocket, useCurrentUser, useNotificationCount
│   │   ├── pages/                   # Feed, Workspace, Profile, Messages, Discover, etc.
│   │   ├── App.jsx                  # Route definitions + protected/public route guards
│   │   └── main.jsx                 # Entry point with ClerkProvider + BrowserRouter
│   ├── vercel.json                  # SPA rewrite rules for Vercel deployment
│   └── vite.config.js               # Vite + React + Tailwind plugin config
│
├── server/                          # Backend (Express + Prisma)
│   ├── src/
│   │   ├── routes/                  # RESTful API routes
│   │   │   ├── problems.js          # CRUD, likes, comments, bookmarks, submissions
│   │   │   ├── code.js              # Code execution (run + submit against test cases)
│   │   │   ├── conversations.js     # Create/list DM conversations
│   │   │   ├── messages.js          # Send/fetch messages + shared problem cards
│   │   │   ├── users.js             # User profiles, stats, follow data
│   │   │   ├── follows.js           # Follow/unfollow + status checks
│   │   │   ├── search.js            # Full-text search for problems + users
│   │   │   ├── notifications.js     # Fetch + mark-read notifications
│   │   │   └── leaderboard.js       # All-time + weekly leaderboard queries
│   │   ├── lib/
│   │   │   ├── prisma.js            # Prisma client singleton
│   │   │   ├── Solverewards.js      # ELO calculation, streak logic, weekly score
│   │   │   └── notify.js            # Notification helper + socket emission
│   │   ├── middleware/              # Error handler, async wrapper, auth
│   │   └── index.js                 # Express server + Socket.IO + cron scheduler
│   ├── prisma/
│   │   ├── schema.prisma            # 15 models, 6 enums — full data schema
│   │   └── migrations/              # PostgreSQL migration history
│   └── package.json
│
└── README.md
```

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|:---|:---|:---|
| **Frontend** | React 19, Vite 8 | UI framework + lightning-fast HMR |
| **Styling** | Tailwind CSS 4 | Utility-first dark theme design system |
| **Code Editor** | Monaco Editor | VS Code-grade in-browser editing |
| **Auth** | Clerk | Secure authentication + user management |
| **Backend** | Express 5 (Node.js) | REST API server |
| **Database** | PostgreSQL (Neon) | Cloud-hosted relational database |
| **ORM** | Prisma 6 | Type-safe database queries + migrations |
| **Realtime** | Socket.IO | WebSocket events for chat, notifications, presence |
| **Code Execution** | OnlineCompiler API | Sandboxed multi-language code runner |
| **Scheduling** | node-cron | Weekly leaderboard reset (Mondays 00:00 UTC) |
| **Icons** | Lucide React | Consistent, beautiful icon library |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **PostgreSQL** database (or a free [Neon](https://neon.tech) instance)
- **Clerk** account ([clerk.com](https://clerk.com)) for authentication keys
- **OnlineCompiler** API key for code execution

### 1. Clone the Repository

```bash
git clone https://github.com/Chandu-71/SolverCell.git
cd SolverCell
```

### 2. Set Up the Backend

```bash
cd server
npm install
```

Create a `.env` file in `server/`:

```env
DATABASE_URL="postgresql://user:password@host/dbname?sslmode=require"
DIRECT_URL="postgresql://user:password@host/dbname?sslmode=require"

CLERK_SECRET_KEY="sk_test_..."
CLERK_PUBLISHABLE_KEY="pk_test_..."

ONLINECOMPILER_API_KEY="your_api_key"

PORT=3000
CLIENT_URL="http://localhost:5173"
```

Run Prisma migrations and start the server:

```bash
npx prisma migrate deploy
npx prisma generate
npm run dev
```

### 3. Set Up the Frontend

```bash
cd ../client
npm install
```

Create a `.env` file in `client/`:

```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
VITE_API_URL=http://localhost:3000
```

Start the development server:

```bash
npm run dev
```

The app will be running at **http://localhost:5173** 🎉

---

## 🌐 Deployment

| Service | Platform | Notes |
|:---|:---|:---|
| **Backend** | [Render](https://render.com) | Web Service with WebSocket support |
| **Frontend** | [Vercel](https://vercel.com) | Optimized for Vite + SPA routing |
| **Database** | [Neon](https://neon.tech) | Serverless PostgreSQL |

> **Build command (Render):** `npm install && npx prisma generate && npx prisma migrate deploy`  
> **Start command (Render):** `npm start`  
> **Root directory:** `server` (Render) / `client` (Vercel)

---

## 📊 Database Schema

The Prisma schema defines **15 models** and **6 enums** powering every feature:

```
User ──┬── Problem ──┬── TestCase
       │             ├── Submission
       │             ├── Like
       │             ├── Comment
       │             ├── Bookmark
       │             ├── SolvedProblem
       │             └── ProblemTag ── Tag
       │
       ├── Follow (self-referential many-to-many)
       ├── Notification
       └── ConversationParticipant ── Conversation ── Message
```

---

## 🗺️ API Endpoints

| Method | Endpoint | Description |
|:---|:---|:---|
| `GET` | `/api/problems` | Paginated feed with cursor-based pagination |
| `POST` | `/api/problems` | Create a new problem |
| `GET` | `/api/problems/:id` | Get problem details |
| `POST/DELETE` | `/api/problems/:id/like` | Toggle like |
| `POST/DELETE` | `/api/problems/:id/save` | Toggle bookmark |
| `POST` | `/api/problems/:id/comment` | Add a comment |
| `POST` | `/api/code/run` | Execute code against custom input |
| `POST` | `/api/code/submit` | Submit code against hidden test cases |
| `GET` | `/api/users/:username` | Get public profile |
| `GET` | `/api/users/:username/problems` | Get user's solved/attempted/authored problems |
| `POST/DELETE` | `/api/follows/:username` | Toggle follow |
| `GET` | `/api/conversations` | List user's conversations |
| `POST` | `/api/conversations` | Create or get existing conversation |
| `GET` | `/api/messages/:conversationId` | Fetch messages in a conversation |
| `POST` | `/api/messages/:conversationId` | Send a message |
| `GET` | `/api/search` | Search problems and users with filters |
| `GET` | `/api/notifications` | Fetch notifications |
| `GET` | `/api/leaderboard` | All-time or weekly leaderboard |
| `GET` | `/health` | Health check |

---

## 🔌 WebSocket Events

| Event | Direction | Description |
|:---|:---|:---|
| `conversation:join` | Client → Server | Join a conversation room |
| `conversation:leave` | Client → Server | Leave a conversation room |
| `message:new` | Server → Client | New message received |
| `message:seen` | Bidirectional | Mark messages as seen |
| `typing:start` / `typing:stop` | Bidirectional | Typing indicators |
| `user:online` / `user:offline` | Server → Client | Presence updates |
| `notification:new` | Server → Client | Real-time notification push |
| `conversation:updated` | Server → Client | Conversation list update (new message preview) |

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

<br>

<div align="center">

**Designed and built by [Chandu](https://github.com/Chandu-71)**

If SolverCell impressed you, inspired you, or taught you something new, consider leaving a ⭐.

</div>
