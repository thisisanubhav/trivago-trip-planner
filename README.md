<div align="center">

<br/>

```
 ████████╗██████╗ ██╗██████╗     ██╗███╗   ██╗████████╗███████╗██╗     
    ██╔══╝██╔══██╗██║██╔══██╗    ██║████╗  ██║╚══██╔══╝██╔════╝██║     
    ██║   ██████╔╝██║██████╔╝    ██║██╔██╗ ██║   ██║   █████╗  ██║     
    ██║   ██╔══██╗██║██╔═══╝     ██║██║╚██╗██║   ██║   ██╔══╝  ██║     
    ██║   ██║  ██║██║██║         ██║██║ ╚████║   ██║   ███████╗███████╗
    ╚═╝   ╚═╝  ╚═╝╚═╝╚═╝         ╚═╝╚═╝  ╚═══╝   ╚═╝   ╚══════╝╚══════╝
                                                                         
         ██████╗ ██╗      █████╗ ███╗   ██╗███╗   ██╗███████╗██████╗   
         ██╔══██╗██║     ██╔══██╗████╗  ██║████╗  ██║██╔════╝██╔══██╗  
         ██████╔╝██║     ███████║██╔██╗ ██║██╔██╗ ██║█████╗  ██████╔╝  
         ██╔═══╝ ██║     ██╔══██║██║╚██╗██║██║╚██╗██║██╔══╝  ██╔══██╗  
         ██║     ███████╗██║  ██║██║ ╚████║██║ ╚████║███████╗██║  ██║  
         ╚═╝     ╚══════╝╚═╝  ╚═╝╚═╝  ╚═══╝╚═╝  ╚═══╝╚══════╝╚═╝  ╚═╝  
```

### *Intelligent multi-city travel planning — designed around full itineraries, not isolated searches.*

<br/>

