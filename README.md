# Trip Intelligence Planner

A polished multi-city travel planning experience built with **React**, **Vite**, and the **trivago MCP server**.

This project was created to explore what hotel discovery feels like when the search flow is designed around a full itinerary instead of one destination at a time. Rather than forcing separate searches for Paris, Delhi, and New York, the planner lets a traveler shape the whole route first, compare hotel options city by city, and then generate a concise trip brief from the final selections.

The app is currently set up to run beautifully in **demo mode**, which makes it easy to share, review, and iterate on the product without relying on paid API credits.

## Why this project stands out

- **Multi-city first**: the UI is built around a sequence of destinations, not isolated one-off hotel searches.
- **Editorial interface**: the product feels closer to a premium travel planning tool than a raw form-based demo.
- **Progressive workflow**: planning, comparison, and itinerary creation are separated into clear steps.
- **Backend-ready architecture**: Anthropic calls are routed through a local Node backend instead of the browser.
- **Graceful fallback behavior**: when live API access is unavailable, the app drops into demo data instead of breaking.

## Core experience

### 1. Plan a route
Travelers can add multiple destinations, adjust nights, and let check-in/check-out dates cascade automatically from one stop to the next.

### 2. Compare stays by city
The app groups results per destination, making it easy to shortlist one hotel in each location rather than losing context in a single giant list.

### 3. Review trip budget
Once hotels are selected, the planner rolls up accommodation cost, average nightly spend, and city-by-city breakdowns.

### 4. Generate a trip summary
The itinerary view turns selected stays into a compact trip overview with timeline, property summary, and an AI-generated travel brief when live access is available.

## Demo mode

This repository is intentionally friendly to demo and portfolio use.

In demo mode:

- hotel results fall back to local sample data
- the UI still shows the full planning flow
- the itinerary screen still works
- the app remains useful even if Anthropic billing is unavailable

If you simply want to run the project and explore the product, demo mode is the best default.

## Local setup

### Prerequisites

- Node.js 18+
- npm

### Install

```bash
git clone https://github.com/thisisanubhav/trivago-trip-planner.git
cd trivago-trip-planner
npm install
```

### Configure

Copy the environment template:

```bash
cp .env.example .env
```

Recommended demo-mode setup:

```bash
VITE_USE_MOCK_DATA=true
```

If you want to try live Anthropic-backed requests later, use:

```bash
ANTHROPIC_API_KEY=your_real_key_here
VITE_USE_MOCK_DATA=false
```

### Run the app

```bash
npm run dev
```

This starts:

- the Vite frontend on `http://localhost:3000`
- the local API backend on `http://localhost:3001`

## Production-style run

Build the frontend bundle:

```bash
npm run build
```

Serve the built app and API together:

```bash
npm run start
```

## Architecture

### Frontend

- **React 18**
- **Vite**
- **CSS Modules**

### Backend

- lightweight **Node HTTP server**
- `/api/search-hotels`
- `/api/travel-brief`
- `/api/health`

### AI and MCP integration

- **Anthropic Messages API**
- **trivago MCP server**

The current backend is designed so Anthropic credentials stay on the server, not in the browser bundle.

## Project structure

```text
server/
  apiServer.mjs       Local API server for development
  appServer.mjs       Serves built frontend + API in one process
  service.mjs         Backend logic for Anthropic/trivago requests

scripts/
  dev.mjs             Starts frontend and backend together

src/
  api/claude.js       Client-side wrappers for backend endpoints
  components/         Destination, hotel, budget, and itinerary UI
  utils/dates.js      Date helpers for cascading stay logic
  App.jsx             Main application flow and state
  App.module.css      App shell styling
  index.css           Global design system and visual tokens
```

## What is working today

- multi-destination planning flow
- cascading travel dates
- hotel comparison cards
- accommodation budget summary
- itinerary assembly
- local backend routing
- demo-mode fallback behavior
- production build output

## Current limitations

- live hotel search depends on Anthropic billing being active
- demo mode uses representative fallback data instead of real-time trivago responses
- the app is optimized for a strong product demo and code sample, not for enterprise-scale booking workflows

## Why the backend matters

Earlier versions of the project used a client-side `VITE_ANTHROPIC_API_KEY`, which is not safe for a real deployment. The current version moves model requests to the backend so the app is closer to production shape while still staying simple enough to run locally.

## Future improvements

- add screenshots or a short product GIF to the README
- persist saved trip plans
- support alternate AI providers for itinerary generation
- add transport planning between selected cities
- ship a hosted preview with a shared demo environment

## License

MIT
