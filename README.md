# SyncNotes — AI-Powered Collaborative Notes Workspace

> Built for the **Peblo Full Stack Developer Challenge** · A production-grade, AI-powered notes workspace.

---

## Overview

SyncNotes is a full-stack, AI-powered notes workspace that lets users create, organize, summarize, and share intelligent notes. It integrates GPT-4o mini via OpenRouter to generate summaries, extract action items, and suggest smart tags — all from within a polished, responsive interface.

---

## Features

| Feature | Description |
|---|---|
| **Authentication** | Email/password + Google OAuth via NextAuth.js |
| **Notes Workspace** | Rich text editor (TipTap) with auto-save, formatting toolbar |
| **AI Insights** | Summaries, action items, smart tags, title suggestions via GPT-4o mini |
| **Search & Filter** | Full-text search, tag filtering, ⌘K command palette |
| **Archive** | Archive and restore notes, permanent delete |
| **Public Sharing** | Generate shareable public links, revoke access |
| **Dashboard** | Real-time stats, weekly activity chart, tag analytics |
| **Settings** | Profile, appearance (dark/light/system), notifications, security |
| **Mobile Responsive** | Full mobile support with slide-out navigation |
| **Animations** | Framer Motion throughout — page transitions, list animations |
| **SEO** | Dynamic metadata, Open Graph tags for shared notes |
| **Security** | Ownership checks on all mutations, security headers, input validation |

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 16 (App Router) |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS v4 + shadcn/ui |
| **Database** | PostgreSQL (Neon) via Prisma ORM |
| **Auth** | NextAuth.js v4 (JWT sessions) |
| **AI** | OpenAI SDK → OpenRouter (GPT-4o mini) |
| **Editor** | TipTap (rich text) |
| **State** | Zustand |
| **Animations** | Framer Motion |
| **Charts** | Recharts |

---

## Architecture

```
syncnotes/
├── app/
│   ├── (auth)/           # Login & Register pages
│   ├── (dashboard)/      # Protected dashboard routes
│   │   ├── dashboard/    # Productivity insights
│   │   ├── notes/        # Notes workspace
│   │   ├── archive/      # Archived notes
│   │   └── settings/     # User settings
│   ├── api/
│   │   ├── auth/         # NextAuth handler
│   │   ├── notes/        # CRUD + share endpoints
│   │   ├── ai/generate/  # AI insights endpoint
│   │   ├── dashboard/    # Stats endpoint
│   │   └── register/     # User registration
│   ├── shared/[shareId]/ # Public note view
│   └── page.tsx          # Landing page
├── components/
│   ├── layout/           # Sidebar, TopNavbar
│   ├── notes/            # Editor, Sidebar, AI Panel, Share Modal
│   ├── dashboard/        # Search Command
│   └── ui/               # shadcn/ui components
├── lib/
│   ├── openai.ts         # OpenRouter client
│   ├── ai-prompts.ts     # AI prompt builder
│   └── prisma.ts         # Prisma singleton
├── store/
│   ├── use-notes-store.ts
│   └── use-dashboard-store.ts
├── providers/
│   ├── session-provider.tsx
│   └── theme-provider.tsx
└── prisma/
    └── schema.prisma
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database (Neon free tier works great)
- OpenRouter API key (or OpenAI API key)
- Google OAuth credentials (optional)

### 1. Clone & Install

```bash
git clone https://github.com/your-username/syncnotes.git
cd syncnotes
npm install
```

### 2. Configure Environment Variables

```bash
cp .env.example .env
```

Fill in your `.env`:

```env
DATABASE_URL=postgresql://user:password@host/database?sslmode=require
NEXTAUTH_SECRET=your-secret-here
NEXTAUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
OPENROUTER_API_KEY=sk-or-v1-your-key
```

**Generate NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

### 3. Set Up Database

```bash
npx prisma migrate deploy
npx prisma generate
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## API Reference
```text
| Method | Endpoint  | Description |
|---|---|---|---|
| `POST` | `/api/register` | Create user account |
| `POST` | `/api/auth/[...nextauth]` | NextAuth handler |
| `GET` | `/api/notes` | List notes (supports `?search=`, `?tag=`, `?archived=`) |
| `POST` | `/api/notes` | Create new note |
| `GET` | `/api/notes/:id` | Get single note |
| `PATCH` | `/api/notes/:id` | Update note (ownership verified) |
| `DELETE` | `/api/notes/:id` | Delete note (ownership verified) |
| `POST` | `/api/notes/share` | Generate public share link |
| `DELETE` | `/api/notes/share` | Revoke public share link |
| `POST` | `/api/ai/generate` | Generate AI insights for a note |
| `GET` | `/api/dashboard/stats` | Get productivity statistics |
```

### Example: AI Generate Response

```json
{
  "id": "clx...",
  "title": "Sprint Planning Notes",
  "summary": "Weekly sprint planning discussion covering UI mockups and API structure review.",
  "actionItems": "[\"Prepare UI mockups\",\"Review API structure\",\"Update documentation\"]",
  "tags": ["work", "planning", "sprint"],
  "updatedAt": "2026-05-17T10:00:00Z"
}
```

---

## Database Schema

```prisma
model User {
  id        String   @id @default(cuid())
  name      String?
  email     String   @unique
  password  String?
  image     String?
  notes     Note[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Note {
  id          String   @id @default(cuid())
  title       String
  content     String   @db.Text
  summary     String?  @db.Text
  actionItems String?  @db.Text   // JSON array
  tags        String[]
  archived    Boolean  @default(false)
  isPublic    Boolean  @default(false)
  shareId     String?  @unique
  userId      String
  user        User     @relation(...)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

---

## Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `⌘K` / `Ctrl+K` | Open search / command palette |
| `⌘J` / `Ctrl+J` | Generate AI insights for current note |

---

## Deployment (Vercel)

1. Push to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add all environment variables from `.env.example`
4. Set `NEXTAUTH_URL` to your production URL
5. Deploy

For the database, [Neon](https://neon.tech) provides a free PostgreSQL instance that works perfectly with Vercel.

---

## Security

- All note mutations verify user ownership before executing
- Passwords hashed with bcrypt (10 rounds)
- JWT sessions via NextAuth
- Security headers: `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`
- Input validation and field whitelisting on all API routes
- No secrets committed to repository

---

## Optional Enhancements Implemented

- ✅ Framer Motion animations throughout
- ✅ Mobile responsive with slide-out navigation
- ✅ Loading skeletons on all data-fetching pages
- ✅ Empty states with helpful CTAs
- ✅ Keyboard shortcuts (⌘K, ⌘J)
- ✅ Dark mode (default) with theme switcher
- ✅ SEO metadata + Open Graph for shared notes
- ✅ Optimistic UI updates in notes list
- ✅ Full-text search via API
- ✅ Tag filtering in notes sidebar
- ✅ Real weekly activity data (not mock)
- ✅ Archive with restore + permanent delete
- ✅ Share link revocation
- ✅ Security hardening on all endpoints

---

## License

Built for evaluation purposes — Peblo Full Stack Developer Challenge, 2026.
