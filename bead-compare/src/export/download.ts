/**
 * Browser downloads through a blob URL and a temporary <a download>.
 * Used by the passage list (zip export) and the report screen
 * (Markdown / JSON).
 */

const REVOKE_DELAY_MS = 30_000;

export function downloadBlob(filename: string, blob: Blob): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.rel = "noopener";
  a.style.display = "none";
  document.body.appendChild(a);
  a.click();
  a.remove();
  // Revoke later: some browsers start the download asynchronously.
  setTimeout(() => URL.revokeObjectURL(url), REVOKE_DELAY_MS);
}

export function downloadText(filename: string, text: string, mime: string): void {
  downloadBlob(filename, new Blob([text], { type: mime }));
}

/**
 * A file-name-safe, ASCII-only version of a title:
 * "Ruth 1:1-5 (demo)" → "Ruth_1-1-5_(demo)", "v2 revisão (3 mudanças)" → "v2_revisao_(3_mudancas)".
 *
 * ASCII only because Chromium ignores the whole `download` name when it
 * contains a non-ASCII character and saves the file as "download" with no
 * extension. Accents are folded (ã → a, ç → c); anything else outside
 * printable ASCII, control characters and file-system-reserved characters
 * become "-"; whitespace becomes "_".
 */
export function safeFilename(title: string, fallback = "passage"): string {
  const cleaned = title
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^\x20-\x7e]+/g, "-")
    .replace(/[\\/:*?"<>|]+/g, "-")
    .replace(/\s+/g, "_")
    .replace(/^[.\-_]+|[.\-_]+$/g, "");
  return cleaned.length > 0 ? cleaned.slice(0, 120) : fallback;
}
