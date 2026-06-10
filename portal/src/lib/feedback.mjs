import { escapeAttr, escapeHtml } from './html.mjs';

// Feedback channel (form-PRIMARY — external reviewers have no GitHub).
//
// Every artifact section gets "Ask a question" / "Suggest a change" buttons
// that open Marcia's Google Form with pericope / artifact / section / kind
// pre-filled. The Form does not exist yet: portal.config.json ships with
// formBase: null, and until it is filled in the buttons render as visibly
// disabled placeholders. Connecting the real Form is a one-line config edit
// (see portal/README.md — "Connecting the Google Form").
//
// Google Forms prefill mechanics: take the form's "Get pre-filled link" URL,
//   https://docs.google.com/forms/d/e/<FORM_ID>/viewform?usp=pp_url&entry.111=...
// formBase = everything up to /viewform, entries.* = the entry.N field ids.

export const KIND = { question: 'I have a question', suggestion: 'I suggest a change' };

export function buildFeedbackUrl(formCfg, { pericope, artifact, section, kind }) {
  const base = formCfg?.formBase;
  if (!base || !/^https:\/\/docs\.google\.com\/forms\//.test(base)) return null;

  const params = new URLSearchParams({ usp: 'pp_url' });
  const entries = formCfg.entries ?? {};
  const put = (entryId, value) => {
    if (entryId && value) params.set(entryId, value);
  };
  put(entries.pericope, pericope);
  put(entries.artifact, artifact);
  put(entries.section, section);
  put(entries.kind, kind);

  return `${base.replace(/\/$/, '')}/viewform?${params.toString()}`;
}

/**
 * The per-artifact button pair. When the form is not configured yet, render
 * disabled placeholders that say so honestly.
 */
export function renderFeedbackButtons(formCfg, { pericope, artifact, section = null }) {
  const ask = buildFeedbackUrl(formCfg, { pericope, artifact, section, kind: KIND.question });
  const suggest = buildFeedbackUrl(formCfg, { pericope, artifact, section, kind: KIND.suggestion });

  if (!ask || !suggest) {
    const tip = 'The feedback form is being set up — these buttons will go live soon.';
    return (
      `<span class="btns btns-disabled" title="${escapeAttr(tip)}">` +
      `<span class="btn btn-disabled">Ask a question</span>` +
      `<span class="btn btn-disabled">Suggest a change</span>` +
      `</span>`
    );
  }
  return (
    `<span class="btns">` +
    `<a class="btn" href="${escapeAttr(ask)}" target="_blank" rel="noopener">Ask a question</a>` +
    `<a class="btn" href="${escapeAttr(suggest)}" target="_blank" rel="noopener">Suggest a change</a>` +
    `</span>`
  );
}

/** Section-level ask-link factory for map headings (null when unconfigured). */
export function sectionAskUrlFactory(formCfg, { pericope, artifact }) {
  const probe = buildFeedbackUrl(formCfg, { pericope, artifact, section: 'x', kind: KIND.question });
  if (!probe) return null;
  return (sectionText) =>
    escapeHtml(
      buildFeedbackUrl(formCfg, { pericope, artifact, section: sectionText, kind: KIND.question })
    );
}
