import { expect, test } from "@playwright/test";
import {
  DEMO_TITLE,
  DEMO_TITLE_FILE,
  HEX64,
  MOCK_BADGE,
  V1,
  V2,
  addComment,
  backToPassages,
  bead,
  buildRecordingZip,
  compareFromList,
  dragBeads,
  expectNoTapeNumbers,
  expectTechnicalDetailsClosed,
  gotoPassages,
  loadDemo,
  mainText,
  openListen,
  openReport,
  openSettings,
  passageCard,
  readDownload,
  readDownloadBytes,
  strip,
  versionItem,
  waitForCompareAudio,
  zipEntries,
  zipText,
} from "./helpers";

/**
 * End-to-end smoke test against the built app (see playwright.config.ts).
 * Each test starts in a fresh browser context (empty IndexedDB); the demo
 * passage is loaded through the UI where a test needs it.
 *
 * Fixture facts (tests/fixtures.test.ts, tools/make_fixtures.py): v2 differs
 * from v1 in exactly three regions, in this order — substituted (A 2.26–2.54 s,
 * the bead labelled 0:02,3), inserted (3.72 s) and melody (phrase 4). The
 * first phrase of v1 (0.28–1.34 s) is untouched. Time positions use the
 * pt-BR decimal mark ("0:02,3"), like the seconds and the percent.
 */

const STRIP_V1 = `Contas da versão ${V1}`;
const CODEBOOK_MISMATCH = "Estas duas gravações usam códigos de som diferentes e não podem ser comparadas.";
const NO_CHANGE_WARNING = "Em pelo menos um ponto não foi detectada mudança.";
const CONFIRMED = "Correção solicitada confirmada";

/** The end of a "0:00,3 – 0:01,1" range text; the m:ss,d shape compares as text. */
function endOf(range: string): string {
  return range.split(" – ")[1] ?? "";
}

/** Read the settings the app saved in this browser (a read, never a write). */
function storedSettings(page: import("@playwright/test").Page): Promise<unknown> {
  return page.evaluate(() => JSON.parse(localStorage.getItem("bead-compare.settings.v1") ?? "null") as unknown);
}

