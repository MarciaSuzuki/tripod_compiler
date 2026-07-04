// Tripod Review Portal — atlas-data exporter (Portal Atlas PR-1, spec §3).
//
// Projects the approved canon into per-book graph shards + one global file:
//
//   atlas/<book>.json   nodes: book · pericope · scene · proposition ·
//                              being · place · object · time · institution
//                       edges: contains · participates · appears_in · flags ·
//                              prop-link (forward_link_to/caused_by/paired_with/…) ·
//                              uses-value
//   atlas/global.json   nodes: concept (CB) · figure (FIG) · vocabulary-value ·
//                              sc-ruling; edges: introduced-by (value → SC);
//                              plus the book index every view starts from.
//
// Ids are fully namespaced (MUST, §3): `ruth/P13` the pericope is a different
// node from `ruth/P01/prop/P13` the proposition; display labels keep canon
// spelling. Every fact is data-derived — book status (complete /
// compile-pending / registry-only) is computed from what exists in fixtures/
// + the registries, never hardcoded, so a book flips states the day its
// artifacts merge. New books onboard via portal.config.json rows only.
//
// Sources are EXACTLY the governance-approved set (§2.1): the gated fixtures
// (handed in already parsed by the build), `_spec/registry/*.json`,
// `_spec/approved-enumerations.json`, `_spec/validation-rules.json`,
// `SPEC_CHANGES.md`, and portal.config.json. Every file this module reads is
// realpath-verified inside the repo, inside an allowed root, and never under
// `_working/` — a violation is a GateError (build exit 2, nothing written).
// (`VOCABULARY_LOG.md` is permitted by §2.1 but not needed until the V4
// observatory; the SC timeline + per-value provenance already cover PR-1.)
//
// compiled-from note: artifacts are not nodes in the ruled node-kind list, so
// FOR_MODEL→map provenance is carried as pericope-node facts
// (artifacts.forModel.source_meaning_map_ref + artifact paths) rather than as
// a pseudo-edge between non-nodes.

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

import { GateError } from '../lib/gate.mjs';
import { deSlug } from '../lib/registry.mjs';

export const ATLAS_SCHEMA = 'atlas-v1';

// Registry entity kind → atlas node kind.
const ENTITY_KIND = {
  PERSON: 'being',
  PLACE: 'place',
  THING: 'object',
  TIME: 'time',
  INSTITUTION: 'institution',
};

// The five L1 meaning axes carried in validation-rules closed_lists. The other
// closed lists there (artifact machinery: confidence, translation status, the
// FORBIDDEN_* guards, …) are not meaning vocabulary and stay out of the atlas.
const L1_AXES = {
  GENRE_GROUP: 'genre_group',
  GENRE: 'genre',
  REGISTER: 'register',
  NARRATIVE_FRAMING: 'narrative_framing',
  SPEECH_ACT: 'speech_act',
};

