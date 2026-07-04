/* Tripod Portal Atlas — the living brain (V2 Connections graph, PR-3).
 *
 * A faithful port of the APPROVED v4 mock's engine (PORTAL-ATLAS-MOCK-v4.html,
 * label luminous-v4 — Marcia's ruled look & interaction model: points of light,
 * synapse firing, murmuration mode changes, calm fixed-step physics), with the
 * mock's embedded sample graph replaced by the real atlas shards:
 *
 *   - data is fetched from ./global.json + ./<book>.json (same-origin, relative;
 *     no CDN, no external host — this file is vendored, spec §2.4);
 *   - node ids are the shards' namespaced ids verbatim (ruth/P01 ≠ ruth/P01/prop/P13);
 *   - NOTHING here is hardcoded to a book: the "arriving" ghost state derives
 *     from status === "registry-only", spines derive from the book index, the
 *     growth replay derives from pericope order — a new book onboards with
 *     zero changes to this file;
 *   - level-of-detail is data-derived: the default brain shows books, pericopes,
 *     cast spanning ≥2 passages, concepts/figures recurring in ≥2 passages, and
 *     the vocabulary axes; if that exceeds NODE_BUDGET the thresholds rise.
 *     Everything else arrives by progressive disclosure (expand a pericope) and
 *     every entry is always reachable on the registry pages.
 *
 * Progressive (§2.4): this script only runs when the static Atlas index has
 * fully rendered; without JS that page IS the navigable fallback. All ambient
 * motion respects prefers-reduced-motion.
 */
"use strict";

