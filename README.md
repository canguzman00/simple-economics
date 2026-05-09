# Simple Economics

> The economy, translated for your life.

A content platform that makes economic news personally relevant — connecting global events to housing, jobs, savings, and daily decisions.

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 14 (App Router) |
| Database | PostgreSQL via Prisma ORM |
| Auth | NextAuth.js v4 (Google OAuth + Email magic link) |
| AI | Anthropic Claude (Ask Carlos feature) |
| Styling | Tailwind CSS + shadcn/ui |
| Fonts | DM Serif Display · DM Sans · JetBrains Mono |
| Deployment | Vercel |

## Local Setup

### 1. Prerequisites

- Node.js 18+
- A PostgreSQL database (local or hosted — [Neon](https://neon.tech) free tier works)
- Google OAuth app ([console.cloud.google.com](https://console.cloud.google.com))
- SMTP credentials for magic links ([Resend](https://resend.com) free tier works)
- Anthropic API key ([console.anthropic.com](https://console.anthropic.com))

### 2. Clone and install

```bash
git clone https://github.com/canguzman/simple-economics.git
cd simple-economics
npm install
```

### 3. Configure environment

```bash
cp .env.example .env.local
```

Edit `.env.local` and fill in every value. See the [Environment Variables](#environment-variables) section below.

### 4. Set up the database

```bash
# Run migrations
npx prisma migrate dev --name init

# (Optional) open Prisma Studio to browse data
npx prisma studio
```

### 5. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Environment Variables

Copy `.env.example` to `.env.local` and fill in each value.

### Database

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |

### NextAuth

| Variable | Description |
|---|---|
| `NEXTAUTH_SECRET` | Random secret — generate with `openssl rand -base64 32` |
| `NEXTAUTH_URL` | App's public URL (`http://localhost:3000` locally) |

### Google OAuth

Create credentials at [console.cloud.google.com](https://console.cloud.google.com/apis/credentials).
Set the authorized redirect URI to `{NEXTAUTH_URL}/api/auth/callback/google`.

| Variable | Description |
|---|---|
| `GOOGLE_CLIENT_ID` | OAuth 2.0 client ID |
| `GOOGLE_CLIENT_SECRET` | OAuth 2.0 client secret |

### Email (Magic Links)

| Variable | Description |
|---|---|
| `EMAIL_SERVER_HOST` | SMTP host (e.g. `smtp.resend.com`) |
| `EMAIL_SERVER_PORT` | SMTP port (e.g. `465`) |
| `EMAIL_SERVER_USER` | SMTP username |
| `EMAIL_SERVER_PASSWORD` | SMTP password or API key |
| `EMAIL_FROM` | Sender address shown in emails |

### Anthropic

| Variable | Description |
|---|---|
| `ANTHROPIC_API_KEY` | API key from [console.anthropic.com](https://console.anthropic.com) |

---

## Deploying to Vercel

### One-click

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/canguzman/simple-economics)

### Manual

1. Push this repo to GitHub
2. Import the repo at [vercel.com/new](https://vercel.com/new)
3. Add all environment variables from `.env.example` in the Vercel dashboard
4. Vercel runs `npx prisma generate && next build` automatically (configured in `vercel.json`)
5. After first deploy, run your initial migration against the production database:

```bash
DATABASE_URL="<prod-url>" npx prisma migrate deploy
```

> **Note:** Set `NEXTAUTH_URL` to your production Vercel URL (e.g. `https://simple-economics.vercel.app`).

---

## Project Structure

```
src/
  app/
    (auth)/signin/    # Sign-in page (no header/footer)
    (main)/           # App pages with header + footer chrome
    api/auth/         # NextAuth route handler
  components/
    layout/           # Header, Footer
    ui/               # shadcn components (Sheet, Avatar)
  lib/
    auth.ts           # NextAuth config + helpers
    prisma.ts         # Prisma client singleton
    anthropic.ts      # Anthropic client
  types/              # TypeScript type extensions
prisma/
  schema.prisma       # Database schema (User, EconEvent, UserQuestion, SavedEvent)
```

---

## Legal

Simple Economics provides economic education only. Not financial or investment advice.
