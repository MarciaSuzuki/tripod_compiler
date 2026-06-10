import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { DEFAULT_SETTINGS, SETTINGS_KV_KEY } from '../config.js';
import {
  kvGet, kvSet, listLanguages, getSpeaker, getSession, getOrCreateTodaySession,
} from '../db.js';
import { ensureDefaultDeck } from '../deck/deckLoader.js';

const Ctx = createContext(null);
export const useApp = () => useContext(Ctx);

export function AppProvider({ children }) {
  const [ready, setReady] = useState(false);
  const [route, setRoute] = useState('facilitator');
  const [deck, setDeck] = useState(null);
  const [language, setLanguage] = useState(null);
  const [speaker, setSpeaker] = useState(null);   // active player
  const [session, setSession] = useState(null);   // active session (rule 4 source)
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [devMode, setDevMode] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Restore everything from IndexedDB — a refresh mid-session loses nothing.
  useEffect(() => {
    (async () => {
      const d = await ensureDefaultDeck();
      setDeck(d);
      const saved = await kvGet(SETTINGS_KV_KEY);
      if (saved) setSettings({ ...DEFAULT_SETTINGS, ...saved });
      setDevMode((await kvGet('devMode')) ?? false);
      const langId = await kvGet('activeLanguageId');
      if (langId) {
        const langs = await listLanguages();
        setLanguage(langs.find((l) => l.id === langId) ?? null);
      }
      const spkId = await kvGet('activeSpeakerId');
      if (spkId) {
        const sp = await getSpeaker(spkId);
        setSpeaker(sp ?? null);
        const sesId = await kvGet('activeSessionId');
        if (sesId && sp) {
          const ses = await getSession(sesId);
          if (ses && ses.speakerId === sp.id) setSession(ses);
        }
      }
      const savedRoute = await kvGet('route');
      if (savedRoute) setRoute(savedRoute);
      setReady(true);
    })();
  }, []);

  const goto = useCallback((r) => { setRoute(r); kvSet('route', r); }, []);
  const bump = useCallback(() => setRefreshKey((k) => k + 1), []);

  const selectLanguage = useCallback(async (lang) => {
    setLanguage(lang);
    await kvSet('activeLanguageId', lang?.id ?? null);
  }, []);

  const startSessionFor = useCallback(async (sp) => {
    const ses = await getOrCreateTodaySession(sp.id);
    setSpeaker(sp);
    setSession(ses);
    await kvSet('activeSpeakerId', sp.id);
    await kvSet('activeSessionId', ses.id);
    return ses;
  }, []);

  const endSession = useCallback(async () => {
    setSpeaker(null);
    setSession(null);
    await kvSet('activeSpeakerId', null);
    await kvSet('activeSessionId', null);
  }, []);

  const saveSettings = useCallback(async (next) => {
    setSettings(next);
    await kvSet(SETTINGS_KV_KEY, next);
  }, []);

  const toggleDev = useCallback(async () => {
    setDevMode((v) => { kvSet('devMode', !v); return !v; });
  }, []);

  const value = useMemo(() => ({
    ready, route, goto, deck, setDeck, language, selectLanguage,
    speaker, session, startSessionFor, endSession,
    settings, saveSettings, devMode, toggleDev, refreshKey, bump,
  }), [ready, route, goto, deck, language, selectLanguage, speaker, session,
       startSessionFor, endSession, settings, saveSettings, devMode, toggleDev, refreshKey, bump]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