export function buildAtlas({ repoRoot, cfg, buildInfo, pericopes, jsonOf, configPath }) {
  const src = sourceReader(repoRoot);

  // ---- canon inputs (all guarded reads) -------------------------------------
  const enums = src.readJson('_spec/approved-enumerations.json');
  const rules = src.readJson('_spec/validation-rules.json');
  const concepts = src.readJson('_spec/registry/concepts.json').entries ?? {};
  const figures = src.readJson('_spec/registry/figures.json').entries ?? {};
  const scRows = parseScRows(src.readText('SPEC_CHANGES.md'));
  const commonSources = src.consumed();
  if (configPath) {
    commonSources.push({ path: 'portal/portal.config.json', sha256: sha256(fs.readFileSync(configPath, 'utf8')) });
  }
  const artifactSource = (a) => ({ path: a.relPath.split(path.sep).join('/'), sha256: sha256(fs.readFileSync(a.filePath)) });

  const generated = { commit: buildInfo.commit, builtAt: buildInfo.builtAt };

  // ---- vocabulary axes: L2 bounded-open (with provenance) + L1 closed -------
  // axisIndex: axis → Map(value → node), insertion-ordered from canon files.
  const axisLayer = new Map();
  const axisIndex = new Map();
  const vocabNode = (axis, value) => {
    let values = axisIndex.get(axis);
    if (!values) {
      values = new Map();
      axisIndex.set(axis, values);
      if (!axisLayer.has(axis)) axisLayer.set(axis, 'attested-only');
    }
    let node = values.get(value);
    if (!node) {
      // A value reaching here is attested in an artifact but absent from the
      // approved registries — visible drift, never silently relabeled.
      node = {
        id: `vocab/${axis}/${value}`,
        kind: 'vocabulary-value',
        axis,
        value,
        label: value,
        layer: 'attested-only',
      };
      values.set(value, node);
    }
    return node;
  };

  for (const [axis, entries] of Object.entries(enums.axes ?? {})) {
    axisLayer.set(axis, 'L2-bounded-open');
    axisIndex.set(axis, new Map());
    for (const e of entries) {
      axisIndex.get(axis).set(e.value, {
        id: `vocab/${axis}/${e.value}`,
        kind: 'vocabulary-value',
        axis,
        value: e.value,
        label: e.value,
        layer: 'L2-bounded-open',
        first_seen: e.first_seen ?? null,
        approved_in: e.approved_in ?? null,
        source_artifact: e.source_artifact ?? null,
        sc_ref: e.sc_ref ?? null,
      });
    }
  }
  for (const [listName, axis] of Object.entries(L1_AXES)) {
    const values = rules.closed_lists?.[listName];
    if (!Array.isArray(values)) continue;
    axisLayer.set(axis, 'L1-closed');
    if (!axisIndex.has(axis)) axisIndex.set(axis, new Map());
    for (const value of values) {
      axisIndex.get(axis).set(value, {
        id: `vocab/${axis}/${value}`,
        kind: 'vocabulary-value',
        axis,
        value,
        label: value,
        layer: 'L1-closed',
      });
    }
  }

  // ---- per-book shards -------------------------------------------------------
  const byPrefix = new Map();
  for (const p of pericopes) {
    const list = byPrefix.get(p.id.charAt(0)) ?? [];
    list.push(p);
    byPrefix.set(p.id.charAt(0), list);
  }

  const shards = [];
  const bookIndexRows = [];

  const allArtifactSources = [];

  for (const book of cfg.books) {
    const bookId = String(book.name).toLowerCase();
    const registry = src.readJson(path.join('_spec', 'registry', book.aliasesFile));
    const aliasesSource = src.consumed().at(-1);
    const entities = registry.entities ?? {};
    const bookPericopes = byPrefix.get(book.prefix) ?? [];
    const bookArtifactSources = bookPericopes
      .flatMap((p) => [p.map, p.forModel, p.log])
      .filter(Boolean)
      .map(artifactSource);
    allArtifactSources.push(...bookArtifactSources);

    const status =
      bookPericopes.length === 0
        ? 'registry-only'
        : bookPericopes.every((p) => p.map && p.forModel && p.log)
          ? 'complete'
          : 'compile-pending';

    const nodes = [];
    const edges = [];
    const nodeIds = new Set();
    const addNode = (node) => {
      if (nodeIds.has(node.id)) {
        throw new GateError([`atlas: duplicate node id "${node.id}" in ${bookId} shard — namespacing broken`]);
      }
      nodeIds.add(node.id);
      nodes.push(node);
      return node;
    };

    let sceneCount = 0;
    let propCount = 0;
    let unresolved = 0;

    // Book node.
    addNode({
      id: bookId,
      kind: 'book',
      label: book.title,
      name: book.name,
      prefix: book.prefix,
      status,
    });

    // Registry entities (the cast — present even when no artifacts exist yet).
    for (const [code, e] of Object.entries(entities)) {
      addNode({
        id: `${bookId}/${code}`,
        kind: ENTITY_KIND[e.kind] ?? String(e.kind ?? 'entity').toLowerCase(),
        code,
        label: code,
        english: e.english ?? null,
        hebrew: e.hebrew ?? null,
        gender: e.gender ?? null,
        referential_forms: e.referential_forms ?? [],
        appears_in: e.appears_in ?? [],
      });
    }

    // Pericopes → scenes → propositions (only what fixtures hold).
    for (const p of bookPericopes) {
      const pericopeId = `${bookId}/${p.id}`;
      const fm = p.forModel ? jsonOf(p.forModel) : null;
      const mapFm = p.map?.frontmatter ?? {};
      const classification = fm?.pericope_classification ?? null;

      addNode({
        id: pericopeId,
        kind: 'pericope',
        code: p.id,
        label: p.id,
        title: mapFm['pericope-title'] ?? fm?.header?.pericope_title ?? '',
        bcv: mapFm['bcv'] ?? fm?.header?.bcv ?? '',
        status: p.map && p.forModel && p.log ? 'complete' : 'compile-pending',
        classification: classification
          ? {
              genre_group: classification.genre_group ?? null,
              genre: classification.genre ?? null,
              register: classification.register ?? null,
            }
          : null,
        register_overrides: normalizeOverrides(classification?.register_overrides),
        level_1: fm?.level_1 ?? null,
        artifacts: {
          map: p.map ? { path: p.map.relPath } : null,
          forModel: p.forModel
            ? {
                path: p.forModel.relPath,
                sta_id: fm?.sta_id ?? null,
                source_meaning_map_ref: fm?.header?.source_meaning_map_ref ?? null,
              }
            : null,
          log: p.log ? { path: p.log.relPath } : null,
        },
      });
      edges.push({ kind: 'contains', from: bookId, to: pericopeId });

      // uses-value: one edge per distinct (pericope, axis, value) attested.
      const uses = new Map();
      const use = (axis, value) => {
        if (value == null || value === '') return;
        const node = vocabNode(axis, String(value));
        uses.set(node.id, { kind: 'uses-value', from: pericopeId, to: node.id, axis, value: String(value) });
      };

      if (classification) {
        use('genre_group', classification.genre_group);
        use('genre', classification.genre);
        use('register', classification.register);
        const ov = classification.register_overrides ?? {};
        for (const level of ['scene_level', 'moment_level']) {
          for (const o of ov?.[level] ?? []) {
            use('register', o.override_value);
            use('narrative_framing', o.framing_override);
            use('genre', o.genre_override);
            use('genre_group', o.genre_group_override);
          }
        }
      }
      const AXIS_OF_L1 = {
        arc_elements: 'arc_element',
        context_elements: 'context_element',
        tone_elements: 'tone_element',
        pace_elements: 'pace_element',
        communicative_function_elements: 'communicative_function_element',
      };
      for (const [listKey, axis] of Object.entries(AXIS_OF_L1)) {
        for (const v of fm?.level_1?.[listKey] ?? []) use(axis, v);
      }

      // Scenes.
      const sceneIds = new Set();
      for (const scene of fm?.level_2_scenes ?? []) {
        sceneCount += 1;
        const sceneId = `${pericopeId}/${scene.scene_id}`;
        sceneIds.add(scene.scene_id);
        addNode({
          id: sceneId,
          kind: 'scene',
          code: scene.scene_id,
          label: scene.scene_id,
          verse_range: scene.verse_range ?? null,
          scene_kind: scene.scene_kind ?? null,
          purpose: scene.scene_communicative_purpose ?? null,
          significant_absence: scene.significant_absence ?? null,
        });
        edges.push({ kind: 'contains', from: pericopeId, to: sceneId });
        use('scene_kind', scene.scene_kind);

        const PARTICIPANT_KEYS = {
          beings_in_scene: 'being_id',
          places_in_scene: 'place_id',
          objects_in_scene: 'object_id',
          times_in_scene: 'time_id',
        };
        for (const [slot, idKey] of Object.entries(PARTICIPANT_KEYS)) {
          for (const entry of scene[slot]?.entries ?? []) {
            const code = entry[idKey];
            if (!code) continue;
            // Canon sometimes stages a concept as a scene object (e.g. CB_0030).
            const target = /^CB_\d+$/.test(code)
              ? `concept/${code}`
              : /^FIG_\d+$/.test(code)
                ? `figure/${code}`
                : `${bookId}/${code}`;
            const resolvable = target.startsWith('concept/')
              ? Boolean(concepts[code])
              : target.startsWith('figure/')
                ? Boolean(figures[code])
                : Boolean(entities[code]);
            if (!resolvable) unresolved += 1;
            const edge = {
              kind: 'participates',
              from: sceneId,
              to: resolvable ? target : null,
              ref: code,
            };
            const role = entry.role_in_scene ?? entry.function_in_scene ?? null;
            if (role) edge.role = role;
            if (entry.presence) edge.presence = entry.presence;
            if (entry.referential_form) edge.referential_form = entry.referential_form;
            if (!resolvable) edge.unresolved = true;
            edges.push(edge);
            if (slot === 'beings_in_scene' && entry.role_in_scene) use('role_in_scene_being', entry.role_in_scene);
            use('presence_value', entry.presence);
          }
        }
      }

      // Propositions.
      const propIds = new Set(
        (fm?.level_3_propositions ?? []).map((prop) => prop.prop_id).filter(Boolean)
      );
      for (const prop of fm?.level_3_propositions ?? []) {
        propCount += 1;
        const propId = `${pericopeId}/prop/${prop.prop_id}`;
        addNode({
          id: propId,
          kind: 'proposition',
          code: prop.prop_id,
          label: prop.prop_id,
          verse_anchor: prop.verse_anchor ?? null,
          proposition_kind: prop.proposition_kind ?? null,
          slots: prop.event_specific_slots ?? null,
          cross_ref: prop.cross_ref ?? null,
        });
        use('proposition_kind', prop.proposition_kind);

        // contains: scene → prop via scene_link (falls back to the pericope,
        // flagged, if the link points nowhere — pinned to zero by tests today).
        if (prop.scene_link && sceneIds.has(prop.scene_link)) {
          edges.push({ kind: 'contains', from: `${pericopeId}/${prop.scene_link}`, to: propId });
        } else {
          unresolved += 1;
          edges.push({ kind: 'contains', from: pericopeId, to: propId, ref: prop.scene_link ?? null, unresolved: true });
        }

        for (const [link, rawTarget] of Object.entries(prop.inter_proposition_links ?? {})) {
          for (const target of Array.isArray(rawTarget) ? rawTarget : [rawTarget]) {
            if (target == null || target === '') continue;
            const ok = propIds.has(target);
            if (!ok) unresolved += 1;
            edges.push({
              kind: 'prop-link',
              link,
              from: propId,
              to: ok ? `${pericopeId}/prop/${target}` : null,
              ref: target,
              ...(ok ? {} : { unresolved: true }),
            });
          }
        }

        for (const flag of prop.cb_flags ?? []) {
          const ok = Boolean(concepts[flag]);
          if (!ok) unresolved += 1;
          edges.push({ kind: 'flags', from: propId, to: ok ? `concept/${flag}` : null, ref: flag, ...(ok ? {} : { unresolved: true }) });
        }
        for (const flag of prop.figure_flags ?? []) {
          const ok = Boolean(figures[flag]);
          if (!ok) unresolved += 1;
          edges.push({ kind: 'flags', from: propId, to: ok ? `figure/${flag}` : null, ref: flag, ...(ok ? {} : { unresolved: true }) });
        }

        // Slot deep-walk for closed/axis values attested inside components.
        walkSlots(prop.event_specific_slots, (key, value) => {
          if (key === 'speech_act') use('speech_act', value);
          if (key === 'action') use('action', value);
          if (key === 'status') use('status', value);
        });
      }

      edges.push(...uses.values());
    }

    // appears_in: registry spans, emitted where the pericope node exists
    // (the appears_in fact on the entity node always keeps the full list).
    for (const [code, e] of Object.entries(entities)) {
      for (const pid of e.appears_in ?? []) {
        if (bookPericopes.some((p) => p.id === pid)) {
          edges.push({ kind: 'appears_in', from: `${bookId}/${code}`, to: `${bookId}/${pid}` });
        }
      }
    }

    const counts = {
      pericopes: bookPericopes.length,
      scenes: sceneCount,
      propositions: propCount,
      entities: Object.keys(entities).length,
      nodes: nodes.length,
      edges: edges.length,
      unresolved_refs: unresolved,
    };
    shards.push({
      file: `atlas/${bookId}.json`,
      sources: [aliasesSource, ...bookArtifactSources],
      data: {
        atlas_schema: ATLAS_SCHEMA,
        generated,
        book: { id: bookId, name: book.name, title: book.title, prefix: book.prefix, status, counts },
        nodes,
        edges,
      },
    });
    bookIndexRows.push({
      id: bookId,
      title: book.title,
      prefix: book.prefix,
      status,
      shard: `atlas/${bookId}.json`,
      counts,
    });
  }

  // ---- global.json -----------------------------------------------------------
  const globalNodes = [];
  const globalEdges = [];

  for (const [code, c] of Object.entries(concepts)) {
    globalNodes.push({
      id: `concept/${code}`,
      kind: 'concept',
      code,
      label: code,
      name: deSlug(c.name_slug ?? code),
      name_slug: c.name_slug ?? null,
      aliases: c.aliases ?? [],
      books: c.appears_in ?? [],
    });
  }
  for (const [code, f] of Object.entries(figures)) {
    globalNodes.push({
      id: `figure/${code}`,
      kind: 'figure',
      code,
      label: code,
      name: deSlug(f.name_slug ?? code),
      name_slug: f.name_slug ?? null,
      aliases: f.aliases ?? [],
      books: f.appears_in ?? [],
    });
  }

  const scById = new Map();
  for (const row of scRows) {
    const node = {
      id: `sc/${row.id}`,
      kind: 'sc-ruling',
      sc: row.id,
      label: row.id,
      title: row.title,
      date: row.date,
      status: row.status,
      highlights: row.highlights,
      more_highlights: row.more_highlights,
    };
    scById.set(row.id, node);
    globalNodes.push(node);
  }

  const axes = [];
  for (const [axis, values] of axisIndex) {
    const list = [...values.values()];
    globalNodes.push(...list);
    for (const v of list) {
      if (v.sc_ref && scById.has(v.sc_ref)) {
        globalEdges.push({ kind: 'introduced-by', from: v.id, to: `sc/${v.sc_ref}` });
      }
    }
    axes.push({
      axis,
      layer: axisLayer.get(axis),
      values: list.length,
      approved: list.filter((v) => v.layer !== 'attested-only').length,
      attested_only: list.filter((v) => v.layer === 'attested-only').length,
    });
  }

  const globalData = {
    atlas_schema: ATLAS_SCHEMA,
    generated,
    books: bookIndexRows,
    vocabulary: {
      tagset_version: rules.tagset_version ?? enums.tagset_version ?? null,
      enumerations_version: enums.version ?? null,
      validation_rules_version: rules.version ?? null,
      axes,
    },
    counts: {
      concepts: Object.keys(concepts).length,
      figures: Object.keys(figures).length,
      sc_rulings: scRows.length,
      vocabulary_values: axes.reduce((n, a) => n + a.values, 0),
    },
    nodes: globalNodes,
    edges: globalEdges,
  };

  assertUniqueIds(globalNodes, 'global');

  const files = [
    ...shards,
    { file: 'atlas/global.json', sources: [...commonSources, ...allArtifactSources], data: globalData },
  ];
  return {
    files,
    manifestSection: files.map((f) => ({
      path: f.file,
      sha256: sha256(JSON.stringify(f.data, null, 2) + '\n'),
      sources: f.sources,
    })),
    summary: `${shards.length} book shard(s) + global (${globalData.counts.concepts} CB · ${globalData.counts.figures} FIG · ${globalData.counts.sc_rulings} SC · ${globalData.counts.vocabulary_values} vocab values)`,
    // Structured view for the Atlas page renderers — same objects, no re-read.
    data: {
      books: bookIndexRows,
      shards: new Map(shards.map((s) => [s.data.book.id, s.data])),
      global: globalData,
    },
  };
}

