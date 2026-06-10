# Sound Hunters — protótipo do jogo de elicitação

Browser-based prototype of a language elicitation game for speakers of
**unwritten languages**. Players name images, match words by ear, and record
verbal art. The app collects structured audio that will later calibrate a
speech model (choosing the best layer of a self-supervised encoder per
language) and seed a language archive.

**Demo prototype** — it shows the interaction design and the data contract,
not production software.

## Run it

```bash
cd sound-hunters
npm install
npm run dev        # → http://localhost:5173  (also reachable on the LAN for a phone)
npm test           # scheduler / quality-gate / manifest / data-layer checks
```

Player screens are 100% wordless (icons + demonstrated interactions);
facilitator screens are Portuguese (Brazil) — all strings in `src/strings.js`.

## 5-step demo script (for João)

1. **Setup** — open http://localhost:5173. Create a language, add a speaker
   (tick the consent box), **Iniciar sessão**. *Shortcut:* in
   **Painel dev → Semear dados de demonstração** to pre-fill two demo speakers
   (Beto: core complete; Ana: half core) with audible synthetic takes — this
   unlocks every later screen instantly. Also tick **Modo dev**.
2. **Phase 1 (picture+mic icon)** — name pictures: mic → speak → stop →
   auto-advance. Watch the dev strip at the bottom: core items come first,
   the same word never repeats until ≥6 others intervened (`+n` on each chip),
   max 2 reps/item/day. Try the Level-2 tab (possessor silhouettes) and
   Level 3 (two-panel little sentences). Too-short/silent takes get a
   wordless wiggle-retry; the third attempt is accepted flagged `low`.
3. **Phase 2 (basket icon)** — pick the echo basket: a ghost hand demos the
   drag wordlessly. Tap tiles to hear them (one canonical take, exactly once),
   drag the ones that *end alike* into the basket (soft confirmation replay),
   tap ✓. Try **odd-one-out** (3 tiles, drag the stranger). Each commit writes
   a judgment record.
4. **Twin check + Voices check** — Phase 3 plays candidate pairs (same
   speaker, same session — rule 4 filtered): judge = / ≠, then "tiny bit
   different?" → both words are re-recorded fresh and a `minimalPairCandidate`
   is written. The Voices screen (two-heads icon, unlocked by the seed data)
   compares Ana's vs Beto's canonical take for a core item; facilitator picks
   the judge; a "≠" verdict only removes that pair from the convergence count.
5. **Dashboard + Export** — items×reps matrix, per-speaker core bars,
   per-item convergence chips; **Revisar tomada canônica** to override a take
   (star); **Exportar ZIP** → `audio/<recordingId>.<ext>` + `manifest.json`
   (open it: schema-exact). Refresh the page mid-anything: everything is in
   IndexedDB, nothing is lost.

## Where the rules live

| Domain rule | Code |
|---|---|
| 1 — audio is the object (tap=play, drag+drop=soft replay) | `src/components/WordTile.jsx`, `src/audio/player.js` |
| 2 — 5 spaced reps, ≥6 intervening, ≤2/day | `src/logic/scheduler.js` (+ `scripts/test-scheduler.mjs`) |
| 3 — one canonical take, score proxy, facilitator override | `src/logic/canonical.js`, `src/audio/analysis.js`, review tab |
| 4 — same-session pairing filter | `src/screens/Phase3TwinCheck.jsx` (queue build) |
| 5 — purpose probe/archive at capture | every `addRecording` call site |
| 6 — gentle quality gate, accept-after-2-retries as `low` | `src/components/RecorderPanel.jsx` |
| 7 — calibration core first, expansion as filler | `src/logic/scheduler.js` (`coreRemaining`) |
| 8 — convergence verified, tag-never-delete | `src/logic/convergence.js`, `src/screens/VoicesCheck.jsx` |

## Data contract

`manifest.json` schema is implemented (and field-set-tested) in
`src/export/manifest.js` / `scripts/test-manifest.mjs`. Audio files are named
by recording id under `audio/`. The deck is plain JSON
(`public/decks/default-deck.json`): `imageRef: "svg:<name>"` resolves to the
inline placeholder line drawings; any other value is used as an image URL —
the real deck swaps in without code changes.

Production notes (marked in code): capture will be WAV 16 kHz mono
(`src/audio/recorder.js`); the twins-basket pre-seeding interface for the real
acoustic neighbor miner is `findNeighbors()` in `src/logic/neighbors.js`.