[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-⚡-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Anthropic](https://img.shields.io/badge/Anthropic-API-FF6B35?style=for-the-badge)](https://anthropic.com/)
[![trivago MCP](https://img.shields.io/badge/trivago-MCP%20Server-007FFF?style=for-the-badge)](https://trivago.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)

<br/>

[![LinkedIn](https://img.shields.io/badge/Built%20by%20Anubhav%20Sinha-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/anubhav-sinha-a70019287/)

</div>

---

## ✈️ What is this?

Most travel apps make you search for hotels **one city at a time**. Trip Intelligence Planner flips that model entirely.

Plan **Paris → Delhi → New York** as a single cohesive journey. Dates cascade automatically, hotel options are grouped per destination, and when you're done — a polished, AI-generated trip brief ties the whole itinerary together.

This project was built to answer one question: *what does hotel discovery feel like when the entire route is the unit of search, not a single destination?*

> 🎯 **Demo-ready out of the box** — no paid API credits required to explore the full planning experience.

---

## 🌟 Why This Project Stands Out

| Feature | What it means for the user |
|---|---|
| 🗺️ **Multi-city first** | The UI is built around a *sequence* of destinations — not one-off isolated hotel queries |
| 🎨 **Editorial interface** | Feels closer to a premium travel tool than a raw API demo |
| 🔄 **Progressive workflow** | Planning → Comparison → Itinerary — three clear, distraction-free steps |
| 🔒 **Backend-safe architecture** | Anthropic credentials live on the server, never exposed in the browser bundle |
| 🛡️ **Graceful fallback** | No live API? No problem. The app drops into demo data instead of crashing |

---

## 🗺️ The Planning Experience

### `Step 1` — Build Your Route
Add destinations, set the nights you want in each city, and watch check-in/check-out dates **cascade automatically** from stop to stop. No manual date math.

### `Step 2` — Compare Stays City by City
Hotels are grouped **per destination** — so you're shortlisting one great option per city, not drowning in an undifferentiated wall of results.

### `Step 3` — Review Your Trip Budget
The planner calculates total accommodation cost, average nightly rate, and a **city-by-city cost breakdown** before you commit to anything.

### `Step 4` — Generate a Trip Brief
Selected stays transform into a compact itinerary: timeline, property summaries, and an **AI-written travel brief** (powered by Anthropic when live access is available).

---

## 🧪 Demo Mode

This repo is intentionally portfolio and demo friendly.

When `VITE_USE_MOCK_DATA=true`:

- ✅ Hotel results fall back to curated local sample data
- ✅ The full planning flow remains explorable
- ✅ The itinerary screen works end-to-end
- ✅ No Anthropic billing required

**Demo mode is the recommended default for first-time setup.**

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+
- **npm**

### 1 · Clone & Install

```bash
git clone https://github.com/thisisanubhav/trivago-trip-planner.git
cd trivago-trip-planner
npm install
```

### 2 · Configure Environment

```bash
cp .env.example .env
```

**For demo mode (recommended):**
```env
VITE_USE_MOCK_DATA=true
```

**For live Anthropic-backed requests:**
```env
ANTHROPIC_API_KEY=your_real_key_here
VITE_USE_MOCK_DATA=false
```

### 3 · Run Locally

```bash
npm run dev
```

| Service | URL |
|---|---|
| ⚡ Vite Frontend | `http://localhost:3000` |
| 🖥️ API Backend | `http://localhost:3001` |

---

## 📦 Production Build

```bash
# Build the frontend bundle
npm run build

# Serve frontend + API together
npm run start
```

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      Browser (React 18 + Vite)          │
│   ┌────────────┐  ┌──────────────┐  ┌───────────────┐  │
│   │ Destination│  │ Hotel Cards  │  │   Itinerary   │  │
│   │  Planner   │  │ (per city)   │  │     View      │  │
│   └─────┬──────┘  └──────┬───────┘  └───────┬───────┘  │
└─────────┼────────────────┼──────────────────┼───────────┘
          │         /api/search-hotels   /api/travel-brief
          ▼                ▼                   ▼
┌─────────────────────────────────────────────────────────┐
│              Local Node HTTP Server (Backend)           │
│         Keeps Anthropic credentials server-side         │
└────────────────────────┬────────────────────────────────┘
                         │
          ┌──────────────┴────────────────┐
          ▼                               ▼
┌──────────────────┐           ┌──────────────────────┐
│  Anthropic       │           │  trivago MCP Server  │
│  Messages API    │           │  (Hotel Discovery)   │
└──────────────────┘           └──────────────────────┘
```

### Tech Stack

**Frontend**
- React 18 · Vite · CSS Modules

**Backend**
- Lightweight Node HTTP server
- `/api/search-hotels` · `/api/travel-brief` · `/api/health`

**AI & Integrations**
- Anthropic Messages API
- trivago MCP Server

---

## 📁 Project Structure

```
trivago-trip-planner/
│
├── server/
│   ├── apiServer.mjs       # Local dev API server
│   ├── appServer.mjs       # Serves built frontend + API in one process
│   └── service.mjs         # Backend logic for Anthropic/trivago requests
│
├── scripts/
│   └── dev.mjs             # Starts frontend and backend concurrently
│
└── src/
    ├── api/
    │   └── claude.js        # Client-side wrappers for backend endpoints
    ├── components/          # Destination, hotel, budget, and itinerary UI
    ├── utils/
    │   └── dates.js         # Date helpers for cascading stay logic
    ├── App.jsx              # Main application flow and state
    ├── App.module.css       # App shell styling
    └── index.css            # Global design system and visual tokens
```

---

## ✅ What's Working Today

- [x] Multi-destination planning flow
- [x] Cascading travel dates
- [x] Hotel comparison cards (grouped per city)
- [x] Accommodation budget summary
- [x] Itinerary assembly & AI-generated brief
- [x] Local backend routing (credentials stay server-side)
- [x] Demo-mode fallback behaviour
- [x] Production build output

---

## ⚠️ Current Limitations

- Live hotel search requires an active Anthropic billing account
- Demo mode uses representative sample data — not real-time trivago results
- Optimised for a strong product demo and code sample, not enterprise-scale booking workflows

---

## 🔐 Why the Backend Matters

Earlier iterations routed model requests through `VITE_ANTHROPIC_API_KEY` — meaning credentials lived in the browser bundle, visible to anyone who opened DevTools.

The current architecture moves all Anthropic calls to a local Node server. **Your API key never ships to the client.** This makes the project significantly closer to production shape while remaining simple enough to run in one command.

---

## 🔭 Future Improvements

- [ ] Add screenshots and a short product walkthrough GIF
- [ ] Persist saved trip plans across sessions
- [ ] Support alternate AI providers for itinerary generation
- [ ] Add transport and flight planning between selected cities
- [ ] Ship a hosted preview with a shared demo environment

---

## 📄 License

Released under the [MIT License](LICENSE). Use it, fork it, learn from it.

---

<div align="center">

**Built with curiosity and a love for great travel UX.**

[![LinkedIn](https://img.shields.io/badge/Connect%20with%20Anubhav-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/anubhav-sinha-a70019287/)

<sub>If this project helped you, a ⭐ on the repo goes a long way.</sub>

</div>
