// Facilitator console (text allowed, pt-BR via strings.js):
//   Setup     — language, speakers + consent, deck, session start, dev panel
//   Dashboard — items×reps matrix, core completion, convergence, export
//   Review    — listen to the takes of an item and override the canonical

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useApp } from '../state/AppContext.jsx';
import {
  upsertLanguage, listLanguages, addSpeaker, listSpeakers,
  listRecordings, listJudgments, setCanonicalManual, wipeAll,
} from '../db.js';
import { importDeckFile } from '../deck/deckLoader.js';
import { buildHistory, repsOf, targetOf, countsAsRep } from '../logic/scheduler.js';
import { deriveConvergence } from '../logic/convergence.js';
import { speakerColor } from '../logic/ids.js';
import { exportZip } from '../export/exporter.js';
import { seedDemoData } from '../dev/seed.js';
import { playRecording } from '../audio/player.js';
import { Icons } from '../deck/icons.jsx';
import { ProgressRing } from '../components/ProgressRing.jsx';
import { STR, AGE_BANDS, GENDERS } from '../strings.js';

export function Facilitator() {
  const [tab, setTab] = useState('setup');
  const { goto, speaker, session } = useApp();
  return (
    <div className="fac-screen">
      <header className="fac-header">
        <h1>{STR.appTitle}</h1>
        <nav>
          <button className={tab === 'setup' ? 'active' : ''} onClick={() => setTab('setup')}>{STR.facilitator}</button>
          <button className={tab === 'dash' ? 'active' : ''} onClick={() => setTab('dash')}>{STR.dashboard}</button>
          <button className={tab === 'review' ? 'active' : ''} onClick={() => setTab('review')}>{STR.canonicalReview}</button>
        </nav>
        {speaker && session && (
          <button className="fac-session-chip" onClick={() => goto('home')}>
            <span className="speaker-dot" style={{ background: speakerColor(speaker.id) }} />
            {STR.activeSession}: {speaker.alias} →
          </button>
        )}
      </header>
      {tab === 'setup' && <SetupTab />}
      {tab === 'dash' && <DashboardTab />}
      {tab === 'review' && <ReviewTab />}
    </div>
  );
}

