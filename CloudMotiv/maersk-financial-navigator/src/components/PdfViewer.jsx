// src/components/PdfViewer.jsx
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";

/*
 PdfViewer (robust)
 - fetches PDF bytes first (ArrayBuffer) to avoid URL/worker issues
 - renders pages to canvases using pdf.js loaded from CDN (window.pdfjsLib)
 - builds a small page-text-box map (in page pixels) to help App find text
 - exposes methods: getTextIndex(), scrollToPage(page), clear()
*/

const PdfViewer = forwardRef(({ url, onReady, onError }, ref) => {
  const containerRef = useRef(null);
  const pagesRef = useRef({}); // pageNumber -> page wrapper DOM
  const boxesRef = useRef({}); // pageNumber -> [{text,left,top,width,height}]
  const [, setNumPages] = useState(0);
  const [loading, setLoading] = useState(true);

  // fetch-first and render
  useEffect(() => {
    let cancelled = false;

    async function ensurePdfjs() {
      if (window.pdfjsLib) return window.pdfjsLib;
      // attempt to load pdf.js from CDN
      await new Promise((res, rej) => {
        const s = document.createElement("script");
        s.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.9.179/pdf.min.js";
        s.onload = res;
        s.onerror = rej;
        document.body.appendChild(s);
      });
      return window.pdfjsLib;
    }

    async function loadAndRender() {
      setLoading(true);
      try {
        const pdfjsLib = await ensurePdfjs();
        pdfjsLib.GlobalWorkerOptions.workerSrc =
          "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.9.179/pdf.worker.min.js";

        // Fetch bytes first to avoid direct file URL issues
        const cleaned = typeof url === "string" ? encodeURI(url) : url;
        const resp = await fetch(cleaned);
        if (!resp.ok) throw new Error("fetch failed " + resp.status);
        const buf = await resp.arrayBuffer();

        const loadingTask = pdfjsLib.getDocument({ data: buf });
        const pdf = await loadingTask.promise;
        if (cancelled) return;

        setNumPages(pdf.numPages);
        const viewer = containerRef.current;
        viewer.innerHTML = "";

        // small measure canvas to compute widths if needed
        const measure = document.createElement("canvas");
        const mctx = measure.getContext("2d");

        for (let p = 1; p <= pdf.numPages; p++) {
          const page = await pdf.getPage(p);
          const viewport = page.getViewport({ scale: 1.15 });

          const wrapper = document.createElement("div");
          wrapper.className = "pf-page-wrap";
          wrapper.dataset.page = p;
          wrapper.style.width = Math.round(viewport.width) + "px";
          wrapper.style.height = Math.round(viewport.height) + "px";
          wrapper.style.position = "relative";
          wrapper.style.margin = "14px 0";

          const canvas = document.createElement("canvas");
          canvas.width = Math.round(viewport.width);
          canvas.height = Math.round(viewport.height);
          canvas.className = "pf-canvas";
          canvas.style.width = "100%";
          canvas.style.height = "auto";

          // textLayer DOM (invisible) to host spans for mapping
          const textLayer = document.createElement("div");
          textLayer.className = "pf-textLayer";
          textLayer.style.position = "absolute";
          textLayer.style.left = "0";
          textLayer.style.top = "0";
          textLayer.style.width = "100%";
          textLayer.style.height = "100%";
          textLayer.style.pointerEvents = "none";

          wrapper.appendChild(canvas);
          wrapper.appendChild(textLayer);
          viewer.appendChild(wrapper);
          pagesRef.current[p] = wrapper;

          // render page to canvas
          const ctx = canvas.getContext("2d");
          await page.render({ canvasContext: ctx, viewport }).promise;

          // build page text boxes
          boxesRef.current[p] = [];
          const textContent = await page.getTextContent();
          textContent.items.forEach((item) => {
            const tx = pdfjsLib.Util.transform(viewport.transform, item.transform);
            const left = tx[4];
            const top = tx[5] - Math.hypot(tx[1], tx[0]);
            const fontSizePx = Math.hypot(tx[1], tx[0]);
            mctx.font = `${fontSizePx}px sans-serif`;
            const width = Math.max(0, mctx.measureText(item.str || "").width);
            const height = fontSizePx;

            boxesRef.current[p].push({
              text: item.str || "",
              left,
              top,
              width,
              height,
            });

            // create invisible span for mapping/debugging
            const span = document.createElement("span");
            span.textContent = item.str || "";
            span.style.position = "absolute";
            span.style.left = `${left}px`;
            span.style.top = `${top}px`;
            span.style.fontSize = `${fontSizePx}px`;
            span.style.opacity = 0;
            span.style.whiteSpace = "pre";
            textLayer.appendChild(span);
          });
        }

        setLoading(false);
        onReady && onReady();
      } catch (err) {
        setLoading(false);
        console.error("PdfViewer error:", err);
        onError && onError(err);
      }
    }

    if (url) loadAndRender();

    return () => {
      cancelled = true;
    };
  }, [url, onReady, onError]);

  // expose API to parent
  useImperativeHandle(ref, () => ({
    getTextIndex: () => boxesRef.current,
    scrollToPage: (page) => {
      const node = pagesRef.current[page];
      if (node) node.scrollIntoView({ behavior: "smooth", block: "center" });
    },
    clearHighlights: () => {
      const viewer = containerRef.current;
      viewer && viewer.querySelectorAll(".pf-highlight").forEach((n) => n.remove());
    },
    addHighlight: (page, rect) => {
      const wrapper = pagesRef.current[page];
      if (!wrapper) return;
      let overlay = wrapper.querySelector(".pf-overlay");
      if (!overlay) {
        overlay = document.createElement("div");
        overlay.className = "pf-overlay";
        overlay.style.position = "absolute";
        overlay.style.left = "0";
        overlay.style.top = "0";
        overlay.style.right = "0";
        overlay.style.bottom = "0";
        wrapper.appendChild(overlay);
      }
      const el = document.createElement("div");
      el.className = "pf-highlight";
      el.style.position = "absolute";
      el.style.left = `${rect.left}px`;
      el.style.top = `${rect.top}px`;
      el.style.width = `${rect.width}px`;
      el.style.height = `${rect.height}px`;
      overlay.appendChild(el);
      return el;
    },
  }));

  return (
    <div className="pf-root">
      {loading && <div className="pf-loading">Loading document…</div>}
      <div ref={containerRef} className="pf-viewer" />
    </div>
  );
});

export default PdfViewer;