(async function boot() {
  let g, shards;
  try {
    g = await (await fetch("./global.json")).json();
    shards = new Map(
      await Promise.all(
        g.books.map(async (b) => [b.id, await (await fetch(`./${b.id}.json`)).json()])
      )
    );
  } catch (e) {
    console.warn("atlas-brain: shards unavailable, staying with the static page —", e);
    return;
  }

  /* ---------- graph from canon (data-derived, never hand-authored) ---------- */
  const CAST = ["being", "place", "object", "time", "institution"];
  const NODE_BUDGET = 240;

  function buildGraph(spanMin, flagMin) {
    const nodes = [];
    const edges = [];
    const push = (n) => (nodes.push(n), n);

    const flaggedBy = new Map(); // concept|figure id → Map(pericopeGraphId → count)
    const axisBooks = new Map(); // axis → Set(bookGraphId)

    for (const b of g.books) {
      const shard = shards.get(b.id);
      const ghost = b.status === "registry-only";
      push({
        id: b.id,
        kind: ghost ? "ghost" : "book",
        label: b.title,
        book: b.id,
        status: b.status,
        meta: ghost
          ? `${b.counts.entities} cast entities pinned in the registry. Maps in progress — nothing is published for this book yet. This node blooms into a spine automatically the day its approved artifacts merge.`
          : `${b.counts.pericopes} pericopes · ${b.counts.scenes} scenes · ${b.counts.propositions} propositions · ${b.counts.entities} registry entities`,
        href: `./${b.id}.html`,
      });

      const peris = shard.nodes.filter((n) => n.kind === "pericope");
      let prev = null;
      for (const p of peris) {
        const absences = shard.nodes
          .filter((s) => s.kind === "scene" && s.id.startsWith(`${p.id}/`) && s.significant_absence)
          .map((s) => ({ scene: s.code, text: s.significant_absence }));
        push({
          id: p.id,
          kind: "pericope",
          label: p.code,
          book: b.id,
          title: p.title,
          bcv: p.bcv,
          cls: p.classification ?? null,
          arc: p.level_1?.arc_elements ?? null,
          emo: p.emotion_attested ?? null,
          absences,
          href: `./${b.id}.html#${p.code}`,
          read: `../pericopes/${p.code}.html`,
        });
        edges.push([b.id, p.id, "spine"]);
        if (prev) edges.push([prev, p.id, "seq"]);
        prev = p.id;
      }

      const pids = new Set(peris.map((p) => p.code));
      for (const n of shard.nodes) {
        if (!CAST.includes(n.kind)) continue;
        const spans = (n.appears_in ?? []).filter((x) => pids.has(x));
        if (spans.length < spanMin) continue;
        push({
          id: n.id,
          kind: "ent",
          ekind: n.kind,
          label: n.english ?? n.code,
          hebrew: n.hebrew ?? "",
          forms: (n.referential_forms ?? []).length,
          code: n.code,
          book: b.id,
          href: `./registry/${b.id}/${n.code}.html`,
        });
        for (const pid of spans) edges.push([n.id, `${b.id}/${pid}`, "appears"]);
      }

      for (const e of shard.edges) {
        if (e.kind === "flags" && e.to) {
          if (!flaggedBy.has(e.to)) flaggedBy.set(e.to, new Map());
          const per = `${b.id}/${e.from.split("/")[1]}`;
          const m = flaggedBy.get(e.to);
          m.set(per, (m.get(per) ?? 0) + 1);
        }
        if (e.kind === "uses-value") {
          if (!axisBooks.has(e.axis)) axisBooks.set(e.axis, new Set());
          axisBooks.get(e.axis).add(b.id);
        }
      }
    }

    const globalById = new Map(g.nodes.map((n) => [n.id, n]));
    for (const [id, pericopes] of flaggedBy) {
      if (pericopes.size < flagMin) continue;
      const meta = globalById.get(id);
      if (!meta) continue;
      push({
        id,
        kind: meta.kind === "concept" ? "cb" : "fig",
        label: meta.name ?? meta.code,
        code: meta.code,
        books: meta.books ?? [],
        href: `./registry/${meta.kind}/${meta.code}.html`,
      });
      for (const per of pericopes.keys()) edges.push([id, per, "flag"]);
    }

    for (const ax of g.vocabulary.axes) {
      push({
        id: `axis/${ax.axis}`,
        kind: "axis",
        label: `${ax.axis.replace(/_/g, " ")} · ${ax.approved}`,
        axis: ax.axis,
        layer: ax.layer,
        approved: ax.approved,
        attested_only: ax.attested_only,
        href: `./vocabulary.html#${ax.axis}`,
      });
      for (const bookId of axisBooks.get(ax.axis) ?? []) edges.push([`axis/${ax.axis}`, bookId, "axis"]);
    }

    return { nodes, edges };
  }

  let spanMin = 2, flagMin = 2;
  let GRAPH = buildGraph(spanMin, flagMin);
  // LOD: collapse toward hubs, data-derived. Books/pericopes/axes are the
  // irreducible floor — if raising thresholds stops shrinking the graph,
  // accept the floor rather than looping forever (verify-confirmed at ~16
  // books the floor can exceed the budget).
  let prevCount = Infinity;
  while (GRAPH.nodes.length > NODE_BUDGET && GRAPH.nodes.length < prevCount) {
    prevCount = GRAPH.nodes.length;
    spanMin += 1; flagMin += 1;
    GRAPH = buildGraph(spanMin, flagMin);
  }

  /* ---------- palette: luminous neural (the ruled v4 treatment) ---------- */
  const KC = {
    book: "#CFE4FF", pericope: "#FFC163", cb: "#FF7FB4", fig: "#A88CFF",
    axis: "#59B7FF", ghost: "#FF9E58", scene: "#8FD0FF", prop: "#D8B36A",
    being: "#FFDFA6", place: "#FFDFA6", object: "#FFDFA6", time: "#FFDFA6", institution: "#FFDFA6",
  };
  const ACC_HEAD = "#FFF6DE", ACC_GLOW = "#FFC163", ACC_LINE = "rgba(255,199,120,";
  const kindName = {
    book: "book", pericope: "pericope", cb: "concept", fig: "figure",
    axis: "shared vocabulary axis", ghost: "arriving", scene: "scene", prop: "statement",
    being: "person / being", place: "place", object: "object", time: "time", institution: "institution",
  };
  const colorOf = (n) => (n.kind === "ent" ? KC[n.ekind] || KC.being : KC[n.kind] || "#C4CDD6");

  /* ---------- reveal the brain UI (page stays fully readable without JS) ---------- */
  document.body.classList.add("brain-on");
  const $ = (id) => document.getElementById(id);
  const cv = $("stage"), ctx = cv.getContext("2d");

  const RM = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let seed = 137;
  const rnd = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };

  /* ---------- node/edge runtime state ---------- */
  const nodes = [], edges = [], byId = {};
  function addNode(n) {
    if (byId[n.id]) return byId[n.id];
    byId[n.id] = n; nodes.push(n);
    n.adj = []; n.deg = 0;
    n.r = n.kind === "book" ? 20 : n.kind === "ghost" ? 12 : n.kind === "pericope" ? 8
      : n.kind === "axis" ? 7 : n.kind === "scene" ? 4.5 : n.kind === "prop" ? 2.6 : 3.5;
    n.x = innerWidth * .5 + (rnd() - .5) * 400; n.y = innerHeight * .5 + (rnd() - .5) * 300;
    n.vx = 0; n.vy = 0; n.alpha = 0; n.flash = 0; n.vis = true;
    n.ph = rnd() * Math.PI * 2; n.ph2 = rnd() * Math.PI * 2;
    n.w1 = .00016 + rnd() * .00011; n.w2 = .00035 + rnd() * .00018;
    n.ox = 0; n.oy = 0; n.as = 0; n.aramp = 1; n.adelay = 0;
    return n;
  }
  function addEdge(sid, tid, k) {
    const a = byId[sid], b = byId[tid];
    if (!a || !b) return;
    if (a.adj.some((x) => x.n === b && x.k === k)) return;
    const e = { a, b, k, lit: 0 };
    edges.push(e);
    a.adj.push({ n: b, k, e }); b.adj.push({ n: a, k, e }); a.deg++; b.deg++;
  }
  GRAPH.nodes.forEach(addNode);
  GRAPH.edges.forEach(([s, t, k]) => addEdge(s, t, k));
  nodes.forEach((n) => { if (n.kind === "pericope") n.r = 8 + Math.min(5, n.deg * .15); else if (n.kind === "ent") n.r = 3.5 + Math.min(4.5, n.deg * .5); });

  /* progressive disclosure (V2): expand a pericope into its scenes + statements */
  const expanded = new Set();
  function expandPericope(p) {
    if (expanded.has(p.id)) return;
    expanded.add(p.id);
    const shard = shards.get(p.book);
    const scenes = shard.nodes.filter((n) => n.kind === "scene" && n.id.startsWith(`${p.id}/`));
    for (const s of scenes) {
      const sn = addNode({ id: s.id, kind: "scene", label: s.code, book: p.book,
        scene_kind: s.scene_kind, purpose: s.purpose, absence: s.significant_absence,
        href: `./${p.book}.html#${p.label}` });
      sn.x = p.x + (rnd() - .5) * 60; sn.y = p.y + 40 + rnd() * 30;
      addEdge(p.id, s.id, "link");
    }
    for (const e of shard.edges) {
      if (e.kind !== "contains" || !e.from.startsWith(`${p.id}/`) || !e.to?.includes("/prop/")) continue;
      const pr = shard.nodes.find((n) => n.id === e.to);
      if (!pr) continue;
      const pn = addNode({ id: pr.id, kind: "prop", label: pr.code, book: p.book,
        pkind: pr.proposition_kind, verse: pr.verse_anchor, href: `./${p.book}.html#${p.label}` });
      const parent = byId[e.from];
      pn.x = (parent?.x ?? p.x) + (rnd() - .5) * 40; pn.y = (parent?.y ?? p.y) + 34 + rnd() * 22;
      addEdge(e.from, pr.id, "link");
    }
    applyMode(mode, false);
    fireNode(p, .8);
    if (window.__tripodBrain) updateStats(); // counts grew — keep the HUD honest
  }

  /* ---------- light sprites, bokeh (verbatim from the approved mock) ---------- */
  let W = 0, H = 0;
  const SPR = {};
  function makeGlow(color) {
    const s = document.createElement("canvas"); s.width = s.height = 64;
    const c = s.getContext("2d"), gr = c.createRadialGradient(32, 32, 0, 32, 32, 32);
    gr.addColorStop(0, color + "ff"); gr.addColorStop(.22, color + "66");
    gr.addColorStop(.55, color + "1c"); gr.addColorStop(1, color + "00");
    c.fillStyle = gr; c.fillRect(0, 0, 64, 64); return s;
  }
  function drawGlow(x, y, rad, color, alpha) {
    const s = SPR[color] || (SPR[color] = makeGlow(color));
    ctx.globalAlpha = Math.min(1, alpha);
    ctx.drawImage(s, x - rad, y - rad, rad * 2, rad * 2);
    ctx.globalAlpha = 1;
  }
  const bok = [];
  for (let i = 0; i < 34; i++) bok.push({
    x: rnd(), y: rnd(), r: 2.5 + rnd() * 10,
    c: rnd() < .60 ? "#FFC163" : rnd() < .75 ? "#59B7FF" : "#FF7FB4",
    a: .028 + rnd() * .055, sx: (rnd() - .5) * .9, sy: (rnd() - .5) * .7, ph: rnd() * 7,
  });
  function resize() {
    const DPR = Math.min(2, devicePixelRatio || 1);
    W = innerWidth; H = innerHeight;
    cv.width = W * DPR; cv.height = H * DPR; cv.style.width = W + "px"; cv.style.height = H + "px";
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    applyMode(mode, false);
  }
  addEventListener("resize", resize);

  /* ---------- synapse pulses (verbatim) ---------- */
  const pulses = [];
  function firePulse(e, fromNode, amp, delay) {
    if (pulses.length > 90) return;
    pulses.push({ e, rev: e.b === fromNode, t: -(delay || 0), sp: 1 / (520 + rnd() * 260), amp });
  }
  function fireNode(n, amp, maxN) {
    let list = n.adj; if (maxN && list.length > maxN) list = list.slice(0, maxN);
    list.forEach((a, i) => { if (a.n.vis) firePulse(a.e, n, amp, i * 46 + rnd() * 30); });
  }

  /* ---------- modes (generalized to N books, zero book names in code) ---------- */
  const MODES = ["Mind", "Books", "Cast", "Concepts", "Emotion", "Growth"];
  let mode = "Mind", modeT = 0;
  const spineBooks = () => nodes.filter((n) => n.kind === "book");
  const ghostBooks = () => nodes.filter((n) => n.kind === "ghost");
  const perisOf = (b) => nodes.filter((n) => n.kind === "pericope" && n.book === b.id);

  function anchor(n, x, y, s) { n.ax = x; n.ay = y; n.as = s; }

  // Nodes (and their labels, drawn above the node) must never wander into the
  // HUD strip — at mid widths (~1030px) the tools row wraps and reaches deeper
  // than the old fixed 66px floor, colliding with long axis labels. Measure
  // the real HUD extent instead; labels sit ~20px above a node's center.
  let TOPY = 66;
  function measureHud() {
    TOPY = 66;
    for (const id of ["modes", "tools"]) {
      const el = $(id);
      if (!el) continue;
      const r = el.getBoundingClientRect();
      if (r.height > 0 && r.top < H * .4) TOPY = Math.max(TOPY, r.bottom + 34);
    }
  }

  function applyMode(m, reset = true) {
    mode = m; modeT = performance.now();
    measureHud();
    document.querySelectorAll("#modes .chip").forEach((c) => {
      c.classList.toggle("on", c.dataset.m === m);
      c.setAttribute("aria-selected", c.dataset.m === m ? "true" : "false");
    });
    const cx = W * .5, cy = H * .52, R = Math.min(W, H);
    nodes.forEach((n, i) => { n.as = 0; n.vis = true; n.aramp = 0; n.adelay = (i % 23) * 55 + rnd() * 220; });

    const spine = (list, x0, x1, y) => list.forEach((n, i) =>
      anchor(n, x0 + (x1 - x0) * (list.length === 1 ? .5 : i / (list.length - 1)), y + Math.sin(i * .9) * 12, .016));
    const booksLayout = () => {
      const bs = spineBooks();
      const gap = .06, span = (0.90 - gap * (bs.length - 1) - 0.06) / Math.max(1, bs.length);
      bs.forEach((b, i) => {
        const x0 = .06 + i * (span + gap), x1 = x0 + span;
        anchor(b, W * (x0 + x1) / 2, H * .26, .018);
        spine(perisOf(b), W * x0, W * x1, H * .52);
      });
      ghostBooks().forEach((b, i) => anchor(b, W * .90, H * (.72 + i * .1), .015));
      nodes.forEach((n) => {
        if (n.kind === "ent" || n.kind === "cb" || n.kind === "fig") {
          const ps = n.adj.filter((a) => a.n.kind === "pericope");
          if (ps.length) {
            const mx = ps.reduce((s, a) => s + a.n.ax, 0) / ps.length;
            anchor(n, mx, H * .52 + (n.kind === "ent" ? -1 : 1) * (H * .16 + (n.deg % 5) * 10), .010);
          }
        }
        if (n.kind === "axis") anchor(n, W * .51, H * .18 + nodes.filter((q) => q.kind === "axis").indexOf(n) * (H * .042), .015);
        if (n.kind === "scene" || n.kind === "prop") {
          const parent = n.adj.find((a) => a.n.kind === "pericope" || a.n.kind === "scene");
          if (parent) anchor(n, parent.n.ax ?? parent.n.x, (parent.n.ay ?? parent.n.y) + (n.kind === "scene" ? 60 : 100), .012);
        }
      });
    };

    if (m === "Mind") {
      const bs = spineBooks();
      bs.forEach((b, i) => anchor(b, W * (.30 + .38 * (bs.length === 1 ? .5 : i / (bs.length - 1))), H * (.46 + .06 * (i % 2)), .004));
      ghostBooks().forEach((b, i) => anchor(b, W * .90, H * (.76 + i * .08), .006));
    }
    if (m === "Books" || m === "Emotion" || m === "Growth") booksLayout();
    if (m === "Cast") {
      CAST.forEach((k, i) => {
        const a = -Math.PI / 2 + i * 2 * Math.PI / CAST.length, r = R * .20;
        nodes.filter((n) => n.ekind === k).forEach((n) => anchor(n, cx + Math.cos(a) * r, cy + Math.sin(a) * r, .014));
      });
      const peris = nodes.filter((n) => n.kind === "pericope");
      peris.forEach((n, i) => { const a = i / peris.length * 2 * Math.PI - Math.PI / 2;
        anchor(n, cx + Math.cos(a) * R * .40, cy + Math.sin(a) * R * .40, .016); });
      spineBooks().forEach((b, i) => anchor(b, W * (.12 + .76 * (i % 2)), H * .16, .014));
      ghostBooks().forEach((b, i) => anchor(b, W * .90, H * (.84 + i * .06), .014));
      nodes.filter((n) => n.kind === "cb" || n.kind === "fig").forEach((n, i) => anchor(n, W * (.2 + .6 * ((i * 7) % 13) / 13), H * .94, .012));
      nodes.filter((n) => n.kind === "axis").forEach((n, i) => anchor(n, W * (.18 + .038 * i), H * .06, .014));
    }
    if (m === "Concepts") {
      const cbs = nodes.filter((n) => n.kind === "cb"), figs = nodes.filter((n) => n.kind === "fig");
      cbs.forEach((n, i) => { const r = 15 * Math.sqrt(i + 1), a = i * 2.4; anchor(n, W * .34 + Math.cos(a) * r * 1.6, cy + Math.sin(a) * r, .016); });
      figs.forEach((n, i) => { const r = 15 * Math.sqrt(i + 1), a = i * 2.4; anchor(n, W * .66 + Math.cos(a) * r * 1.6, cy + Math.sin(a) * r, .016); });
      const peris = nodes.filter((n) => n.kind === "pericope");
      peris.forEach((n, i) => { const a = i / peris.length * 2 * Math.PI - Math.PI / 2;
        anchor(n, cx + Math.cos(a) * R * .44, cy + Math.sin(a) * R * .42, .015); });
      nodes.filter((n) => n.kind === "ent").forEach((n, i) => anchor(n, W * (.15 + .7 * ((i * 5) % 17) / 17), H * .95, .012));
      spineBooks().forEach((b, i) => anchor(b, W * (.10 + .80 * (i % 2)), H * .14, .014));
      ghostBooks().forEach((b, i) => anchor(b, W * .94, H * (.8 + i * .06), .014));
      nodes.filter((n) => n.kind === "axis").forEach((n, i) => anchor(n, W * (.18 + .038 * i), H * .06, .014));
    }

    stopGrowth();
    caption(false); // clear BEFORE Growth starts, or the RM caption is clobbered
    if (m === "Growth" && reset) startGrowth();
    if (m === "Emotion" && reset) {
      // Open on the most emotion-attested pericope — data decides, not code.
      const top = nodes.filter((n) => n.emo)
        .sort((x, y) => Object.values(y.emo).reduce((s, c) => s + c, 0) - Object.values(x.emo).reduce((s, c) => s + c, 0))[0];
      if (top) select(top);
    }
  }

  /* ---------- growth replay (order + captions from canon) ---------- */
  let gTimer = null, gi = -1;
  const gOrder = spineBooks().flatMap((b) => perisOf(b).map((n) => n.id));
  function startGrowth() {
    if (RM) {
      caption(true, "GROWTH",
        `With reduced motion on, the grown seed is shown at once — ${gOrder.length} pericopes, ${spineBooks().length} books, one shared vocabulary.`);
      return;
    }
    nodes.forEach((n) => { n.vis = n.kind === "book"; });
    gi = -1;
    const step = () => {
      gi++;
      if (gi < gOrder.length) {
        const p = byId[gOrder[gi]], bk = byId[p.book];
        p.vis = true; p.x = bk.x + (rnd() - .5) * 30; p.y = bk.y + 26; p.vx = p.vy = 0;
        const born = [];
        p.adj.forEach((a) => { if (a.n.kind !== "axis" && !a.n.vis) { a.n.vis = true; born.push(a); } });
        bk.adj.forEach((a) => { if (a.n === p) firePulse(a.e, bk, 1, 0); });
        setTimeout(() => { born.forEach((a, i) => firePulse(a.e, p, .7, i * 70)); p.flash = 1; }, 480);
        caption(true, p.label, p.title);
        gTimer = setTimeout(step, 1450);
      } else if (gi === gOrder.length) {
        nodes.filter((n) => n.kind === "axis").forEach((n) => { n.vis = true; n.flash = .8; });
        caption(true, "THE INTERLANGUAGE",
          `Every book speaks the same controlled vocabulary — ${g.vocabulary.axes.length} axes; approved values carry the ruling that admitted them.`);
        gTimer = setTimeout(step, 2300);
      } else {
        const ghosts = ghostBooks();
        ghosts.forEach((b) => { b.vis = true; b.flash = 1; });
        caption(true,
          ghosts.map((b) => b.label.toUpperCase()).join(" · ") + (ghosts.length ? " — IN FLIGHT" : "THE SEED, GROWN"),
          ghosts.length
            ? ghosts.map((b) => b.meta.split(".")[0]).join(" · ") + ". The day a compile merges, that node blooms into a spine — automatically."
            : "Every approved artifact, one connected structure.");
        gTimer = setTimeout(() => caption(false), 4600);
      }
    };
    gTimer = setTimeout(step, 700);
  }
  function stopGrowth() { if (gTimer) { clearTimeout(gTimer); gTimer = null; } nodes.forEach((n) => (n.vis = true)); }
  function caption(show, id, t) {
    const c = $("caption");
    c.style.display = show ? "block" : "none";
    if (show) { c.querySelector(".id").textContent = id || ""; c.querySelector(".t").textContent = t || ""; }
  }

  /* ---------- physics (fixed-step, calm — verbatim constants) ---------- */
  const REST = { spine: 110, seq: 76, appears: 80, flag: 66, axis: 150, link: 60 };
  const ease = (t) => (t < 0 ? 0 : t > 1 ? 1 : t * t * (3 - 2 * t));
  function step(now) {
    const live = nodes.filter((q) => q.vis);
    for (let i = 0; i < live.length; i++) {
      const a = live[i];
      for (let j = i + 1; j < live.length; j++) {
        const b = live[j];
        let dx = a.x - b.x, dy = a.y - b.y, d2 = dx * dx + dy * dy;
        if (d2 > 32000 || d2 === 0) continue;
        const d = Math.sqrt(d2), f = Math.min(1.6, (a.r + b.r) * 16 / d2);
        dx /= d; dy /= d; a.vx += dx * f; a.vy += dy * f; b.vx -= dx * f; b.vy -= dy * f;
      }
    }
    edges.forEach((e) => {
      if (!e.a.vis || !e.b.vis) return;
      const dx = e.b.x - e.a.x, dy = e.b.y - e.a.y, d = Math.max(1, Math.hypot(dx, dy));
      const f = (d - REST[e.k]) * .009 / d;
      e.a.vx += dx * f; e.a.vy += dy * f; e.b.vx -= dx * f; e.b.vy -= dy * f;
    });
    live.forEach((a) => {
      a.vx += (W * .5 - a.x) * .0005; a.vy += (H * .52 - a.y) * .0005;
      if (a.as) {
        a.aramp = ease((now - modeT - a.adelay) / 1100);
        const s = a.as * a.aramp;
        a.vx += (a.ax - a.x) * s; a.vy += (a.ay - a.y) * s;
      }
      if (drag === a) { a.vx += (dragX - a.x) * .10; a.vy += (dragY - a.y) * .10; }
      a.vx *= .90; a.vy *= .90;
      const v = Math.hypot(a.vx, a.vy); if (v > 2.6) { a.vx *= 2.6 / v; a.vy *= 2.6 / v; }
      a.x += a.vx; a.y += a.vy;
      a.x = Math.max(30, Math.min(W - 30, a.x)); a.y = Math.max(TOPY, Math.min(H - 58, a.y));
    });
  }

  /* ---------- selection, filters, alpha ---------- */
  let sel = null, hov = null, q = "";
  const filter = { book: "", kind: "", genre: "", register: "" };
  function select(n) { sel = n; if (n) { fireNode(n, 1); showPanel(n); } else hidePanel(); }
  function bookOf(n) { return n.book ?? (n.kind === "book" || n.kind === "ghost" ? n.id : null); }
  function matchesFilter(n) {
    if (filter.book) {
      const b = bookOf(n);
      if (b) { if (b !== filter.book) return false; }
      else if (n.kind === "cb" || n.kind === "fig") {
        // Join on the canonical registry book name from the shard, never the
        // display title (verify-confirmed fragility for future book titles).
        const bn = shards.get(filter.book)?.book?.name;
        if (!(n.books ?? []).includes(bn)) return false;
      }
    }
    if (filter.kind) {
      const kmap = { pericopes: ["pericope"], cast: ["ent"], concepts: ["cb"], figures: ["fig"], axes: ["axis"], books: ["book", "ghost"] };
      if (!(kmap[filter.kind] ?? []).includes(n.kind)) return false;
    }
    if (filter.genre || filter.register) {
      // A value filter is a statement about pericopes: only pericopes can
      // match directly; everything else re-lights solely via the spill below.
      if (n.kind !== "pericope") return false;
      if (filter.genre && n.cls?.genre !== filter.genre) return false;
      if (filter.register && n.cls?.register !== filter.register) return false;
    }
    return true;
  }
  const filtersActive = () => filter.book || filter.kind || filter.genre || filter.register;
  const emoNear = (n) => !!n.emo || n.adj.some((a) => a.n.emo);
  function targetAlpha(n) {
    let t = 1;
    if (mode === "Emotion") t = Math.min(t, emoNear(n) ? 1 : .10);
    if (filtersActive()) {
      const hit = matchesFilter(n) ||
        ((filter.genre || filter.register) && !filter.kind && n.kind !== "pericope" &&
          n.adj.some((a) => a.n.kind === "pericope" && matchesFilter(a.n)));
      t = Math.min(t, hit ? 1 : .08);
    }
    if (sel) t = Math.min(t, n === sel || n.adj.some((a) => a.n === sel) ? 1 : .10);
    if (q) t = Math.min(t, (n.label + " " + (n.code ?? "") + " " + n.id).toLowerCase().includes(q) ? 1 : .12);
    return t;
  }

  /* ---------- draw (verbatim rendering from the approved mock) ---------- */
  function qc(e) {
    const mx = (e.a.px + e.b.px) / 2, my = (e.a.py + e.b.py) / 2;
    const dx = e.b.px - e.a.px, dy = e.b.py - e.a.py;
    const bow = ((e.a.id.charCodeAt(0) + e.b.id.length) % 7 - 3) * .075;
    return [mx - dy * bow, my + dx * bow];
  }
  function qpoint(e, t) {
    const [cx2, cy2] = qc(e), u = 1 - t;
    return [u * u * e.a.px + 2 * u * t * cx2 + t * t * e.b.px, u * u * e.a.py + 2 * u * t * cy2 + t * t * e.b.py];
  }
  function curve(e) {
    const [cx2, cy2] = qc(e);
    ctx.beginPath(); ctx.moveTo(e.a.px, e.a.py);
    ctx.quadraticCurveTo(cx2, cy2, e.b.px, e.b.py); ctx.stroke();
  }
  let lastIdle = 0;
  function draw(now, dt) {
    nodes.forEach((n) => {
      if (!RM) {
        n.ox = Math.sin(now * n.w1 + n.ph) * 3.0 + Math.sin(now * n.w2 + n.ph2) * 1.3;
        n.oy = Math.cos(now * n.w1 * 1.13 + n.ph2) * 2.6 + Math.cos(now * n.w2 * .9 + n.ph) * 1.2;
      }
      n.px = n.x + n.ox; n.py = n.y + n.oy;
      n.alpha += ((n.vis ? targetAlpha(n) : 0) - n.alpha) * .10;
      n.flash *= Math.pow(.9955, dt);
    });

    ctx.fillStyle = "#04060F"; ctx.fillRect(0, 0, W, H);
    ctx.globalCompositeOperation = "lighter";
    const sw = RM ? 0 : Math.sin(now * .00005), cw = RM ? 0 : Math.cos(now * .00004);
    drawGlow(W * (.33 + .03 * sw), H * (.42 + .03 * cw), W * .30, "#22408C", .12);
    drawGlow(W * (.72 + .025 * cw), H * (.58 + .03 * sw), W * .26, "#45307E", .09);
    bok.forEach((b) => {
      if (!RM) { b.x = (b.x + b.sx * dt * .0000106 + 1) % 1; b.y = (b.y + b.sy * dt * .0000106 + 1) % 1; b.ph += dt * .00045; }
      drawGlow(b.x * W + Math.sin(b.ph) * 7, b.y * H + Math.cos(b.ph * .8) * 6, b.r * 3, b.c, b.a);
    });
    ctx.globalCompositeOperation = "source-over";

    if (!RM && now - lastIdle > 480 + rnd() * 750) {
      lastIdle = now;
      const vis = edges.filter((e) => e.a.vis && e.b.vis && e.a.alpha > .5 && e.b.alpha > .5);
      if (vis.length) { const e = vis[(rnd() * vis.length) | 0]; firePulse(e, rnd() < .5 ? e.a : e.b, .22); }
    }
    if (mode === "Emotion" && !RM && rnd() < .012) {
      const emos = nodes.filter((n) => n.emo && n.vis);
      if (emos.length) fireNode(emos[(rnd() * emos.length) | 0], .3, 4);
    }

    const all = $("allthreads").checked;

    edges.forEach((e) => {
      if (!e.a.vis || !e.b.vis) return;
      const target = sel && (e.a === sel || e.b === sel) ? 1
        : hov && !sel && (e.a === hov || e.b === hov) ? .55 : 0;
      e.lit += (target - e.lit) * .07;
      const al = (all ? .10 : .036) * Math.min(e.a.alpha, e.b.alpha);
      if (al > .008) { ctx.strokeStyle = "#6E8FE0"; ctx.globalAlpha = al; ctx.lineWidth = .6; curve(e); }
    });
    ctx.globalAlpha = 1;

    ctx.globalCompositeOperation = "lighter";
    edges.forEach((e) => {
      if (e.lit > .02 && e.a.vis && e.b.vis) {
        ctx.strokeStyle = ACC_LINE + .15 * e.lit + ")"; ctx.lineWidth = 2.8;
        ctx.shadowColor = ACC_GLOW; ctx.shadowBlur = 10 * e.lit; curve(e);
        ctx.shadowBlur = 0;
        ctx.strokeStyle = "rgba(255,243,215," + .48 * e.lit + ")"; ctx.lineWidth = .9; curve(e);
      }
    });
    for (let i = pulses.length - 1; i >= 0; i--) {
      const p = pulses[i]; p.t += dt * p.sp;
      if (p.t > 1) { const tgt = p.rev ? p.e.a : p.e.b; tgt.flash = Math.min(1, tgt.flash + p.amp * .9); pulses.splice(i, 1); continue; }
      if (p.t < 0 || !p.e.a.vis || !p.e.b.vis) continue;
      for (let k = 0; k < 4; k++) {
        const tt = Math.max(0, p.t - k * .045), [x, y] = qpoint(p.e, p.rev ? 1 - tt : tt);
        const a = p.amp * (1 - k * .24) * (RM ? 0 : 1);
        if (a <= 0) continue;
        if (k === 0) { drawGlow(x, y, 10, ACC_GLOW, a * .9); drawGlow(x, y, 3.6, "#FFFFFF", a); }
        else drawGlow(x, y, 6, ACC_GLOW, a * .38);
      }
    }
    nodes.forEach((n) => {
      if (n.flash > .02 && n.vis) {
        drawGlow(n.px, n.py, n.r * 4 + 12 * n.flash, ACC_GLOW, n.flash * .5);
        drawGlow(n.px, n.py, n.r * 1.7, "#FFFFFF", n.flash * .75);
      }
    });
    ctx.globalCompositeOperation = "source-over";
    ctx.globalAlpha = 1;

    ctx.globalCompositeOperation = "lighter";
    nodes.forEach((n) => {
      if (n.alpha < .02 || !n.vis) return;
      const c = colorOf(n), boost = n === sel || n === hov ? 1.35 : 1;
      const breathe = RM ? 1 : 1 + Math.sin(now * .0009 + n.ph) * .06;
      const outer = n.r * (n.r > 14 ? 3.1 : 4.4) * boost * breathe;
      drawGlow(n.px, n.py, outer, c, .30 * n.alpha * boost);
      drawGlow(n.px, n.py, n.r * 1.9 * boost, c, .72 * n.alpha);
      drawGlow(n.px, n.py, Math.max(1.7, n.r * .6), "#FFFFFF", .85 * n.alpha);
    });
    ctx.globalCompositeOperation = "source-over";

    nodes.forEach((n) => {
      if (n.alpha < .02 || !n.vis) return;
      const isSel = n === sel, isHov = n === hov;
      if (n.kind === "ghost") {
        ctx.globalAlpha = n.alpha * .8;
        ctx.strokeStyle = colorOf(n); ctx.setLineDash([3, 6]); ctx.lineWidth = .8;
        ctx.beginPath(); ctx.arc(n.px, n.py, n.r + 6, 0, 7); ctx.stroke(); ctx.setLineDash([]);
        ctx.globalAlpha = 1;
      }
      if (isSel) {
        const pr = n.r + 8 + (RM ? 0 : Math.sin(now * .0016) * 1.4);
        ctx.strokeStyle = ACC_LINE + ".65)"; ctx.lineWidth = .9;
        ctx.beginPath(); ctx.arc(n.px, n.py, pr, 0, 7); ctx.stroke();
      }
      if (q && (n.label + " " + n.id).toLowerCase().includes(q)) {
        ctx.strokeStyle = ACC_LINE + ".55)"; ctx.setLineDash([2, 4]); ctx.lineWidth = .8;
        ctx.beginPath(); ctx.arc(n.px, n.py, n.r + 7, 0, 7); ctx.stroke(); ctx.setLineDash([]);
      }
      const showLbl = n.kind === "book" || n.kind === "pericope" || n.kind === "axis" || n.kind === "ghost"
        || isSel || isHov || (sel && n.adj.some((a) => a.n === sel)) || n.deg >= 8 || (q && n.alpha > .8);
      if (showLbl) {
        ctx.font = (n.kind === "book" ? "500 13px" : "400 10px") + ' ui-monospace,"SF Mono",Menlo,monospace';
        if (n.kind === "ent" || n.kind === "cb" || n.kind === "fig")
          ctx.font = '400 10.5px -apple-system,"SF Pro Text","Helvetica Neue",sans-serif';
        ctx.globalAlpha = 1;
        ctx.fillStyle = "rgba(208,220,245," + (0.40 + 0.45 * n.alpha) + ")";
        ctx.textAlign = "center";
        ctx.fillText(n.label, n.px, n.py - n.r - 9);
      }
    });
    ctx.globalAlpha = 1;
  }

  /* ---------- main loop ---------- */
  let last = performance.now(), acc = 0, refire = 0;
  function loop(now) {
    const dt = Math.min(50, now - last); last = now; acc += dt;
    while (acc >= 16) { step(now); acc -= 16; }
    if (sel && !RM) { refire += dt; if (refire > 3400) { refire = 0; fireNode(sel, .4); } }
    draw(now, dt);
    requestAnimationFrame(loop);
  }

  /* ---------- interaction ---------- */
  let drag = null, dragX = 0, dragY = 0, downP = null, moved = false, lastHovFired = null;
  function pick(x, y) {
    let best = null, bd = 1e9;
    nodes.forEach((n) => {
      if (!n.vis || n.alpha < .05) return;
      const d = Math.hypot(n.px - x, n.py - y); if (d < n.r + 7 && d < bd) { bd = d; best = n; }
    });
    return best;
  }
  cv.addEventListener("pointermove", (e) => {
    if (drag) { dragX = e.clientX; dragY = e.clientY; moved = true; return; }
    const h = pick(e.clientX, e.clientY);
    if (h && h !== hov && h !== sel && h !== lastHovFired && !RM) { fireNode(h, .35, 10); lastHovFired = h; }
    hov = h; cv.style.cursor = h ? "pointer" : "default";
  });
  cv.addEventListener("pointerdown", (e) => {
    const n = pick(e.clientX, e.clientY);
    downP = [e.clientX, e.clientY]; moved = false;
    if (n) { drag = n; dragX = e.clientX; dragY = e.clientY; cv.setPointerCapture(e.pointerId); }
  });
  cv.addEventListener("pointerup", (e) => {
    const dist = downP ? Math.hypot(e.clientX - downP[0], e.clientY - downP[1]) : 99;
    if (drag && dist < 5 && !moved) select(drag);
    else if (!drag && dist < 5) select(null);
    drag = null;
  });
  addEventListener("keydown", (e) => {
    if (e.key === "Escape") { select(null); $("search").value = ""; q = ""; }
  });
  $("search").addEventListener("input", (e) => { q = e.target.value.trim().toLowerCase(); });

  /* ---------- panel (facts from canon + the node's own page) ---------- */
  const panel = $("panel"), pbody = $("pbody");
  panel.querySelector(".x").onclick = () => select(null);
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const nchip = (n) => `<button class="nchip" data-id="${esc(n.id)}">${esc(n.label)}</button>`;
  const group = (title, list) => (list.length ? `<div class="grp">${esc(title)}</div><div class="chips">${list.map(nchip).join("")}</div>` : "");
  function showPanel(n) {
    const kn = n.kind === "ent" ? kindName[n.ekind] : kindName[n.kind];
    let h = `<span class="kind">${esc(kn)}</span><h3>${esc(n.label)}</h3>`;
    if (n.hebrew) h += `<div class="heb">${esc(n.hebrew)}</div>`;
    if (n.kind === "pericope") {
      h += `<p>${esc(n.title ?? "")}</p><p class="mono" style="font-size:10px">${esc(n.bcv ?? "")}${n.cls ? " · " + esc(n.cls.genre ?? "") + " · " + esc(n.cls.register ?? "") : ""}</p>`;
      if (n.emo) {
        h += `<div class="grp">emotion attested in the text</div><div class="chips">` +
          Object.entries(n.emo).map(([k, v]) => `<span class="nchip">${esc(k)}${v > 1 ? " ×" + v : ""}</span>`).join("") +
          `</div>`;
      }
      for (const a of n.absences ?? []) {
        h += `<div class="abs"><span class="lbl">withheld — significant absence (${esc(a.scene)}, protected)</span>${esc(a.text)}</div>`;
      }
      if (n.arc) h += `<div class="grp">arc</div><div class="chips">` + n.arc.map((a) => `<span class="nchip">${esc(a)}</span>`).join("") + `</div>`;
      const by = (k) => n.adj.filter((a) => a.n.kind === k).map((a) => a.n);
      h += group("people & things in its scenes", by("ent"));
      h += group("concepts flagged", by("cb")) + group("figures at work", by("fig"));
      h += group("scenes & statements (expanded)", [...by("scene"), ...by("prop")]);
      if (!expanded.has(n.id)) h += `<div class="grp">go deeper</div><button class="nchip" data-expand="${esc(n.id)}">＋ expand scenes &amp; statements</button>`;
    }
    if (n.kind === "scene") {
      h += `<p>${esc(n.scene_kind ?? "")}</p><p>${esc(n.purpose ?? "")}</p>`;
      if (n.absence) h += `<div class="abs"><span class="lbl">withheld — significant absence (protected)</span>${esc(n.absence)}</div>`;
      h += group("statements", n.adj.filter((a) => a.n.kind === "prop").map((a) => a.n));
    }
    if (n.kind === "prop") h += `<p class="mono" style="font-size:11px">${esc(n.pkind ?? "")} · ${esc(n.verse ?? "")}</p>`;
    if (n.kind === "ent") {
      h += `<p>${n.forms} referential form${n.forms === 1 ? "" : "s"} tracked in the book registry (code <span class="mono">${esc(n.code)}</span>).</p>`;
      h += group("appears in", n.adj.filter((a) => a.n.kind === "pericope").map((a) => a.n));
    }
    if (n.kind === "cb" || n.kind === "fig") {
      h += `<p><span class="mono">${esc(n.code)}</span> · ${n.kind === "cb" ? "global Concept Bank" : "global Figure Registry"} · scope: ${esc((n.books ?? []).join(", ") || "—")}</p>`;
      h += group("flagged in", n.adj.filter((a) => a.n.kind === "pericope").map((a) => a.n));
    }
    if (n.kind === "axis") {
      h += `<p>${esc(n.layer === "L1-closed" ? "A closed list — the hard interlanguage every book must speak." : "A bounded-open axis — it grows ruling by ruling, and every value carries its provenance.")} ${n.approved} approved value${n.approved === 1 ? "" : "s"}${n.attested_only ? ` · ${n.attested_only} attested awaiting approval` : ""}.</p>`;
      h += group("spoken by", n.adj.map((a) => a.n));
    }
    if (n.kind === "book" || n.kind === "ghost") {
      h += `<p>${esc(n.meta)}</p>`;
      h += group("pericopes", n.adj.filter((a) => a.n.kind === "pericope").map((a) => a.n));
    }
    if (n.kind === "pericope" && mode === "Emotion") {
      h += `<div class="grp">the boundary</div><a class="nchip" style="text-decoration:none;display:inline-block" href="./emotion.html">how emotion is mapped ↗</a>`;
    }
    if (n.href) h += `<div class="grp">its page</div><a class="nchip" style="text-decoration:none;display:inline-block" href="${esc(n.href)}">open ↗</a>` + (n.read ? ` <a class="nchip" style="text-decoration:none;display:inline-block" href="${esc(n.read)}">read the documents ↗</a>` : "");
    pbody.innerHTML = h;
    pbody.querySelectorAll(".nchip[data-id]").forEach((b) => (b.onclick = () => select(byId[b.dataset.id])));
    pbody.querySelectorAll(".nchip[data-expand]").forEach((b) => (b.onclick = () => { expandPericope(byId[b.dataset.expand]); showPanel(byId[b.dataset.expand]); }));
    panel.style.display = "block";
  }
  function hidePanel() { panel.style.display = "none"; }

  /* ---------- HUD: modes, filters, legend, stats (all computed) ---------- */
  const modesEl = $("modes");
  MODES.forEach((m) => {
    const b = document.createElement("button");
    b.className = "chip" + (m === "Mind" ? " on" : ""); b.dataset.m = m; b.textContent = m; b.setAttribute("role", "tab");
    b.setAttribute("aria-selected", m === "Mind" ? "true" : "false");
    b.onclick = () => { select(null); applyMode(m); };
    modesEl.appendChild(b);
  });

  const selOpts = (id, values, label) => {
    const el = $(id);
    el.innerHTML = `<option value="">${label}</option>` + values.map((v) => `<option>${esc(v)}</option>`).join("");
    el.onchange = () => { filter[el.dataset.f] = el.value; };
  };
  selOpts("f-book", g.books.map((b) => b.id), "every book");
  selOpts("f-kind", ["books", "pericopes", "cast", "concepts", "figures", "axes"], "every kind");
  const perisAll = nodes.filter((n) => n.kind === "pericope");
  selOpts("f-genre", [...new Set(perisAll.map((n) => n.cls?.genre).filter(Boolean))].sort(), "genre — any");
  selOpts("f-register", [...new Set(perisAll.map((n) => n.cls?.register).filter(Boolean))].sort(), "register — any");

  const counts = {};
  nodes.forEach((n) => { const k = n.kind; counts[k] = (counts[k] || 0) + 1; });
  $("legend").innerHTML = [
    ["pericope", "pericopes", counts.pericope],
    ["being", "cast (people · places · things)", counts.ent],
    ["cb", "concepts", counts.cb], ["fig", "figures", counts.fig],
    ["axis", "vocabulary axes", counts.axis],
  ].filter(([, , c]) => c)
    .map(([k, l, c]) => `<div><i style="background:${KC[k]};box-shadow:0 0 6px ${KC[k]}"></i>${l} · ${c}</div>`).join("");

  const totalCast = g.books.reduce((s, b) => s + b.counts.entities, 0);
  function updateStats() {
    $("stats").innerHTML =
      `<b>${nodes.length} nodes · ${edges.length} connections</b> — computed from approved canon @ ${esc(g.generated.commit)} · ${esc(g.generated.builtAt)}<br>` +
      `showing cast spanning ≥${spanMin} passages and concepts &amp; figures recurring in ≥${flagMin} — all ${totalCast} cast · ${g.counts.concepts} concepts · ${g.counts.figures} figures browsable in the registry pages`;
  }
  updateStats();

  resize();
  applyMode("Mind", false);
  requestAnimationFrame(loop);

  /* Programmatic handle — used by the acceptance checks and by the guided
   * tours (V5) to step the live view. Read/drive only what the UI can do. */
  window.__tripodBrain = {
    nodes, edges, byId, select, applyMode, expandPericope, filter,
    get mode() { return mode; },
    get selected() { return sel; },
  };
})();
