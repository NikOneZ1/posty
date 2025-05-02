# Posty

A modern, full-stack content ideation and generation platform for creators and teams. Easily manage content ideas, generate AI-powered content (e.g., Twitter threads), and save drafts for later editing and publishing.

---

## 🚀 Features

- **Project & Idea Management**: Organize your content ideas by project.
- **AI Content Generation**: Expand ideas into full content (Twitter threads, more coming soon) using OpenAI GPT-4.
- **Drafts**: Auto-save and auto-load drafts for each idea, so you never lose your work.
- **Authentication**: Secure, user-based access with Supabase Auth.
- **Modern UI**: Built with React, Next.js App Router, and Tailwind CSS.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, Next.js 15 (App Router), TypeScript
- **Backend/API**: Next.js API routes (Edge/serverless), OpenAI API
- **Database**: Supabase (Postgres)
- **Auth**: Supabase Auth (JWT-based)
- **Styling**: Tailwind CSS, Radix UI, Lucide Icons
- **State/UX**: React hooks, Toast notifications (sonner)

---

## 📁 Project Structure

```
src/
  app/                # Next.js App Router pages & API routes
    project/[id]/idea/[idea_id]/page.tsx   # Idea details, content generation, draft auto-save
    api/
      content/generate/route.ts            # AI content generation endpoint
      drafts/
        save/route.ts                      # Save or update a draft
        get/route.ts                       # Fetch a draft for an idea
  components/          # UI components (Button, Card, Select, etc.)
  services/            # Client-side API service functions (drafts, ideas, etc.)
  types/               # TypeScript types (Idea, Draft, etc.)
  lib/                 # Utilities (Supabase client, validation, etc.)
public/                # Static assets
```

---

## 🧑‍💻 Local Development

### 1. **Clone the repo**
```sh
git clone https://github.com/yourusername/posty.git
cd posty
```

### 2. **Install dependencies**
```sh
npm install
```

### 3. **Configure environment variables**
Create a `.env.local` file with:
```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
OPENAI_API_KEY=your-openai-api-key
```

### 4. **Run the development server**
```sh
npm run dev
```
Visit [http://localhost:3000](http://localhost:3000)

---

## 🗄️ Database Setup (Supabase)
- Create a new project at [supabase.com](https://supabase.com/)
- Run the migrations in `supabase/migrations/` to set up tables and RLS policies
- Configure Auth (email/password or social)

---

## 🚢 Deployment
- Deploy to [Vercel](https://vercel.com/) (recommended) or any platform supporting Next.js 15+
- Set the same environment variables in your deployment dashboard
- Ensure your Supabase project allows connections from your deployed domain

---

## 📝 Notable Technologies
- **Next.js App Router**: Modern file-based routing and server components
- **Supabase**: Postgres DB, Auth, and instant REST API
- **OpenAI**: GPT-4 for content generation
- **Tailwind CSS**: Utility-first styling
- **Radix UI**: Accessible, composable UI primitives
- **Lucide Icons**: Beautiful icon set
- **Sonner**: Toast notifications

---

## 🤝 Contributing
Pull requests and issues are welcome! Please open an issue to discuss your idea or bug before submitting a PR.

---

## 📄 License
MIT