// ---- helpers -----------------------------------------------------------------

/** Guarded reader: every atlas source must real-resolve inside the repo,
 *  inside an allowed root, and never under _working/. Violation = GateError. */
function sourceReader(repoRoot) {
  const realRoot = fs.realpathSync(repoRoot);
  const allowed = [path.join(realRoot, '_spec') + path.sep, path.join(realRoot, 'fixtures') + path.sep];
  const allowedFiles = new Set([path.join(realRoot, 'SPEC_CHANGES.md'), path.join(realRoot, 'VOCABULARY_LOG.md')]);
  const consumed = [];

  const guardedRead = (rel) => {
    const requested = path.join(repoRoot, rel);
    let real;
    try {
      real = fs.realpathSync(requested);
    } catch {
      throw new GateError([`atlas: required source ${rel} is missing or unresolvable`]);
    }
    const inWorking = real === path.join(realRoot, '_working') || real.startsWith(path.join(realRoot, '_working') + path.sep);
    const inAllowed = allowedFiles.has(real) || allowed.some((root) => real.startsWith(root));
    if (inWorking || !inAllowed) {
      throw new GateError([
        `atlas: source ${rel} resolves to ${real} — outside the approved-canon source roots` +
          (inWorking ? ' (inside _working/, which the portal never reads)' : ''),
      ]);
    }
    const raw = fs.readFileSync(real, 'utf8');
    consumed.push({ path: rel.split(path.sep).join('/'), sha256: sha256(raw) });
    return raw;
  };

  return {
    readText: guardedRead,
    readJson: (rel) => {
      try {
        return JSON.parse(guardedRead(rel));
      } catch (e) {
        if (e instanceof GateError) throw e;
        throw new Error(`atlas: ${rel} does not parse as JSON: ${e.message}`);
      }
    },
    consumed: () => [...consumed],
  };
}

