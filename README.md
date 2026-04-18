# NUGuide Frontend — Tour Guide Assistant UI

The frontend interface for NUGuide, an AI-powered chatbot built for Niagara University's admissions tour guides. Built with Next.js and React, featuring a dark-themed design system with real-time chat, source citations, and feedback collection.

## Screenshots

> Screenshots coming soon

## Features

- **Welcome Screen** — Hero section with category quick-start cards and suggested questions for fast access to common topics
- **Real-Time Chat** — Message bubbles with typing indicator, auto-scroll, and smooth animations
- **Source Citations** — Expandable source tags on every response — web sources are clickable and open in a new tab
- **Feedback System** — Thumbs up/down on every assistant response, sent to the backend for quality tracking
- **Collapsible Sidebar** — Quick prompts, new conversation button, and key contacts for the admissions office
- **Status Indicator** — Live green/red dot showing backend API connectivity, pings every 30 seconds
- **Mobile Responsive** — Adaptive layout with 768px breakpoint, 2-column cards on mobile, wider message bubbles

## Design System

| Token | Value |
|-------|-------|
| Background | `#080511` (dark purple-black) |
| Primary | `#7C3AED` (purple) |
| Accent | `#D4A017` (gold) |
| Headings | Playfair Display |
| Body | Inter |

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| UI | React |
| Styling | Tailwind CSS v4, CSS custom properties |
| Fonts | Playfair Display, Inter (via next/font/google) |

## Project Structure

```
app/
  page.js            — Main page, state management, welcome screen + chat view
  layout.js          — Fonts, metadata
  globals.css        — Design tokens, animations, base styles
components/
  Sidebar.js         — Collapsible slide-in panel with quick prompts
  ChatWindow.js      — Message list with auto-scroll and background glow
  Message.js         — User/assistant bubbles, sources toggle, feedback buttons
  ChatInput.js       — Auto-resizing textarea with send button
  TypingIndicator.js — Animated 3-dot bounce while waiting for response
  SourceTag.js       — Clickable pill badges for web sources, static for documents
  StatusIndicator.js — Green/red connectivity dot with 30s polling
lib/
  api.js             — API client (checkHealth, sendMessage, submitFeedback, clearSession)
  constants.js       — Session config, quick prompts, category cards, starter questions
  useWindowSize.js   — useWindowSize() and useIsMobile() hooks
```

## Setup

### Prerequisites

- Node.js 18+
- NUGuide backend running (see [nuguide-backend](https://github.com/[username]/nuguide-backend))

### Installation

```bash
git clone https://github.com/[username]/nuguide-frontend.git
cd nuguide-frontend
npm install
```

### Configuration

Create `.env.local` in the project root:

```bash
cp .env.example .env.local
```

Edit `.env.local` to point to your backend:

```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Backend

The companion backend repository is available at [github.com/[username]/nuguide-backend](https://github.com/[username]/nuguide-backend).

## License

This project was built as part of coursework and professional development at Niagara University.