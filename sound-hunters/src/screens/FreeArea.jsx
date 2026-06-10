// Free area — "Our verbal art". Big open mic + category icons. Everything
// recorded here carries purpose:"archive" (rule 5 — never mixed with probes).
// Tongue twisters prompt three takes (turtle / person / rabbit = slow /
// normal / fast) linked by setId. Attribution + reuse consent are
// facilitator-side (gear strip), optional, and may be a voice note.

import { useState } from 'react';
import { useApp } from '../state/AppContext.jsx';
import { addRecording, listRecordings, updateRecording } from '../db.js';
import { RecorderPanel } from '../components/RecorderPanel.jsx';
import { Icons } from '../deck/icons.jsx';
import { newId, speakerColor } from '../logic/ids.js';
import { sparkle } from '../audio/tones.js';
import { STR } from '../strings.js';

const CATEGORIES = [
  { id: 'tongueTwister', Icon: Icons.knot, takes: 3 },
  { id: 'song', Icon: Icons.note, takes: 1 },
  { id: 'story', Icon: Icons.storyFire, takes: 1 },
  { id: 'riddle', Icon: Icons.unknown, takes: 1 },
  { id: 'other', Icon: Icons.dots, takes: 1 },
];
const PACE_ICONS = [Icons.turtle, Icons.person, Icons.rabbit]; // slow / normal / fast

export function FreeArea() {
  const { speaker, session, settings, goto, bump } = useApp();
  const [cat, setCat] = useState(null);
  const [takeNo, setTakeNo] = useState(0);    // tongue twister: 0..2
  const [setId, setSetId] = useState(null);
  const [lastRec, setLastRec] = useState(null);
  const [facOpen, setFacOpen] = useState(false);
  const [attrText, setAttrText] = useState('');
  const [attrRecording, setAttrRecording] = useState(false);

  if (!speaker || !session) return null;

  const saveTake = async ({ blob, mimeType, durationMs, analysis, quality }, category, idx, set) => {
    const prior = (await listRecordings({ speakerId: speaker.id, purpose: 'archive' }))
      .filter((r) => r.category === category).length;
    const rec = await addRecording({
      itemId: null, speakerId: speaker.id, sessionId: session.id,
      takeIndex: set ? idx + 1 : prior + 1,
      purpose: 'archive', category, setId: set,
      durationMs, quality, qualityScore: analysis.qualityScore, mimeType,
    }, blob);
    setLastRec(rec);
    bump();
    return rec;
  };

  const onAccept = async (take) => {
    if (cat.id === 'tongueTwister') {
      const set = setId ?? newId('set');
      if (!setId) setSetId(set);
      await saveTake(take, cat.id, takeNo, set);
      if (takeNo < 2) setTakeNo(takeNo + 1);
      else { sparkle(); setCat(null); setTakeNo(0); setSetId(null); }
    } else {
      await saveTake(take, cat.id, 0, null);
      sparkle();
      setCat(null);
    }
  };

  // Facilitator strip: attribution as text or voice note; reuse consent.
  const saveFacMeta = async (patch) => {
    if (!lastRec) return;
    const next = await updateRecording(lastRec.id, patch);
    setLastRec(next);
    bump();
  };

  const onAttrVoice = async ({ blob, mimeType, durationMs, analysis, quality }) => {
    const note = await addRecording({
      itemId: null, speakerId: speaker.id, sessionId: session.id, takeIndex: 1,
      purpose: 'archive', category: null,
      durationMs, quality, qualityScore: analysis.qualityScore, mimeType,
    }, blob);
    await saveFacMeta({ attribution: `rec:${note.id}` });
    setAttrRecording(false);
  };

  return (
    <div className="player-screen">
      <header className="player-bar">
        <button className="icon-btn" onPointerUp={() => (cat ? setCat(null) : goto('home'))}>
          {cat ? <Icons.back width="34" height="34" /> : <Icons.home width="34" height="34" />}
        </button>
        <div className="mode-badge"><Icons.freeArt width="36" height="36" /></div>
        <div className="speaker-dot" style={{ background: speakerColor(speaker.id) }} />
      </header>

      {!cat && (
        <main className="mode-grid">
          {CATEGORIES.map((c) => (
            <button key={c.id} className="mode-btn" onPointerUp={() => { setCat(c); setTakeNo(0); setSetId(null); }}>
              <c.Icon width="64" height="64" />
            </button>
          ))}
          {lastRec && (
            <button className="mode-btn subtle" onPointerUp={() => setFacOpen(true)}>
              <Icons.gear width="44" height="44" />
            </button>
          )}
        </main>
      )}

      {cat && (
        <main className="naming-stage">
          <div className="free-head">
            <cat.Icon width="90" height="90" />
            {cat.id === 'tongueTwister' && (
              <div className="pace-row">
                {PACE_ICONS.map((P, i) => (
                  <div key={i} className={`pace-icon ${i === takeNo ? 'active' : i < takeNo ? 'done' : ''}`}>
                    <P width="56" height="56" />
                  </div>
                ))}
              </div>
            )}
          </div>
          <RecorderPanel gateMs={settings.archiveGateMs} onAccept={onAccept} resetKey={`${cat.id}-${takeNo}`} />
        </main>
      )}

      {facOpen && lastRec && (
        <div className="overlay">
          <div className="overlay-card fac-card">
            <h3>{STR.attribution}</h3>
            <input
              className="fac-input" value={attrText} placeholder={STR.attribution}
              onChange={(e) => setAttrText(e.target.value)}
              onBlur={() => attrText && saveFacMeta({ attribution: attrText })}
            />
            {!attrRecording ? (
              <button className="fac-row-btn" onClick={() => setAttrRecording(true)}>
                🎙 {STR.attributionVoice}
              </button>
            ) : (
              <RecorderPanel gateMs={settings.archiveGateMs} onAccept={onAttrVoice} resetKey="attr" />
            )}
            <label className="fac-check">
              <input
                type="checkbox" checked={!!lastRec.reuseConsent}
                onChange={(e) => saveFacMeta({ reuseConsent: e.target.checked })}
              />
              {STR.reuseConsent}
            </label>
            <button className="fac-row-btn subtle" onClick={() => setFacOpen(false)}>{STR.close}</button>
          </div>
        </div>
      )}
    </div>
  );
}
