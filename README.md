# WebTalk 💬

Minimal real-time chat platform built with **Next.js** and **Supabase**.

A lightweight but production-oriented project focused on **direct messaging**,  
**clean architecture**, and **modern UX patterns**.

---

## ✨ Features

- 🔐 Authentication (email + password)
- 👤 User profiles with unique `@username`
- 🔍 Search users by username
- 💬 Direct 1-to-1 chats (auto create / reuse)
- ⚡ **Realtime messaging (Supabase Realtime)**
- 📬 Live updates (messages, sidebar, last message, unread count)
- 🧠 Smart chat logic (no duplicates, find-or-create)
- 🎯 Optimistic UI (instant message sending)
- 🧩 Clean modular architecture (context + components)

---

## 🧱 Tech Stack

- **Next.js (App Router)**
- **TypeScript**
- **Supabase**
  - Auth
  - Postgres DB
  - Realtime subscriptions
- **SCSS Modules**

---

## 🧠 Core Concepts

Each user:

- has a **name**
- has a unique **@username**
- can be found via search
- can start a **direct chat**

Each chat:

- is **unique between two users**
- is created automatically if it doesn't exist
- updates in **realtime**
- maintains **last message + unread count**

---

## ⚡ Realtime Architecture

- Uses **Supabase Realtime (Postgres changes)**
- Subscriptions:
  - `messages INSERT` → updates chat messages instantly
  - `messages INSERT` → updates sidebar (lastMessage + unread)
- No polling, no refresh — fully reactive UI

---

### Key ideas:

- **Context = data layer**
- **Components = pure UI**
- **Supabase = backend (no custom server)**

---

## 🚀 Implemented Logic

- Find or create chat (no duplicates)
- Local state sync + realtime merge
- Optimistic message sending
- Live sidebar updates
- Unread counter logic
- Auto sorting by last message
- Local chat selection persistence

---

## 🛠 Roadmap

- [x] Auth (register / login)
- [x] Profiles + username system
- [x] User search
- [x] Chat creation (find or create)
- [x] Messaging UI
- [x] **Realtime updates**
- [x] Sidebar live sync
- [ ] Message read status sync (DB-level)
- [ ] Image upload (storage)
- [ ] Group chats
- [ ] Notifications
- [ ] Settings page

---

## 📌 Notes

- `@username` stored **without `@`**
- usernames are **lowercase + unique**
- chats are **1-to-1 only (for now)**
- realtime is handled via **Supabase channels**

---

## 🎓 Project Status

This project is built for **learning + real-world practice**.

Focus areas:

- fullstack architecture (frontend + BaaS)
- realtime systems
- scalable state management
- clean UI/UX patterns

---

## 📄 License

This project is licensed under the **MIT License**.

It is primarily built for learning and experimentation, but you are free to use, modify, and distribute it for personal purposes.

---

## 📬 Contact

- 💬 Telegram — https://t.me/kznws111
- 📧 Email — alexander.kuznecov16@gmail.com

Open for feedback, ideas, and collaboration.