test.describe("Bead Compare smoke", () => {
  test("1. passage list: empty, demo loads two mock versions, hashes only inside technical details", async ({ page }) => {
    await gotoPassages(page);
    await expect(page.getByText("Nenhuma passagem ainda.")).toBeVisible();
    await expect(page.locator("article.passage")).toHaveCount(0);

    await page.getByRole("button", { name: "Carregar passagem de demonstração" }).click();
    await expect(page.getByRole("status").filter({ hasText: "Passagem de demonstração carregada com duas versões." })).toBeVisible({
      timeout: 30_000,
    });

    const card = passageCard(page);
    await expect(card).toBeVisible();
    await expect(card.getByRole("heading", { level: 2 })).toHaveText(DEMO_TITLE);
    await expect(card.locator("li.version")).toHaveCount(2);
    await expect(versionItem(page, V1)).toBeVisible();
    await expect(versionItem(page, V2)).toBeVisible();
    await expect(card.locator(".mock-badge")).toHaveCount(2);
    await expect(card.locator(".mock-badge")).toHaveText([MOCK_BADGE, MOCK_BADGE]);

    // Hashes are hidden until the technical details are expanded.
    await expectTechnicalDetailsClosed(page);
    const before = await mainText(page);
    expect(before).not.toMatch(HEX64);
    expect(before).not.toMatch(/sha256/i);

    const details = versionItem(page, V1).locator("details.tech");
    await details.getByText("Detalhes técnicos", { exact: true }).click();
    await expect(details).toHaveJSProperty("open", true);
    const fullHash = (await details.locator("code.tech__full").first().textContent())?.trim() ?? "";
    expect(fullHash).toMatch(/^[0-9a-f]{64}$/);
    expect(before).not.toContain(fullHash);
    const after = await mainText(page);
    expect(after).toContain(fullHash);
  });

  test("2. listen: beads render, a tap plays, a drag selects, a comment is saved, keys and markers work", async ({ page }) => {
    await loadDemo(page);
    await openListen(page, V1);
    await expect(page.locator(".mock-badge")).toHaveCount(1); // the header badge
    const beads = strip(page, STRIP_V1);
    await expect(beads).toBeVisible();
    await expect.poll(() => beads.locator("rect.bead").count()).toBeGreaterThan(10);

    // Loop so the (very short) slice keeps playing while we look at the UI.
    const loop = page.getByRole("button", { name: "Repetir", exact: true });
    await expect(loop).toBeEnabled();
    await loop.click();
    await expect(loop).toHaveAttribute("aria-pressed", "true");

    await bead(beads, "0:00,6").click();
    await expect(page.getByText("Trecho selecionado", { exact: true })).toBeVisible();
    await expect(page.getByText("0:00,6 – 0:00,8", { exact: true })).toBeVisible();
    await expect(beads.locator("rect.strip-selection")).toBeVisible();
    await expect(page.getByRole("alert")).toHaveCount(0);
    // Playback started: the play button shows the pause label and the cursor is drawn.
    // (A vertical SVG <line> has a zero-width box, so it is checked by presence,
    // not by toBeVisible; its x1 advancing proves the audio clock really runs.)
    await expect(page.getByRole("button", { name: "Pausar", exact: true })).toBeVisible();
    const cursor = beads.locator("line.strip-cursor");
    await expect(cursor).toHaveCount(1);
    const x0 = Number(await cursor.getAttribute("x1"));
    expect(Number.isFinite(x0)).toBe(true);
    await expect.poll(async () => Number(await cursor.getAttribute("x1")), { timeout: 5_000 }).not.toBe(x0);
    await page.getByRole("button", { name: "Parar", exact: true }).click();
    await expect(page.getByRole("button", { name: "Tocar", exact: true })).toBeVisible();
    await expect(cursor).toHaveCount(0);

    // Drag across three beads of the first phrase: the selection snaps to cluster bounds.
    await dragBeads(page, beads, "0:00,3", "0:00,8");
    await expect(page.getByText("0:00,3 – 0:01,1", { exact: true })).toBeVisible();
    await expect(page.getByRole("alert")).toHaveCount(0);

    // "c" opens the editor for the selection and focuses the text field, so
    // typing (Space included) goes into the comment, not to the shortcuts.
    await page.keyboard.press("c");
    await expect(page.getByText("Novo comentário em 0:00,3 – 0:01,1", { exact: true })).toBeVisible();
    const editor = page.locator("form.comment-editor");
    const textbox = editor.getByRole("textbox", { name: "Comentário", exact: true });
    await expect(textbox).toBeFocused();
    await page.keyboard.type("Trocar esta sílaba");
    await expect(textbox).toHaveValue("Trocar esta sílaba"); // the spaces landed in the text, not on play/pause
    await editor.getByRole("radio", { name: "Correção solicitada", exact: true }).check();
    await editor.getByRole("button", { name: "Salvar", exact: true }).click();
    await expect(editor).toBeHidden();

    await expect(beads.locator("rect.strip-marker")).toHaveCount(1);
    await expect(beads.locator("rect.strip-marker--fix_requested")).toHaveCount(1);
    const listed = page.locator(".comment-list .comment");
    await expect(listed).toHaveCount(1);
    await expect(listed.first()).toContainText("Trocar esta sílaba");
    await expect(listed.first()).toContainText("Correção solicitada");
    await expect(listed.first()).toContainText("Em aberto");
    await expect(listed.first()).toContainText("0:00,3 – 0:01,1");
    // the marker is a named button (kind, author, span)
    const marker = beads.getByRole("button", { name: /^Correção solicitada, .+, 0:00,3 – 0:01,1$/ });
    await expect(marker).toHaveCount(1);
    await expect(page.getByRole("alert")).toHaveCount(0);

    // Tap the marker: its comment becomes the current one, its span the selection, and it plays.
    const play = page.getByRole("button", { name: "Tocar", exact: true });
    const pause = page.getByRole("button", { name: "Pausar", exact: true });
    const stop = page.getByRole("button", { name: "Parar", exact: true });
    const rangeText = page.locator(".listen__range .tabular");
    await stop.click();
    await page.getByRole("button", { name: "Limpar seleção", exact: true }).click();
    await expect(page.getByText("Toda a gravação", { exact: true })).toBeVisible();
    await marker.click();
    await expect(page.locator(".comment-list .comment[aria-current='true']")).toHaveCount(1);
    await expect(rangeText).toHaveText("0:00,3 – 0:01,1");
    await expect(pause).toBeVisible();
    await stop.click();
    await expect(play).toBeVisible();

    // → grows the selection by one speech group (and plays it); Space pauses and resumes.
    await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());
    await page.keyboard.press("ArrowRight");
    await expect(rangeText).not.toHaveText("0:00,3 – 0:01,1");
    const grown = await rangeText.innerText();
    expect(grown).toMatch(/^0:00,3 – 0:0\d,\d$/);
    expect(endOf(grown) > "0:01,1").toBe(true);
    await expect(pause).toBeVisible();
    await stop.click();
    await expect(play).toBeVisible();
    await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur()); // Space on a focused button is a click
    await page.keyboard.press("Space");
    await expect(pause).toBeVisible();
    await page.keyboard.press("Space");
    await expect(play).toBeVisible(); // paused, not stopped: the cursor stays
    await expect(beads.locator("line.strip-cursor")).toHaveCount(1);
    await stop.click();
    await expect(beads.locator("line.strip-cursor")).toHaveCount(0);

    // Play with no selection: the whole recording, with a moving cursor.
    await page.getByRole("button", { name: "Limpar seleção", exact: true }).click();
    await expect(page.getByText("Toda a gravação", { exact: true })).toBeVisible();
    await play.click();
    await expect(pause).toBeVisible();
    const whole = beads.locator("line.strip-cursor");
    await expect(whole).toHaveCount(1);
    const w0 = Number(await whole.getAttribute("x1"));
    await expect.poll(async () => Number(await whole.getAttribute("x1")), { timeout: 5_000 }).toBeGreaterThan(w0);
    await stop.click();
    await expect(page.getByRole("alert")).toHaveCount(0);
  });

  test("3. compare: three regions in order, region playback, a verdict persists across reload", async ({ page }) => {
    await loadDemo(page);
    await compareFromList(page);
    // header (2) and both strip labels (2)
    await expect(page.locator(".mock-badge")).toHaveCount(4);

    const facts = page.locator(".compare__summary .fact");
    await expect(facts).toHaveCount(3);
    await expect(facts.nth(0).locator(".fact__value")).toHaveText("3");
    await expect(facts.nth(0).locator(".fact__label")).toHaveText("Regiões");
    await expect(facts.nth(2).locator(".fact__label")).toHaveText("Estabilidade");
    await expect(facts.nth(2).locator(".fact__value")).toHaveText(/^\d{1,3}(,\d)?%$/);

    const rows = page.locator(".region-row");
    await expect(rows).toHaveCount(3);
    await expect(rows.locator(".region-row__kind")).toHaveText(["Substituído", "Inserido", "Mesmos sons, outra melodia"]);
    await expect(page.locator("svg.bead-strip")).toHaveCount(2);

    // Tap the melody region (the longest, 1.3 s on each side): A plays, then, after the gap, B.
    await waitForCompareAudio(page);
    const stripA = strip(page, `Versão A: ${V1}`);
    const stripB = strip(page, `Versão B: ${V2}`);
    await rows.nth(2).locator(".region-row__main").click();
    await expect(rows.nth(2)).toHaveAttribute("aria-current", "true");
    await expect(page.locator(".compare__player-title")).toContainText("Região 3");
    const loop = page.getByRole("button", { name: "Repetir", exact: true });
    await loop.click(); // A, gap, B, gap, A… so both cursors come round
    await expect(loop).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByRole("button", { name: "Pausar", exact: true })).toBeVisible();
    await expect(stripA.locator("line.strip-cursor")).toHaveCount(1);
    await expect(stripB.locator("line.strip-cursor")).toHaveCount(1);

    // "Ouvir A" plays one side only; pause shows the play label again; stop clears the cursors.
    await page.getByRole("button", { name: "Ouvir A", exact: true }).click();
    await expect(stripB.locator("line.strip-cursor")).toHaveCount(0);
    await expect(stripA.locator("line.strip-cursor")).toHaveCount(1);
    await page.getByRole("button", { name: "Ouvir B", exact: true }).click();
    await expect(stripA.locator("line.strip-cursor")).toHaveCount(0);
    await expect(stripB.locator("line.strip-cursor")).toHaveCount(1);
    await page.getByRole("button", { name: "Pausar", exact: true }).click();
    await expect(page.getByRole("button", { name: "Ouvir A e B", exact: true })).toBeVisible();
    await page.getByRole("button", { name: "Parar", exact: true }).click();
    await expect(stripA.locator("line.strip-cursor")).toHaveCount(0);
    await expect(stripB.locator("line.strip-cursor")).toHaveCount(0);
    await expect(loop).toHaveAttribute("aria-pressed", "true");

    const verdict = rows.nth(0).getByRole("combobox");
    await expect(verdict).toHaveValue("undecided");
    await verdict.selectOption("requested_fix_confirmed");
    await expect(verdict).toHaveValue("requested_fix_confirmed");
    await expect(page.getByRole("alert")).toHaveCount(0);

    await page.reload();
    await expect(page.locator(".region-row")).toHaveCount(3);
    await expect(page.locator(".region-row").nth(0).getByRole("combobox")).toHaveValue("requested_fix_confirmed");
    await expect(page.locator(".region-row").nth(1).getByRole("combobox")).toHaveValue("undecided");
  });

  test("4. carry-forward: requests carry with their outcome, link to their region, and survive being resolved", async ({ page }) => {
    await loadDemo(page);
    await openListen(page, V1);
    const beads = strip(page, STRIP_V1);

    // Over the substituted span (A 2.26–2.54 s is exactly one bead).
    await bead(beads, "0:02,3").click();
    await expect(page.getByText("0:02,3 – 0:02,5", { exact: true })).toBeVisible();
    await addComment(page, { text: "Corrigir a sílaba trocada", kind: "fix_requested" });

    // On untouched material: the first bead of the first phrase.
    await bead(beads, "0:00,3").click();
    await expect(page.getByText("0:00,3 – 0:00,6", { exact: true })).toBeVisible();
    await addComment(page, { text: "Primeira frase, nada mudou", kind: "fix_requested" });
    await expect(beads.locator("rect.strip-marker")).toHaveCount(2);

    await backToPassages(page);
    await compareFromList(page);

    const carried = page.locator(".carried-row");
    await expect(carried).toHaveCount(2);
    const changed = carried.filter({ hasText: "Corrigir a sílaba trocada" });
    await expect(changed.locator(".carried-row__badge")).toHaveText("Mudou aqui");
    const untouched = carried.filter({ hasText: "Primeira frase, nada mudou" });
    await expect(untouched.locator(".carried-row__badge")).toHaveText("Sem mudança detectada aqui");
    await expect(page.getByRole("status").filter({ hasText: NO_CHANGE_WARNING })).toBeVisible();

    // Both land on the B strip: one steel-blue highlight, one dashed vermilion warning.
    const stripB = strip(page, `Versão B: ${V2}`);
    await expect(stripB.locator("rect.strip-marker--carried")).toHaveCount(2);
    await expect(stripB.locator("rect.strip-highlight--carried")).toHaveCount(1);
    await expect(stripB.locator("rect.strip-highlight--carried_warning")).toHaveCount(1);
    await expect(stripB.locator("rect.strip-highlight--carried_warning")).toHaveAttribute("stroke-dasharray", "4 3");
    await expect(page.getByRole("alert")).toHaveCount(0);

    // The changed request links to region 1 and shows that region's verdict; the untouched one links nowhere.
    await expect(changed.locator(".carried-row__region")).toHaveText(["Região 1 — Ainda sem decisão"]);
    await expect(untouched.locator(".carried-row__region")).toHaveCount(0);
    await page.locator(".region-row").nth(0).getByRole("combobox").selectOption("requested_fix_confirmed");
    await expect(changed.locator(".carried-row__region")).toHaveText([`Região 1 — ${CONFIRMED}`]);
    await changed.locator(".carried-row__region").click(); // the link selects the region
    await expect(page.locator(".region-row").nth(0)).toHaveAttribute("aria-current", "true");

    // Confirming the fix: mark the request resolved. It stays listed, now "Resolvido", and can be reopened.
    await expect(changed).toContainText("Em aberto");
    await changed.getByRole("button", { name: "Marcar como resolvido", exact: true }).click();
    await expect(carried).toHaveCount(2);
    await expect(changed).toContainText("Resolvido");
    await expect(changed.getByRole("button", { name: "Reabrir", exact: true })).toBeVisible();
    await expect(changed.getByRole("button", { name: "Marcar como resolvido", exact: true })).toHaveCount(0);
    await expect(untouched).toContainText("Em aberto");
    await expect(page.getByRole("status").filter({ hasText: NO_CHANGE_WARNING })).toBeVisible(); // the open one still warns
    await expect(page.getByRole("alert")).toHaveCount(0);

    // The report keeps both, with status, outcome and the region's verdict.
    await openReport(page);
    const carriedTable = page.locator("table.report-table").nth(1);
    await expect(carriedTable.locator("tbody tr")).toHaveCount(2);
    const reportChanged = carriedTable.locator("tbody tr").filter({ hasText: "Corrigir a sílaba trocada" });
    await expect(reportChanged).toContainText("Mudou aqui");
    await expect(reportChanged).toContainText("Resolvido");
    await expect(reportChanged.locator(".report__region-link")).toHaveText([`Região 1 — ${CONFIRMED}`]);
    const reportUntouched = carriedTable.locator("tbody tr").filter({ hasText: "Primeira frase, nada mudou" });
    await expect(reportUntouched).toContainText("Sem mudança detectada aqui");
    await expect(reportUntouched).toContainText("Em aberto");
    await expect(page.getByRole("status").filter({ hasText: NO_CHANGE_WARNING })).toBeVisible();
    const [md] = await Promise.all([
      page.waitForEvent("download"),
      page.getByRole("button", { name: "Baixar Markdown", exact: true }).click(),
    ]);
    const markdown = await readDownload(md);
    expect(markdown).toMatch(new RegExp(`^\\| .+ \\| Corrigir a sílaba trocada \\| .+ \\| Mudou aqui \\| Resolvido \\| Região 1 — ${CONFIRMED} \\|$`, "m"));
    expect(markdown).toMatch(/^\| .+ \| Primeira frase, nada mudou \| .+ \| Sem mudança detectada aqui \| Em aberto \| — \|$/m);
    expect(markdown).toContain("| Situação | Região |");

    // The carried copies are persisted on B: Listen on v2 lists them as carried, with no delete button;
    // the resolved one is resolved there too.
    await page.getByRole("link", { name: "Passagens", exact: true }).click();
    await expect(page.getByRole("heading", { level: 1, name: "Passagens" })).toBeVisible();
    await openListen(page, V2);
    const onB = page.locator(".comment-list .comment--carried");
    await expect(onB).toHaveCount(2);
    await expect(onB.filter({ hasText: "Corrigir a sílaba trocada" })).toContainText("Resolvido");
    await expect(onB.filter({ hasText: "Primeira frase, nada mudou" })).toContainText("Transferido");
    await expect(onB.first().locator(".comment__carried")).toHaveText("Transferido da versão anterior");
    await expect(onB.first().getByRole("button", { name: "Excluir", exact: true })).toHaveCount(0);
    await expect(strip(page, `Contas da versão ${V2}`).locator("rect.strip-marker--carried")).toHaveCount(2);

    // Re-opening Compare does not duplicate them.
    await backToPassages(page);
    await compareFromList(page);
    await expect(page.locator(".carried-row")).toHaveCount(2);
    await backToPassages(page);
    await openListen(page, V2);
    await expect(page.locator(".comment-list .comment--carried")).toHaveCount(2);
  });

  test("5. report: labels, stability, three regions, Markdown and JSON downloads", async ({ page }) => {
    await loadDemo(page);
    await compareFromList(page);
    await page.getByRole("link", { name: "Ver relatório", exact: true }).click();
    await expect(page).toHaveURL(/#\/report\//);

    await expect(page.getByRole("heading", { level: 1, name: DEMO_TITLE })).toBeVisible();
    await expect(page.getByText(`A: ${V1}`, { exact: true })).toBeVisible();
    await expect(page.getByText(`B: ${V2}`, { exact: true })).toBeVisible();
    await expect(page.locator(".report__version-hint")).toHaveText(["(anterior)", "(mais recente)"]);
    // header (2) and the two version facts (2)
    await expect(page.locator(".mock-badge")).toHaveCount(4);

    const stability = page.locator(".report-fact").filter({ hasText: "Estabilidade" }).locator(".report-fact__value");
    await expect(stability).toHaveText(/^\d{1,3}(,\d)?%$/);
    const regionsFact = page.locator(".report-fact").filter({ hasText: "Regiões" }).locator(".report-fact__value");
    await expect(regionsFact).toHaveText("3");
    await expect(page.locator(".report-fact__label")).toHaveText(["Regiões", "Alterados", "Estabilidade"]);
    await expect(page.locator("table.report-table").first().locator("tbody tr")).toHaveCount(3);

    const [mdDownload] = await Promise.all([
      page.waitForEvent("download"),
      page.getByRole("button", { name: "Baixar Markdown", exact: true }).click(),
    ]);
    // The label "v2 revisão (3 mudanças)" must reach the file name ASCII-folded:
    // Chromium drops the whole name (→ "download") when it contains ã/ç.
    expect(mdDownload.suggestedFilename()).toMatch(new RegExp(`^bead-compare-${DEMO_TITLE_FILE}-v1_rascunho-vs-v2_revisao_\\(3_mudancas\\)\\.md$`));
    const md = await readDownload(mdDownload);
    expect(md).toContain(DEMO_TITLE);
    expect(md).toMatch(/^\| 1 \| Substituído \| /m);
    expect(md).toMatch(/^\| 2 \| Inserido \| /m);
    expect(md).toMatch(/^\| 3 \| Mesmos sons, outra melodia \| /m);

    const [jsonDownload] = await Promise.all([
      page.waitForEvent("download"),
      page.getByRole("button", { name: "Baixar JSON", exact: true }).click(),
    ]);
    expect(jsonDownload.suggestedFilename()).toMatch(/\.json$/);
    const data = JSON.parse(await readDownload(jsonDownload)) as {
      passage: string;
      region_count: number;
      regions: Array<{ kind: string }>;
      a: { label: string };
      b: { label: string };
    };
    expect(data.passage).toBe(DEMO_TITLE);
    expect(data.regions.length).toBe(3);
    expect(data.region_count).toBe(3);
    expect(data.regions.map((r) => r.kind)).toEqual(["substituted", "inserted", "melody"]);
    expect(data.a.label).toBe(V1);
    expect(data.b.label).toBe(V2);
  });

  test("6. language toggle: EN changes header and screen texts, PT restores them, the choice persists", async ({ page }) => {
    await gotoPassages(page);
    const en = page.getByRole("button", { name: "EN", exact: true });
    const pt = page.getByRole("button", { name: "PT", exact: true });
    await expect(pt).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator(".app-title__sub")).toHaveText("Checagem de consultor para tradução oral da Bíblia");

    await en.click();
    await expect(en).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator(".app-title__sub")).toHaveText("Consultant checking for Oral Bible Translation");
    await expect(page.getByRole("heading", { level: 1, name: "Passages" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Load demo passage", exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "Settings", exact: true })).toBeVisible();
    await expect(page.locator("html")).toHaveAttribute("lang", "en");

    await page.reload();
    await expect(page.getByRole("heading", { level: 1, name: "Passages" })).toBeVisible();
    await expect(page.getByRole("button", { name: "EN", exact: true })).toHaveAttribute("aria-pressed", "true");

    await page.getByRole("button", { name: "PT", exact: true }).click();
    await expect(page.getByRole("heading", { level: 1, name: "Passagens" })).toBeVisible();
    await expect(page.locator(".app-title__sub")).toHaveText("Checagem de consultor para tradução oral da Bíblia");
    await expect(page.getByRole("button", { name: "Configurações", exact: true })).toBeVisible();
    await expect(page.locator("html")).toHaveAttribute("lang", "pt-BR");

    await page.reload();
    await expect(page.getByRole("heading", { level: 1, name: "Passagens" })).toBeVisible();
    await expect(page.getByRole("button", { name: "PT", exact: true })).toHaveAttribute("aria-pressed", "true");
  });

  test("7. codebook mismatch: a recording on another codebook is refused by Compare", async ({ page }) => {
    await loadDemo(page);
    const label = "v3 outro codebook";
    const zip = buildRecordingZip({ codebookHash: "sha256:" + "deadbeef".repeat(8), label });

    const zipInput = passageCard(page).locator("input[type=file][accept*='zip']");
    await zipInput.setInputFiles({ name: "v3.zip", mimeType: "application/zip", buffer: zip });
    await expect(page.getByRole("status").filter({ hasText: `Versão “${label}” adicionada.` })).toBeVisible({ timeout: 30_000 });
    await expect(versionItem(page, label)).toBeVisible();
    await expect(passageCard(page).locator("li.version")).toHaveCount(3);

    await page.getByRole("radio", { name: `Usar “${V1}” como A`, exact: true }).check();
    await page.getByRole("radio", { name: `Usar “${label}” como B`, exact: true }).check();
    await compareFromList(page);

    await expect(page.getByRole("alert")).toHaveText(CODEBOOK_MISMATCH);
    await expect(page.getByText(`A: ${V1}`, { exact: true })).toBeVisible();
    await expect(page.getByText(`B: ${label}`, { exact: true })).toBeVisible();
    await expect(page.locator(".mock-badge")).toHaveCount(2); // both are mock tapes (v3 is v1's tape on another codebook)
    await expect(page.locator("svg.bead-strip")).toHaveCount(0);
    await expect(page.locator(".region-row")).toHaveCount(0);
    await expect(page.locator(".compare__summary")).toHaveCount(0);
    await expectTechnicalDetailsClosed(page);

    // The report refuses the same pair the same way: no summary, no tables, the badge in the header.
    await page.goto(page.url().replace("#/compare/", "#/report/"));
    await expect(page).toHaveURL(/#\/report\//);
    await expect(page.getByRole("alert")).toHaveText(CODEBOOK_MISMATCH);
    await expect(page.getByText(`A: ${V1}`, { exact: true })).toBeVisible();
    await expect(page.getByText(`B: ${label}`, { exact: true })).toBeVisible();
    await expect(page.locator(".mock-badge")).toHaveCount(2);
    await expect(page.locator(".report__summary")).toHaveCount(0);
    await expect(page.locator("table.report-table")).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Baixar Markdown", exact: true })).toHaveCount(0);
  });

  test("8. export and import: the passage zip round-trips versions and comments", async ({ page }) => {
    await loadDemo(page);
    await openListen(page, V1);
    const beads = strip(page, STRIP_V1);
    await bead(beads, "0:00,6").click();
    await addComment(page, { text: "Comentário que viaja no zip", kind: "note" });
    await backToPassages(page);
    await expect(passageCard(page)).toBeVisible();

    const [download] = await Promise.all([
      page.waitForEvent("download"),
      passageCard(page).getByRole("button", { name: "Exportar passagem (.zip)", exact: true }).click(),
    ]);
    expect(download.suggestedFilename()).toMatch(/\.zip$/);
    const zipBytes = await readDownloadBytes(download);
    expect(zipBytes.length).toBeGreaterThan(1000);

    page.once("dialog", (dialog) => void dialog.accept());
    await passageCard(page).getByRole("button", { name: "Excluir passagem", exact: true }).click();
    await expect(page.getByRole("status").filter({ hasText: `Passagem “${DEMO_TITLE}” excluída.` })).toBeVisible();
    await expect(page.locator("article.passage")).toHaveCount(0);
    await expect(page.getByText("Nenhuma passagem ainda.")).toBeVisible();

    await page.locator(".toolbar input[type=file]").setInputFiles({
      name: download.suggestedFilename(),
      mimeType: "application/zip",
      buffer: zipBytes,
    });
    await expect(page.getByRole("status").filter({ hasText: `Passagem “${DEMO_TITLE}” importada.` })).toBeVisible({ timeout: 30_000 });
    await expect(passageCard(page)).toBeVisible();
    await expect(passageCard(page).locator("li.version")).toHaveCount(2);
    await expect(versionItem(page, V1)).toBeVisible();
    await expect(versionItem(page, V2)).toBeVisible();
    await expect(passageCard(page).locator(".mock-badge")).toHaveCount(2);

    await openListen(page, V1);
    await expect(page.locator(".comment-list .comment__text")).toHaveText(["Comentário que viaja no zip"]);
    await expect(strip(page, STRIP_V1).locator("rect.strip-marker")).toHaveCount(1);
    await expect(page.getByRole("alert")).toHaveCount(0);
  });

  test("10. import refusal: a missing or broken tape.json is refused in Portuguese, its detail inside technical details", async ({ page }) => {
    await loadDemo(page);
    const zip = buildRecordingZip({ omitTape: true });
    const zipInput = passageCard(page).locator("input[type=file][accept*='zip']");
    await zipInput.setInputFiles({ name: "sem-tape.zip", mimeType: "application/zip", buffer: zip });
    const errors = page.locator(".import-errors");
    await expect(errors).toBeVisible();
    await expect(errors).toContainText("A gravação não pôde ser importada:");
    await expect(errors).toContainText("O arquivo tape.json não foi encontrado.");
    expect(await errors.innerText()).not.toMatch(/was not found|not a WAV/);
    await expect(passageCard(page).locator("li.version")).toHaveCount(2);

    // A tape with a bead out of range: the sentence is Portuguese and number-free;
    // the parser's own words sit inside a closed "Detalhes técnicos".
    const broken = buildRecordingZip({ mutateTape: (t) => ((t.u as number[])[12] = 500) });
    await zipInput.setInputFiles({ name: "quebrado.zip", mimeType: "application/zip", buffer: broken });
    await expect(errors).toContainText("O arquivo tape.json é inválido.");
    const visible = await errors.innerText();
    expect(visible).not.toMatch(/out of range|\d/);
    await expectTechnicalDetailsClosed(page);
    const details = errors.locator("details.tech");
    await expect(details).toHaveCount(1);
    await details.getByText("Detalhes técnicos", { exact: true }).click();
    await expect(details).toHaveJSProperty("open", true);
    await expect(details.locator("code")).toHaveText("u[12] is out of range 0–99");
    await expect(passageCard(page).locator("li.version")).toHaveCount(2);
  });

  test("9. numbers policy: no codebook, sha256 or full hash outside collapsed technical details", async ({ page }) => {
    await loadDemo(page);

    await openListen(page, V1);
    await bead(strip(page, STRIP_V1), "0:00,6").click();
    await expect(page.getByText("Trecho selecionado", { exact: true })).toBeVisible();
    await expectTechnicalDetailsClosed(page);
    expectNoTapeNumbers(await mainText(page));

    await backToPassages(page);
    await compareFromList(page);
    await expect(page.locator(".region-row")).toHaveCount(3);
    await expectTechnicalDetailsClosed(page);
    expectNoTapeNumbers(await mainText(page));

    await page.getByRole("link", { name: "Ver relatório", exact: true }).click();
    await expect(page.locator("table.report-table").first().locator("tbody tr")).toHaveCount(3);
    await expectTechnicalDetailsClosed(page);
    expectNoTapeNumbers(await mainText(page));
  });

  test("11. settings: Compare recomputes as you type, a comma is a decimal mark, reset brings the defaults back", async ({ page }) => {
    await loadDemo(page);
    await compareFromList(page);
    const rows = page.locator(".region-row");
    await expect(rows).toHaveCount(3);

    const dialog = await openSettings(page);
    const mergeGap = dialog.getByLabel("Distância para unir regiões");
    await expect(mergeGap).toHaveValue("10");
    // With 200 beads of tolerance the three demo regions (59 and 25 matched beads apart) fold into one.
    await mergeGap.fill("200");
    await expect(rows).toHaveCount(1);
    await expect(page.locator(".compare__summary .fact").nth(0).locator(".fact__label")).toHaveText("Região");

    // "0,5" means one half, not five: the field is text, so the browser cannot rewrite it.
    const penalty = dialog.getByLabel("Penalidade de divergência");
    await expect(penalty).toHaveValue("1");
    await penalty.fill("0,5");
    await expect(penalty).toHaveValue("0,5");
    await expect(penalty).not.toHaveAttribute("aria-invalid", "true");
    await expect.poll(() => storedSettings(page)).toMatchObject({ alignment: { mismatch_penalty: 0.5, merge_gap_frames: 200 } });

    // An unusable draft is marked and snaps back on blur, leaving the stored value alone.
    await penalty.fill("-1");
    await expect(penalty).toHaveAttribute("aria-invalid", "true");
    await penalty.blur();
    await expect(penalty).toHaveValue("0.5");
    expect(await storedSettings(page)).toMatchObject({ alignment: { mismatch_penalty: 0.5 } });

    await dialog.getByRole("button", { name: "Restaurar padrões", exact: true }).click();
    await expect(mergeGap).toHaveValue("10");
    await expect(penalty).toHaveValue("1");
    await expect(rows).toHaveCount(3);
    await expect(page.locator(".compare__summary .fact").nth(0).locator(".fact__label")).toHaveText("Regiões");
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(page.getByRole("alert")).toHaveCount(0);
  });

  test("12. spoken comment: recorded with the microphone, it travels to B, the report and the export", async ({ page }) => {
    await loadDemo(page);
    await openListen(page, V1);
    const beads = strip(page, STRIP_V1);
    await bead(beads, "0:02,3").click();
    await expect(page.getByText("0:02,3 – 0:02,5", { exact: true })).toBeVisible();

    await page.keyboard.press("c");
    const editor = page.locator("form.comment-editor");
    await expect(editor).toBeVisible();
    await editor.getByRole("textbox", { name: "Comentário", exact: true }).fill("Falar mais devagar");
    await editor.getByRole("radio", { name: "Correção solicitada", exact: true }).check();
    await editor.getByRole("button", { name: "Gravar comentário falado", exact: true }).click();
    await expect(editor.getByRole("status")).toHaveText("Gravando…");
    await page.waitForTimeout(1_200); // the fake microphone speaks for a second
    await editor.getByRole("button", { name: "Parar de gravar", exact: true }).click();
    await expect(editor.locator("audio.comment-editor__preview")).toHaveCount(1);
    await expect(editor.getByRole("button", { name: "Descartar áudio", exact: true })).toBeVisible();
    await editor.getByRole("button", { name: "Salvar", exact: true }).click();
    await expect(editor).toBeHidden();

    // On Listen the comment has text and a player for the recording.
    const listed = page.locator(".comment-list .comment");
    await expect(listed).toHaveCount(1);
    await expect(listed.first()).toContainText("Falar mais devagar");
    await expect(listed.first().locator("audio.comment__audio")).toHaveCount(1);
    await expect(page.getByRole("alert")).toHaveCount(0);

    // Carried onto B with its audio; the report marks the audio column; the copy on B plays it too.
    await backToPassages(page);
    await compareFromList(page);
    const carried = page.locator(".carried-row");
    await expect(carried).toHaveCount(1);
    await expect(carried.first().locator("audio")).toHaveCount(1);
    await openReport(page);
    const carriedRow = page.locator("table.report-table").nth(1).locator("tbody tr");
    await expect(carriedRow).toHaveCount(1);
    await expect(carriedRow.first().locator("td").nth(3)).toHaveText("sim");
    await page.getByRole("link", { name: "Passagens", exact: true }).click();
    await expect(page.getByRole("heading", { level: 1, name: "Passagens" })).toBeVisible();
    await openListen(page, V2);
    await expect(page.locator(".comment-list .comment--carried audio.comment__audio")).toHaveCount(1);

    // The export carries the recording as comments/<id>.<ext>, named in the manifest.
    await backToPassages(page);
    const [download] = await Promise.all([
      page.waitForEvent("download"),
      passageCard(page).getByRole("button", { name: "Exportar passagem (.zip)", exact: true }).click(),
    ]);
    const bytes = await readDownloadBytes(download);
    const entries = zipEntries(bytes);
    const audioFiles = Object.keys(entries).filter((name) => /^comments\/[^/]+\.(webm|ogg|mp4)$/.test(name));
    expect(audioFiles).toHaveLength(2); // the original on A and its carried copy on B
    for (const name of audioFiles) expect(entries[name]).toBeGreaterThan(0);
    const manifest = JSON.parse(zipText(bytes, "passage.json")) as { comments: Array<{ audio_file: string | null; text?: string }> };
    expect(manifest.comments.map((c) => c.audio_file).sort()).toEqual(audioFiles.sort());
    expect(manifest.comments.every((c) => c.text === "Falar mais devagar")).toBe(true);
  });
});
