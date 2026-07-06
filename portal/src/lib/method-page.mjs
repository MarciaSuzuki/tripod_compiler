import crypto from 'node:crypto';
import { renderFeedbackButtons } from './feedback.mjs';

// The Tripod Method page ("Three Legs, Three Translation Roles") is Marcia's
// approved artifact, vendored byte-identical from
// https://shema-verification-portal.vercel.app/tripod-concept.html
// (work order: tripod-eval-artifacts/PORTAL-METHOD-PAGE-WORKORDER.md; Evaluator
// pin below). The published page must be the pinned bytes plus EXACTLY the two
// ruled insertion blocks — the back-link and the house feedback buttons —
// nothing else: no restyle, no reflow, not a comma. The blocks' own styles are
// scoped under portal-method-* class prefixes so they cannot touch the page's
// presentation. If the vendored file ever drifts from the pin, the build fails
// loudly rather than shipping an unruled page.
export const METHOD_PAGE_SOURCE_SHA256 =
  '4790fb9599ecab386353ba8b74141b14cb1672e5ff5ea03c5d158108b64ece54';

// Both blocks carry their surrounding newlines so rendering is pure
// concatenation at the anchors — the fidelity test strips these exact strings
// and requires the remainder to equal the vendored source byte-for-byte.
export function methodPageBlocks(formCfg) {
  const backLink =
    '\n<nav class="portal-method-nav" style="max-width:1020px;margin:0 auto;padding:18px 24px 0;font-family:var(--sans);font-size:13.5px;">' +
    '<a href="index.html">← Back to the reading room</a></nav>';
  const feedback =
    '<footer class="portal-method-feedback">\n' +
    '<style>\n' +
    '  .portal-method-feedback{max-width:1020px;margin:0 auto;padding:8px 24px 64px;font-family:var(--sans);}\n' +
    '  .portal-method-feedback .fb-rule{border:0;border-top:1px solid var(--line);margin:0 0 16px;}\n' +
    '  .portal-method-feedback .btns{display:inline-flex;gap:.4rem;flex-wrap:wrap;}\n' +
    '  .portal-method-feedback .btn{font-size:13px;padding:.28rem .75rem;border:1px solid var(--facilitator);border-radius:6px;color:var(--facilitator);text-decoration:none;background:var(--card);}\n' +
    '  .portal-method-feedback .btn:hover{background:#EDF2FA;}\n' +
    '  .portal-method-feedback .btn-disabled{border-color:var(--ink-soft);color:var(--ink-soft);cursor:not-allowed;}\n' +
    '</style>\n' +
    '<hr class="fb-rule">\n' +
    renderFeedbackButtons(formCfg, {
      pericope: 'The Tripod Method page',
      artifact: 'The website itself',
    }) +
    '\n</footer>\n';
  return { backLink, feedback };
}

export function renderMethodPage(sourceHtml, formCfg) {
  const sha = crypto.createHash('sha256').update(sourceHtml).digest('hex');
  if (sha !== METHOD_PAGE_SOURCE_SHA256) {
    throw new Error(
      `tripod-method-source.html does not match the Evaluator's pin — refusing to publish an unruled page.\n` +
        `  pinned: ${METHOD_PAGE_SOURCE_SHA256}\n  actual: ${sha}\n` +
        `If Marcia shipped a new version of the page, re-pin it via the work order; do not edit the vendored file.`
    );
  }
  const opens = sourceHtml.split('<body>').length - 1;
  const closes = sourceHtml.split('</body>').length - 1;
  if (opens !== 1 || closes !== 1) {
    throw new Error(
      `tripod-method-source.html: expected exactly one <body> and one </body> anchor (got ${opens}/${closes}).`
    );
  }
  const { backLink, feedback } = methodPageBlocks(formCfg);
  return sourceHtml
    .replace('<body>', '<body>' + backLink)
    .replace('</body>', feedback + '</body>');
}
