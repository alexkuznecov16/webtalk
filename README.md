# WebTalk 💬

Minimal social chat platform built with **Next.js** and **Supabase**.

A lightweight project focused on usernames, direct messaging, and clean UI inspired by modern messengers.

---

## ✨ Features

- 🔐 Authentication (login / register)
- 👤 User profiles with unique `@username`
- 🔍 Search users by username
- 💬 Direct 1-to-1 chats
- ⚡ Realtime messaging (planned)
- 🧩 Clean modular architecture

---

## 🧱 Tech Stack

- **Next.js (App Router)**
- **TypeScript**
- **Supabase (Auth + Database + Realtime)**
- **SCSS Modules**

---

## 📁 Project Structure

```
src/
  app/
    (public)/        # Landing + auth pages
    (app)/           # Protected app (after login)
    layout.tsx       # Root layout

  components/
    landing/         # Landing UI (Header, Hero, About, Footer)
    auth/            # Auth forms
    layout/          # App shell (sidebar, layout)
    chat/            # Chat UI
    ui/              # Reusable components

  lib/
    supabase/        # Supabase clients (client/server)

  services/          # Business logic (auth, chats, messages)

  hooks/             # Custom React hooks

  types/             # TypeScript types
```

---

## 🚀 Getting Started

```bash
git clone https://github.com/your-username/WebTalk.git
cd WebTalk
npm install
```

Create `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
```

Run the dev server:

```bash
npm run dev
```

---

## 🔑 Core Concept

Each user:

- has a **name**
- has a unique **@username**
- can be found via search
- can start a **direct chat**

---

## 🛠 Roadmap

- [ ] Auth (register/login)
- [ ] Profiles (username system)
- [ ] User search
- [ ] Chat creation (find or create)
- [ ] Messaging UI
- [ ] Realtime updates
- [ ] Settings page

---

## 📌 Notes

- `@username` is stored without `@` in the database
- All usernames are lowercase and unique
- Direct chats are unique per user pair

---

## 🧠 Philosophy

Keep it:

- simple
- fast
- clean
- scalable

No overengineering — just solid fundamentals.

## 🎓 Project Status

This project is built for learning and experimentation.

The goal is to explore modern fullstack development with Next.js and Supabase,
including authentication, realtime features, and scalable architecture.

---

## 📄 License

MIT
