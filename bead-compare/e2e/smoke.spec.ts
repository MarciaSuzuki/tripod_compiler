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
  passageCard,
  readDownload,
  readDownloadBytes,
  strip,
  versionItem,
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

  test("2. listen: beads render, a tap plays, a drag selects, and a comment is saved", async ({ page }) => {
    await loadDemo(page);
    await openListen(page, V1);
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
    await expect(beads.getByRole("button", { name: /^Correção solicitada, .+, 0:00,3 – 0:01,1$/ })).toHaveCount(1);
    await expect(page.getByRole("alert")).toHaveCount(0);
  });

  test("3. compare: three regions in order, a verdict persists across reload", async ({ page }) => {
    await loadDemo(page);
    await compareFromList(page);

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

  test("4. carry-forward: a fix request on the substituted span changed, one on the first phrase did not", async ({ page }) => {
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

    // The carried copies are persisted on B: Listen on v2 lists them as carried, with no delete button.
    await backToPassages(page);
    await openListen(page, V2);
    const onB = page.locator(".comment-list .comment--carried");
    await expect(onB).toHaveCount(2);
    await expect(onB.filter({ hasText: "Corrigir a sílaba trocada" })).toContainText("Transferido");
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

    const stability = page.locator(".report-fact").filter({ hasText: "Estabilidade" }).locator(".report-fact__value");
    await expect(stability).toHaveText(/^\d{1,3}(,\d)?%$/);
    const regionsFact = page.locator(".report-fact").filter({ hasText: "Regiões" }).locator(".report-fact__value");
    await expect(regionsFact).toHaveText("3");
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
    await expect(page.locator("svg.bead-strip")).toHaveCount(0);
    await expect(page.locator(".region-row")).toHaveCount(0);
    await expect(page.locator(".compare__summary")).toHaveCount(0);
    await expectTechnicalDetailsClosed(page);
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

  test("10. import refusal: a recording without tape.json is refused in Portuguese", async ({ page }) => {
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
});
