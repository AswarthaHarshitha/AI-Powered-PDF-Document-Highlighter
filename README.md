# PDF Document Highlighter — Maersk Financial Navigator

A React single-page app for navigating a long financial report. It renders the Maersk Q2 2025 Interim Report in the browser with pdf.js, indexes the text on every page, and lets the reader locate any phrase — or jump straight to key financial references — with the matching region highlighted on the page.

**Live:** https://cloud-motive-assignment-pdf-highlig.vercel.app

## Features

- **In-browser PDF rendering** — every page is drawn to a canvas with pdf.js; no server-side processing.
- **Positional text index** — text items on each page are mapped to pixel bounding boxes, so matches can be drawn exactly where the text sits.
- **Phrase search across line breaks** — the search joins neighbouring text items before matching, so phrases split across PDF text runs are still found.
- **Quick jumps** — one-click navigation to EBITDA, Ocean revenue and gain-on-asset-sale references.
- **Match list** — results listed by page with a snippet; clicking one scrolls to that page.
- **Persistent highlights** — optionally saved to `localStorage` and restored on reload.

## Tech Stack

React 19 · Vite 7 · pdf.js (loaded from CDN) · ESLint · deployed on Vercel

## How It Works

`PdfViewer` fetches the PDF as bytes, renders each page to a canvas and builds a per-page list of text boxes (`{text, left, top, width, height}`) from pdf.js text content. It exposes `getTextIndex`, `addHighlight`, `clearHighlights` and `scrollToPage` through a ref. `App` runs the search over that index, computes the bounding rectangle of each match and asks the viewer to draw the highlight overlays.

## Running Locally

The app lives in `CloudMotiv/maersk-financial-navigator`.

```bash
cd CloudMotiv/maersk-financial-navigator
npm install
npm run dev        # http://localhost:5173
npm run build      # production build in dist/
npm run lint
```

The report is served from `public/`; to use a different document, place it there and update `PDF_PATH` in `src/App.jsx`.
