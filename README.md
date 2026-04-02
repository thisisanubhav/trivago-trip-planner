# trivago Trip Intelligence Planner

A multi-city hotel search and trip planning app built on the **trivago MCP Server** + **Claude AI**.

Submitted as part of a trivago job application to demonstrate real-world usage of the trivago MCP API.

---

## What it does

Most hotel search tools require separate searches per city. This app solves that by letting you plan a full multi-stop trip in one place:

1. **Multi-destination search** — add 2, 3, or more cities; check-in dates cascade automatically
2. **Parallel hotel search** — queries the trivago MCP for each city, returning 3 options per destination
3. **Hotel selection & budget rollup** — pick one hotel per city, see total trip cost instantly
4. **AI travel brief** — Claude generates a personalised 200-word itinerary guide for your exact selections

## MCP tools used

| Tool | Where used |
|------|-----------|
| `trivago-accommodation-search` | Hotel search per destination with check-in/out, adults, rooms |
| `trivago-search-suggestions` | City name resolution before search |
| `trivago-accommodation-radius-search` | Available for landmark-based search extension |

---

## Getting started

### Prerequisites

- Node.js 18+
- An [Anthropic API key](https://console.anthropic.com)

### Install

```bash
git clone https://github.com/YOUR_USERNAME/trivago-trip-planner.git
cd trivago-trip-planner
npm install
```

### Configure

```bash
cp .env.example .env
# Edit .env and add your Anthropic API key
```

For local UI demos without a live API key, you can also set:

```bash
VITE_USE_MOCK_DATA=true
```

### Run locally

```bash
npm run dev
# Open http://localhost:3000
```

### Build for production

```bash
npm run build
# Output in /dist
```

---

## Deploy

### Vercel (recommended)

```bash
npm i -g vercel
vercel
```

Set `VITE_ANTHROPIC_API_KEY` in your Vercel project environment variables.
If you want to demo the UI without live traffic, set `VITE_USE_MOCK_DATA=false` in production and keep fallback mode for local development only.

### Netlify

```bash
npm i -g netlify-cli
netlify deploy --build
```

Set `VITE_ANTHROPIC_API_KEY` in Netlify → Site settings → Environment variables.

---

## Project structure

```
src/
├── api/
│   └── claude.js          # All Anthropic API + trivago MCP calls
├── components/
│   ├── DestinationCard.jsx  # Per-city input card with cascading dates
│   ├── HotelCard.jsx        # Individual hotel result card
│   ├── BudgetSummary.jsx    # Total cost breakdown across cities
│   └── ItineraryView.jsx    # Timeline + AI travel brief
├── utils/
│   └── dates.js             # Date helpers (cascade, format, add days)
├── App.jsx                  # Main app shell, tab routing, state
└── index.css                # Global tokens, dark mode, base styles
```

---

## Tech stack

- **React 18** + **Vite**
- **trivago MCP Server** via Anthropic's MCP integration
- **Claude claude-sonnet-4-20250514** for hotel search orchestration + travel brief generation
- CSS Modules with full dark mode support

---

## Notes

- This project now validates env config at runtime and can run in explicit mock mode with `VITE_USE_MOCK_DATA=true`.
- The Anthropic API key is still used client-side (via `VITE_` prefix). For a real production deployment, move the Anthropic request logic into a server or serverless function so the key never reaches the browser.
- Hotel data is sourced from trivago via the MCP server when available. If the live call fails, the UI clearly labels fallback demo data instead of silently swapping it in.

---

## License

MIT
