// Deck loading. The deck is plain JSON (public/decks/*.json) so the real
// image deck replaces the placeholder without code changes (rule: images are
// swappable handles; audio is the object).

import { saveDeck, getDeckById, kvGet, kvSet } from '../db.js';

export const DEFAULT_DECK_URL = 'decks/default-deck.json';

function validateDeck(deck) {
  if (!deck || typeof deck !== 'object') throw new Error('deck: not an object');
  for (const k of ['id', 'version', 'items']) {
    if (!(k in deck)) throw new Error(`deck: missing "${k}"`);
  }
  const seen = new Set();
  for (const it of deck.items) {
    if (!it.id || seen.has(it.id)) throw new Error(`deck: duplicate/missing item id ${it.id}`);
    seen.add(it.id);
    if (![1, 2, 3].includes(it.level)) throw new Error(`deck item ${it.id}: bad level`);
    if (it.level === 3 && !it.frame?.targetWordIds?.length) {
      throw new Error(`deck item ${it.id}: level 3 needs frame.targetWordIds`);
    }
  }
  return deck;
}

/** Fetch the bundled default deck, persist it, and mark it active. */
export async function ensureDefaultDeck() {
  const activeId = await kvGet('activeDeckId');
  if (activeId) {
    const existing = await getDeckById(activeId);
    if (existing) return existing;
  }
  const res = await fetch(DEFAULT_DECK_URL);
  const deck = validateDeck(await res.json());
  await saveDeck(deck);
  await kvSet('activeDeckId', deck.id);
  return deck;
}

/** Facilitator: load a replacement deck from a picked JSON file. */
export async function importDeckFile(file) {
  const deck = validateDeck(JSON.parse(await file.text()));
  await saveDeck(deck);
  await kvSet('activeDeckId', deck.id);
  return deck;
}

export function itemsById(deck) {
  return new Map(deck.items.map((it) => [it.id, it]));
}