// ----------------------------------------------------------------- Setup
function SetupTab() {
  const {
    language, selectLanguage, deck, setDeck, startSessionFor, goto,
    settings, saveSettings, devMode, toggleDev, refreshKey, bump,
  } = useApp();
  const [languages, setLanguages] = useState([]);
  const [speakers, setSpeakers] = useState([]);
  const [newLang, setNewLang] = useState('');
  const [form, setForm] = useState({ alias: '', ageBand: '', gender: '', consent: false });
  const [seedState, setSeedState] = useState('');

  const load = useCallback(async () => {
    setLanguages(await listLanguages());
    setSpeakers(await listSpeakers(language?.id));
  }, [language]);
  useEffect(() => { load(); }, [load, refreshKey]);

  const createLang = async () => {
    if (!newLang.trim()) return;
    const lang = await upsertLanguage({ name: newLang.trim() });
    await selectLanguage(lang);
    setNewLang('');
    bump();
  };

  const createSpeaker = async () => {
    if (!form.alias.trim() || !language) return;
    await addSpeaker({
      languageId: language.id, alias: form.alias.trim(),
      ageBand: form.ageBand, gender: form.gender,
      consentAt: form.consent ? new Date().toISOString() : null, // consent timestamped (setup rule)
    });
    setForm({ alias: '', ageBand: '', gender: '', consent: false });
    bump();
  };

  const start = async (sp) => {
    if (!sp.consentAt) { alert(STR.consentRequired); return; }
    await startSessionFor(sp);
    goto('home');
  };

  const onDeckFile = async (e) => {
    const f = e.target.files?.[0];
    if (f) setDeck(await importDeckFile(f));
  };

  const seed = async () => {
    setSeedState(STR.seeding);
    const lang = language ?? (await upsertLanguage({ name: 'Língua demo' }));
    if (!language) await selectLanguage(lang);
    await seedDemoData({ language: lang, deck });
    setSeedState(STR.seeded);
    bump();
  };

  return (
    <main className="fac-main">
      <section className="fac-card">
        <h3>{STR.language}</h3>
        <div className="fac-row">
          <select value={language?.id ?? ''} onChange={(e) => selectLanguage(languages.find((l) => l.id === e.target.value) ?? null)}>
            <option value="">—</option>
            {languages.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
          </select>
          <input placeholder={STR.languageName} value={newLang} onChange={(e) => setNewLang(e.target.value)} />
          <button onClick={createLang}>{STR.newLanguage}</button>
        </div>
        <h3>{STR.deck}</h3>
        <div className="fac-row">
          <span>{deck?.name} · {STR.deckVersion} {deck?.version} · {deck?.items.length} {STR.items}</span>
          <input type="file" accept=".json" onChange={onDeckFile} />
        </div>
      </section>

      <section className="fac-card">
        <h3>{STR.speakers}</h3>
        {speakers.length === 0 && <p className="hint">{STR.speakerNeeded}</p>}
        {speakers.map((sp) => (
          <div key={sp.id} className="fac-row speaker-row">
            <span className="speaker-dot" style={{ background: speakerColor(sp.id) }} />
            <b>{sp.alias}</b>
            <span className="hint">{sp.ageBand} {sp.gender} {sp.consentAt ? '✓ consentimento' : '— sem consentimento'}</span>
            <button onClick={() => start(sp)}>{STR.startSession}</button>
          </div>
        ))}
        <div className="fac-row">
          <input placeholder={`${STR.alias}`} value={form.alias} onChange={(e) => setForm({ ...form, alias: e.target.value })} />
          <select value={form.ageBand} onChange={(e) => setForm({ ...form, ageBand: e.target.value })}>
            {AGE_BANDS.map((a) => <option key={a} value={a}>{a || `${STR.ageBand} ${STR.optional}`}</option>)}
          </select>
          <select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
            {GENDERS.map((g) => <option key={g} value={g}>{g || `${STR.gender} ${STR.optional}`}</option>)}
          </select>
        </div>
        <label className="fac-check">
          <input type="checkbox" checked={form.consent} onChange={(e) => setForm({ ...form, consent: e.target.checked })} />
          {STR.consent}
        </label>
        <button onClick={createSpeaker}>{STR.addSpeaker}</button>
      </section>

      <section className="fac-card">
        <h3>{STR.devPanel}</h3>
        <label className="fac-check">
          <input type="checkbox" checked={devMode} onChange={toggleDev} /> {STR.devMode}
        </label>
        <div className="fac-row">
          <label>{STR.spacing}
            <input type="number" min="0" max="20" value={settings.spacingMinIntervening}
              onChange={(e) => saveSettings({ ...settings, spacingMinIntervening: +e.target.value })} />
          </label>
          <label>{STR.dailyCap}
            <input type="number" min="1" max="10" value={settings.maxRepsPerSessionDay}
              onChange={(e) => saveSettings({ ...settings, maxRepsPerSessionDay: +e.target.value })} />
          </label>
        </div>
        <div className="fac-row">
          <button onClick={seed}>{STR.seedDemo}</button>
          <span className="hint">{seedState}</span>
          <button className="danger" onClick={async () => { if (confirm(STR.wipeConfirm)) { await wipeAll(); location.reload(); } }}>
            {STR.wipe}
          </button>
        </div>
      </section>
    </main>
  );
}

// ------------------------------------------------------------- Dashboard
function DashboardTab() {
  const { deck, language, settings, refreshKey } = useApp();
  const [speakers, setSpeakers] = useState([]);
  const [histories, setHistories] = useState(new Map()); // speakerId -> history
  const [canonSessions, setCanonSessions] = useState(new Map()); // speakerId -> Set(itemIds with canonical)
  const [convergence, setConvergence] = useState(new Map());
  const [counts, setCounts] = useState({ baskets: 0, free: 0 });
  const [exporting, setExporting] = useState('');

  useEffect(() => {
    (async () => {
      const sps = await listSpeakers(language?.id);
      setSpeakers(sps);
      const hs = new Map();
      const cs = new Map();
      for (const sp of sps) {
        const recs = await listRecordings({ speakerId: sp.id, purpose: 'probe' });
        hs.set(sp.id, buildHistory(recs));
        cs.set(sp.id, new Set(recs.filter((r) => r.canonical).map((r) => r.itemId)));
      }
      setHistories(hs);
      setCanonSessions(cs);
      const recordings = await listRecordings({});
      const judgments = await listJudgments();
      setConvergence(deriveConvergence({
        judgments, recordingsById: new Map(recordings.map((r) => [r.id, r])),
      }));
      setCounts({
        baskets: judgments.filter((j) => j.type === 'basket' || j.type === 'oddOneOut').length,
        free: recordings.filter((r) => r.purpose === 'archive').length,
      });
    })();
  }, [language, refreshKey]);

  const coreItems = useMemo(() => deck.items.filter((i) => i.coreItem), [deck]);

  const doExport = async () => {
    setExporting(STR.exporting);
    const res = await exportZip({ language, deck });
    setExporting(`${res.name} · ${(res.bytes / 1024).toFixed(0)} kB · ${res.recordings} rec`);
  };

  return (
    <main className="fac-main">
      <section className="fac-card">
        <div className="fac-row space-between">
          <div>
            <b>{STR.basketsDone}:</b> {counts.baskets} · <b>{STR.freeRecordings}:</b> {counts.free}
          </div>
          <div className="fac-row">
            <button className="primary" onClick={doExport}><Icons.download width="20" height="20" /> {STR.export}</button>
            <span className="hint">{exporting || STR.exportNote}</span>
          </div>
        </div>
      </section>

      <section className="fac-card">
        <h3>{STR.coreProgress}</h3>
        {speakers.map((sp) => {
          const h = histories.get(sp.id);
          const done = h ? coreItems.filter((it) => repsOf(h, it.id) >= targetOf(it, settings)).length : 0;
          return (
            <div key={sp.id} className="fac-row core-bar-row">
              <span className="speaker-dot" style={{ background: speakerColor(sp.id) }} />
              <span className="core-name">{sp.alias}</span>
              <div className="core-bar"><div className="core-bar-fill" style={{ width: `${coreItems.length ? (100 * done) / coreItems.length : 0}%` }} /></div>
              <span>{done}/{coreItems.length}</span>
            </div>
          );
        })}
      </section>

      <section className="fac-card">
        <h3>{STR.repsMatrix} · {STR.convergence}</h3>
        <div className="matrix-wrap">
          <table className="matrix">
            <thead>
              <tr>
                <th />
                {speakers.map((sp) => (
                  <th key={sp.id}><span className="speaker-dot" style={{ background: speakerColor(sp.id) }} /> {sp.alias}</th>
                ))}
                <th>{STR.convergence}</th>
              </tr>
            </thead>
            <tbody>
              {deck.items.map((it) => {
                const conv = convergence.get(it.id);
                return (
                  <tr key={it.id} className={it.coreItem ? 'core-row' : ''}>
                    <td className="item-cell">
                      {it.conceptGloss}
                      <span className="lvl-tag">N{it.level}</span>
                      {it.coreItem && <span className="core-tag">{STR.coreLabel}</span>}
                    </td>
                    {speakers.map((sp) => {
                      const h = histories.get(sp.id);
                      const reps = h ? repsOf(h, it.id) : 0;
                      const target = targetOf(it, settings);
                      const hasCanon = canonSessions.get(sp.id)?.has(it.id);
                      return (
                        <td key={sp.id} className="reps-cell">
                          <ProgressRing value={reps} max={target} size={22} stroke={3} />
                          <span className={reps >= target ? 'done' : ''}>{reps}/{target}</span>
                          {hasCanon && <span className="canon-dot" title="canonical" />}
                        </td>
                      );
                    })}
                    <td>
                      {it.coreItem ? (
                        conv && conv.judgedCount > 0 ? (
                          <span className={`conv-chip ${conv.sameCount > 0 ? 'same' : 'diff'}`}>
                            {conv.sameCount}/{conv.judgedCount} {STR.convergencePairs}
                          </span>
                        ) : (
                          <span className="conv-chip none">{STR.noJudgmentsYet}</span>
                        )
                      ) : null}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}

// ---------------------------------------------------------------- Review
function ReviewTab() {
  const { deck, language, refreshKey, bump } = useApp();
  const [speakers, setSpeakers] = useState([]);
  const [spId, setSpId] = useState('');
  const [takesByItem, setTakesByItem] = useState(new Map());

  useEffect(() => {
    (async () => {
      const sps = await listSpeakers(language?.id);
      setSpeakers(sps);
      if (!spId && sps[0]) setSpId(sps[0].id);
    })();
  }, [language, refreshKey]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    (async () => {
      if (!spId) return;
      const recs = (await listRecordings({ speakerId: spId, purpose: 'probe' })).filter(countsAsRep);
      const m = new Map();
      for (const r of recs) {
        if (!m.has(r.itemId)) m.set(r.itemId, []);
        m.get(r.itemId).push(r);
      }
      for (const arr of m.values()) arr.sort((a, b) => a.takeIndex - b.takeIndex);
      setTakesByItem(m);
    })();
  }, [spId, refreshKey]);

  const star = async (rec) => { await setCanonicalManual(rec.id); bump(); };

  return (
    <main className="fac-main">
      <section className="fac-card">
        <div className="fac-row">
          <select value={spId} onChange={(e) => setSpId(e.target.value)}>
            {speakers.map((sp) => <option key={sp.id} value={sp.id}>{sp.alias}</option>)}
          </select>
          <span className="hint">{STR.pickCanonical}</span>
        </div>
        {[...takesByItem.entries()].map(([itemId, takes]) => {
          const item = deck.items.find((i) => i.id === itemId);
          return (
            <div key={itemId} className="review-item">
              <b>{item?.conceptGloss ?? itemId}</b> <span className="hint">{takes.length} {STR.takes}</span>
              <div className="review-takes">
                {takes.map((t) => (
                  <div key={t.id} className={`take-row ${t.canonical ? 'canonical' : ''}`}>
                    <button className="icon-btn" onClick={() => playRecording(t.id)}><Icons.play width="22" height="22" /></button>
                    <span>#{t.takeIndex}</span>
                    <span className="hint">{(t.durationMs / 1000).toFixed(1)}s · {STR.quality} {t.quality} · score {Number(t.qualityScore ?? 0).toFixed(1)}</span>
                    <button className="icon-btn star" onClick={() => star(t)}>
                      {t.canonical ? <Icons.starFilled width="24" height="24" /> : <Icons.star width="24" height="24" />}
                    </button>
                    {t.canonical && <span className="hint">{t.canonicalManual ? STR.manual : STR.auto}</span>}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
        {takesByItem.size === 0 && <p className="hint">{STR.noTakes}</p>}
      </section>
    </main>
  );
}
