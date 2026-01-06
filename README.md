# 🚀 YouGrow - Creator Studio

YouGrow is designed to help YouTube creators generate ideas, analyze content trends, and improve consistency using their own data - all through a clean, modern UI.

The project focuses on **end-to-end product engineering**: authentication, background jobs, analytics dashboards, and thoughtful UX - without relying on external analytics APIs.

---

## ✨ Key Features

### 🔐 Authentication
- Email + password authentication
- Google OAuth sign-in
- Secure JWT-based sessions
- Profile management (name, email change, avatar support)

---

### 📺 Channel Management
- Add and manage YouTube channels
- Channels are user-scoped (multi-account safe)
- Foundation for analytics and idea generation

---

### 💡 Idea Generation Workflow
- Queue idea-generation jobs per channel 
- Background job system (local worker)
- Persisted ideas with: (by Gemini 2.5 flash)
  - Topic
  - Hook
  - Title
  - Thumbnail text
- Thumbnail generation job support

---

### 📊 Insights Dashboard 
- Channel count, idea count, job count
- Success rate calculation
- Time-range toggle (7 days / 30 days)
- Charts:
  - Ideas over time
  - Job status breakdown
- Analytics panels:
  - Top topics
  - Idea sources
  - Channel leaderboard
  - Most common hook patterns (simple text analysis)
- Rule-based recommendations

---

### 🎨 Polished UI / UX
- Modern, minimal SaaS-style UI
- Responsive dashboard layout
- Clean landing page with feature overview
- Empty-state friendly 
- Product-focused copy 

---

## 🧱 Tech Stack

### Frontend
- **Next.js (App Router)**
- **React**
- **TypeScript**
- **Tailwind CSS**
- **shadcn/ui**

### Backend
- **NextAuth (Auth.js)**
- **Prisma ORM**
- **SQLite (local-first database)**
- **Server Actions**
- **Background job queue (local worker)**

### AI / Jobs
- Local-first AI idea generation
- Gemini (as idea source)
- Job queue abstraction for future providers

---

## 📁 Project Structure (High Level)

```text
src/
├─ app/
│  ├─ dashboard/
│  │  ├─ channel/
│  │  ├─ ideas/
│  │  ├─ insights/
│  ├─ api/
│  │  ├─ auth/
│  │  ├─ jobs/
│  │  ├─ profile/
├─ components/
│  ├─ ui/
│  ├─ site/
│  ├─ insights/
├─ lib/
│  ├─ db.ts
│  ├─ analytics.ts
│  ├─ jobs/
│  ├─ mailer.ts
├─ auth.ts


## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.



