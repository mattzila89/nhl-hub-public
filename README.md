# NHL Hub

A real-time private NHL hub built with React, TypeScript, Socket.IO, and Supabase. Designed and developed as an independent personal project.

NHL Hub combines live game data, playoff tracking, and a feature-rich real-time chat system into a desktop and mobile-friendly web application designed for immersive hockey viewing with friends.

---

## Preview

[![Watch the demo](/docs/screenshots/home.png)](https://zxjfbybflcnjgjcazcoy.supabase.co/storage/v1/object/public/videos/NHLHub-Preview.mp4)

---

## Highlights

- Real-time Socket.IO chat with reactions, typing indicators, read receipts, GIF search, image uploads, edits, deletes, and link previews
- Team-personalized UI themes, wallpapers, avatars, and goal overlays
- Live NHL game data aggregation through a custom Express API layer
- Theater-mode highlight viewing experiences
- Supabase-backed authentication and session management
- Responsive desktop/mobile layouts
- Cypress end-to-end testing suite
- Production deployment using Vercel and Render

---

## Tech Stack

### Frontend

- React 19
- TypeScript
- Vite 8
- React Router 7
- TanStack Query 5
- MUI 9

### Backend

- Express 5
- Socket.IO 4
- Supabase
- Giphy API

### Deployment

- Vercel (frontend)
- Render (backend)

---

## Engineering Focus

This project was built with an emphasis on:

- scalable frontend architecture
- reusable React component patterns
- responsive UI/UX
- real-time synchronization
- maintainable TypeScript patterns
- API abstraction layers
- performance-conscious rendering
- session persistence and authentication flows

---

## Features

### Authentication

- Private 8-digit access-code login
- Supabase-backed sessions
- Login rate limiting and lockout protection
- Persistent authentication via `/me` hydration

### Personalized Experience

- Favorite-team onboarding flow
- Team-driven wallpapers, colors, avatars, and overlays
- Dynamic UI personalization throughout the application

### Live NHL Experience

- Live NHL schedules and game surfaces
- Current NHL standings and wild-card views
- Stanley Cup Playoffs bracket and round schedules
- Theater-mode viewing experiences for watching highlights

### Real-Time Chat

- Socket.IO-powered chat
- Presence indicators
- Typing indicators
- Message reactions
- Read receipts
- GIF search
- Image uploads
- Message editing/deleting
- Goal siren overlays and synchronized animations

## Testing

The project includes an expanding Cypress E2E test suite covering:

- Authentication flows
- Team onboarding
- Route protection
- Playoff bracket rendering
- Navigation flows

The project also includes an expanding Vitest unit test suite covering:

- Chat messaging
- Chat backend coverage
- Chat emojis/gifs
- Frontend environment behavior
- Backend NHL/date helper coverage
- Team data hygiene
- TV broadcast logos

---

## Deployment

The frontend is deployed with Vercel.

The backend API and Socket.IO server are deployed with Render.

The application uses SPA rewrites and no-index headers to keep the app private and non-searchable.

# Motivation

I wanted to build a hockey-focused platform that combined live game data, real-time interaction, and team-themed UI experiences into a single application where friends could follow games together and interact in a more immersive way.

The project also serves as a playground for experimenting with real-time systems, frontend architecture, responsive UI patterns, and interactive user experiences.

# Future Improvements

- Native mobile app
- Push notifications
- Friend betting/prediction systems
- Watch-party synchronization
- Enhanced analytics and presence systems

# License

Private project. Not licensed for public use.

Copyright (c) 2026 Matt Pugh

This project is provided for portfolio and educational viewing purposes only.

No permission is granted to copy, modify, distribute, sublicense, or use this software commercially without explicit written permission.