/** SPEC_CHANGES.md ledger rows → {id, title, date, status, highlights, more_highlights}. */
export function parseScRows(text) {
  const rows = [];
  // Ledger statuses are a small vocabulary; matching against it (instead of
  // "first uppercase run") keeps 'SECTION A APPLIED' → APPLIED, never 'SECTION'.
  const STATUS_RE = /\b(APPLIED|SHIPPED|MERGED|APPROVED|PROPOSED|DRAFTED|COMPLETE|VOID|SUPERSEDED|OPEN|PENDING)\b/;
  const clip = (s, n) => (s.length > n ? `${s.slice(0, n - 1)}…` : s);
  for (const line of text.split('\n')) {
    if (!/^\|\s*SC-\d{4}\s*\|/.test(line)) continue;
    // Cells themselves contain pipes (escaped \| and raw | inside **bold**
    // board summaries) — protect those before splitting on the real
    // delimiters, or the status cell shears off mid-sentence.
    const protectedLine = line
      .replace(/\\\|/g, '')
      .replace(/\*\*.*?\*\*/g, (b) => b.replace(/\|/g, ''));
    const parts = protectedLine.split('|');
    if (parts.length < 4) continue;
    const restore = (s) => s.replace(//g, '|');
    const id = parts[1].trim();
    const decision = restore(parts.slice(2, -2).join('|'));
    const statusCell = restore(parts[parts.length - 2]);
    // The ledger's own convention bolds a ruling's headline facts (e.g.
    // SC-0078's "SPEECH_ACT 26 → 33") — carried as highlights; anything
    // shortened is marked with an ellipsis, anything beyond the cap is
    // counted so the page can say so.
    const rawBolds = [...decision.matchAll(/\*\*(.+?)\*\*/g)].map((b) => collapse(b[1]));
    const title = clip(rawBolds[0] ?? collapse(decision), 160);
    const allHighlights = [...new Set(rawBolds.slice(1))].map((h) => clip(h, 140));
    const highlights = allHighlights.slice(0, 8);
    const date = (line.match(/20\d{2}-\d{2}-\d{2}/) ?? [null])[0];
    const status = (collapse(statusCell).match(STATUS_RE) ?? [null])[0];
    rows.push({ id, title, date, status, highlights, more_highlights: allHighlights.length - highlights.length });
  }
  return rows;
}

function collapse(s) {
  return String(s).replace(/\*\*/g, '').replace(/\s+/g, ' ').trim();
}

/** Keep every non-null override fact, drop editorial _note keys, never invent. */
function normalizeOverrides(ov) {
  if (!ov) return null;
  const pick = (list) =>
    (list ?? [])
      .map((o) => {
        const out = {};
        for (const [k, v] of Object.entries(o)) {
          if (k === '_note' || v == null) continue;
          out[k] = v;
        }
        return out;
      })
      .filter((o) => Object.keys(o).length > 0);
  const sceneLevel = pick(ov.scene_level);
  const momentLevel = pick(ov.moment_level);
  if (sceneLevel.length === 0 && momentLevel.length === 0) return null;
  return { scene_level: sceneLevel, moment_level: momentLevel };
}

function walkSlots(value, visit, key = null) {
  if (Array.isArray(value)) {
    for (const v of value) walkSlots(v, visit, key);
  } else if (value && typeof value === 'object') {
    for (const [k, v] of Object.entries(value)) walkSlots(v, visit, k);
  } else if (key != null && typeof value === 'string') {
    visit(key, value);
  }
}

function assertUniqueIds(nodes, where) {
  const seen = new Set();
  for (const n of nodes) {
    if (seen.has(n.id)) throw new GateError([`atlas: duplicate node id "${n.id}" in ${where}`]);
    seen.add(n.id);
  }
}

function sha256(s) {
  return crypto.createHash('sha256').update(s).digest('hex');
}
