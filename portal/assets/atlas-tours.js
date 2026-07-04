/* Tripod Portal Atlas — guided-tour engine (V5, PR-5).
 *
 * Turns each tour article on atlas/tours.html into a full-screen, keyboard-
 * stepped walk over the LIVE pages: an iframe shows the real view, a card
 * carries the step prose, ←/→ step, Esc leaves. Steps that visit the Meaning
 * Mind drive it through its documented handle (__tripodBrain) — same origin,
 * same built site, fully offline.
 *
 * Vendored (§2.4): no CDN, no external host; loaded only by atlas/tours.html,
 * which renders every tour as a readable article without JavaScript.
 */
"use strict";

(function () {
  const tours = document.querySelectorAll("article[data-tour]");
  if (!tours.length) return;

  let overlay = null, frame = null, card = null, steps = [], idx = 0, tourTitle = "";
  let gen = 0; // step generation — cancels orphaned mind-action polls

  function build() {
    overlay = document.createElement("div");
    overlay.id = "tour-overlay";
    overlay.innerHTML =
      '<iframe id="tour-frame" title="the live view this tour step shows"></iframe>' +
      '<div id="tour-card" role="dialog" aria-modal="true" aria-live="polite">' +
      '<div class="tc-eyebrow"><b>Shema</b> · Tripod Method · guided tour</div>' +
      '<div class="tc-title"></div><div class="tc-prose"></div>' +
      '<div class="tc-nav"><button class="tc-btn" data-nav="-1">← back</button>' +
      '<span class="tc-progress mono"></span>' +
      '<button class="tc-btn" data-nav="1">next →</button>' +
      '<button class="tc-btn tc-exit">esc · leave</button></div></div>';
    document.body.appendChild(overlay);
    frame = overlay.querySelector("#tour-frame");
    card = overlay.querySelector("#tour-card");
    overlay.querySelectorAll("[data-nav]").forEach((b) => (b.onclick = () => step(Number(b.dataset.nav))));
    overlay.querySelector(".tc-exit").onclick = close;
  }

  function mindAction(action) {
    // Retry until the mind has booted in the iframe (fetches its shards
    // first); a stale generation token cancels the poll on step/close.
    const myGen = gen;
    let tries = 0;
    const attempt = () => {
      if (myGen !== gen) return;
      const B = frame.contentWindow && frame.contentWindow.__tripodBrain;
      if (!B) { if (tries++ < 40) setTimeout(attempt, 250); return; }
      B.select(null); // mirror the mode chips: never act under a stale selection
      if (action.startsWith("mode:")) B.applyMode(action.slice(5));
      if (action === "select-ghost") {
        const ghost = B.nodes.find((n) => n.kind === "ghost");
        if (ghost) B.select(ghost);
      }
    };
    attempt();
  }

  // Arrow keys must keep working when focus is inside the live iframe —
  // re-attach the tour keys to each loaded document (same origin).
  function tourKeys(e) {
    if (!document.body.classList.contains("touring")) return;
    if (e.key === "Escape") close();
    if (e.key === "ArrowRight" || e.key === "PageDown") step(1);
    if (e.key === "ArrowLeft" || e.key === "PageUp") step(-1);
  }

  function show() {
    const s = steps[idx];
    card.querySelector(".tc-title").textContent = s.title;
    card.querySelector(".tc-prose").textContent = s.prose;
    card.querySelector(".tc-progress").textContent = `${tourTitle} · ${idx + 1} / ${steps.length}`;
    card.querySelector('[data-nav="-1"]').disabled = idx === 0;
    card.querySelector('[data-nav="1"]').textContent = idx === steps.length - 1 ? "finish ✓" : "next →";
    // Compare against the iframe's LIVE location (the pages are clickable and
    // the src attribute goes stale), and treat hash-only changes as the
    // fragment navigations they are (no load event ever fires for them).
    const target = new URL(s.url, location.href).href;
    let current;
    try { current = frame.contentWindow.location.href; } catch { current = frame.src; }
    const doc = (u) => u.split("#")[0];
    if (doc(current) !== doc(target)) {
      frame.addEventListener("load", () => {
        try { frame.contentWindow.addEventListener("keydown", tourKeys); } catch {}
        if (s.mind) mindAction(s.mind);
      }, { once: true });
      frame.src = target;
    } else {
      if (current !== target) { try { frame.contentWindow.location.href = target; } catch { frame.src = target; } }
      if (s.mind) mindAction(s.mind);
    }
  }

  function step(d) {
    gen++;
    if (idx + d >= steps.length) return close();
    idx = Math.max(0, idx + d);
    show();
  }

  function open(article) {
    if (!overlay) build();
    tourTitle = article.querySelector("h2").textContent.replace(/^\s*\d+\s*·\s*/, "");
    steps = [...article.querySelectorAll(".tstep")].map((el) => ({
      url: el.dataset.url,
      mind: el.dataset.mind || null,
      title: el.querySelector("h3").textContent.replace(/^step \d+\s*/, ""),
      prose: el.querySelector("p").textContent,
    }));
    idx = 0;
    gen++;
    document.body.classList.add("touring");
    overlay.style.display = "block";
    show();
    card.querySelector('[data-nav="1"]').focus();
  }

  function close() {
    gen++;
    document.body.classList.remove("touring");
    if (overlay) { overlay.style.display = "none"; frame.src = "about:blank"; }
  }

  addEventListener("keydown", (e) => {
    if (!document.body.classList.contains("touring")) return;
    if (e.key === "Escape") close();
    if (e.key === "ArrowRight" || e.key === "PageDown") step(1);
    if (e.key === "ArrowLeft" || e.key === "PageUp") step(-1);
  });

  tours.forEach((article) => {
    const btn = article.querySelector(".tstart");
    btn.hidden = false;
    btn.onclick = () => open(article);
  });
})();
