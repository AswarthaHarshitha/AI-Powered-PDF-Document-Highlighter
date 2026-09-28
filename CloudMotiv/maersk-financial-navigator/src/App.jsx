// src/App.jsx
import React, { useRef, useState } from "react";
import PdfViewer from "./components/PdfViewer";
import "./App.css";

// Use your local path (encoded when passed)
const PDF_PATH = 'Maersk-Q2-2025 Interim Report .pdf';

export default function App() {
  const viewerRef = useRef(null);
  const [status, setStatus] = useState("Starting...");
  const [matches, setMatches] = useState([]);
  const [persist, setPersist] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("mf_persist")) ?? true;
    } catch {
      return true;
    }
  });

  // on PDF viewer ready
  const onReady = () => {
    setStatus("Document ready");
    // try restore highlights if any
    const raw = localStorage.getItem("mf_highlights");
    if (raw && persist) {
      try {
        const arr = JSON.parse(raw);
        arr.forEach((h) => {
          viewerRef.current.addHighlight(h.page, h.rect);
        });
      } catch {
        // ignore unreadable saved highlights
      }
    }
  };

  const onError = (err) => {
    console.warn("Document load failed:", err?.message || err);
    setStatus("Document load failed: " + (err?.message || String(err)));
  };

  // helper: normalize text snippet
  const normalize = (s) => (s || "").toString().replace(/\s+/g, " ").trim().toLowerCase();

  // search algorithm: look across per-page text boxes (boxes are in page pixels)
  const findAcross = (phrase, pageHint = null) => {
    const boxesMap = viewerRef.current?.getTextIndex();
    if (!boxesMap) {
      setStatus("Text index not ready");
      return [];
    }
    const q = normalize(phrase);
    const pages = pageHint ? [pageHint] : Object.keys(boxesMap).map(Number).sort((a, b) => a - b);
    const results = [];

    for (const p of pages) {
      const boxes = boxesMap[p] || [];
      for (let i = 0; i < boxes.length; i++) {
        let concat = "";
        const window = [];
        for (let j = i; j < Math.min(i + 18, boxes.length); j++) {
          concat += boxes[j].text || "";
          window.push(boxes[j]);
          if (concat.length < 6) continue;
          const norm = normalize(concat);
          if (norm.includes(q)) {
            // bounding rect in page pixels
            const left = Math.min(...window.map((b) => b.left));
            const top = Math.min(...window.map((b) => b.top));
            const right = Math.max(...window.map((b) => b.left + b.width));
            const bottom = Math.max(...window.map((b) => b.top + b.height));
            const rect = { left, top, width: right - left, height: bottom - top };
            results.push({
              id: `m-${Date.now()}-${results.length}`,
              page: p,
              snippet: norm,
              rect,
            });
            break;
          }
        }
      }
    }

    // draw highlights and populate state
    // clear old visual highlights first
    viewerRef.current?.clearHighlights();
    results.forEach((r) => viewerRef.current?.addHighlight(r.page, r.rect));
    setMatches(results);

    // optionally persist highlights
    if (persist) localStorage.setItem("mf_highlights", JSON.stringify(results.map((r) => ({ page: r.page, rect: r.rect }))));

    return results;
  };

  // convenience quick-jumps
  const jump1 = () => findAcross("EBITDA of USD 2.3 bn", null).length && viewerRef.current?.scrollToPage(findAcross("EBITDA of USD 2.3 bn")[0].page);
  const jump2 = () => findAcross("Ocean revenue increased by 2.4%", 5).length && viewerRef.current?.scrollToPage(findAcross("Ocean revenue increased by 2.4%", 5)[0].page);
  const jump3 = () => {
    const res = findAcross("Gain on sale of non-current assets", 15);
    if (!res.length) {
      // try broader
      findAcross("gain on sale of non-current", 15);
    } else {
      viewerRef.current?.scrollToPage(res[0].page);
    }
  };

  // small handler for search input
  const onSearchKey = (e) => {
    if (e.key === "Enter") {
      findAcross(e.target.value);
    }
  };

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">Maersk Financial Navigator</div>
        <div className="status-line">{status}</div>
      </header>

      <div className="workspace">
        <div className="left-col">
          <div className="viewer-card">
            <PdfViewer url={PDF_PATH} ref={viewerRef} onReady={onReady} onError={onError} />
          </div>
        </div>

        <aside className="right-col">
          <div className="panel">
            <h3>Analysis</h3>
            <p className="panel-copy">Jump to key financial references or type a phrase to locate it in the report. Matches will be highlighted in the viewer.</p>

            <div className="quick-buttons">
              <button onClick={jump1} className="btn small">Jump to [1] — EBITDA</button>
              <button onClick={jump2} className="btn small">Jump to [2] — Ocean revenue</button>
              <button onClick={jump3} className="btn primary">Jump to [3] — Asset sales</button>
            </div>

            <div className="search-block">
              <input placeholder="Type phrase and press Enter" onKeyDown={onSearchKey} />
            </div>

            <div className="persist-row">
              <label>Keep highlights</label>
              <input type="checkbox" checked={persist} onChange={(e) => setPersist(e.target.checked)} />
            </div>

            <div className="matches">
              <h4>Matches</h4>
              {matches.length === 0 && <div className="muted">No matches yet</div>}
              <ol>
                {matches.map((m) => (
                  <li key={m.id}>
                    <button className="match-line" onClick={() => viewerRef.current?.scrollToPage(m.page)}>
                      Page {m.page} — {m.snippet.slice(0, 120)}{m.snippet.length > 120 ? "…" : ""}
                    </button>
                  </li>
                ))}
              </ol>
            </div>

            <div className="doc-info">
              <small>Document</small>
              <div className="path">{encodeURI(PDF_PATH)}</div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}