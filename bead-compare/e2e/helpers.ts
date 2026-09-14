import { expect, type Download, type Locator, type Page } from "@playwright/test";
import { strToU8, zipSync } from "fflate";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Shared helpers for the smoke test. Every locator uses the DEFAULT language
 * (pt-BR) texts from src/i18n/strings/*.ts, so a string change there shows
 * up here as a failing test rather than a silent drift.
 */

export const DEMO_TITLE = "Rute 1:1-5 (demonstração)";
/** DEMO_TITLE as it reaches a download name (ASCII-folded by safeFilename). */
export const DEMO_TITLE_FILE = "Rute_1-1-5_\\(demonstracao\\)";
/** Labels come from fixtures/ruth-1-1-5/v{1,2}/meta.json. */
export const V1 = "v1 rascunho";
export const V2 = "v2 revisão (3 mudanças)";
export const MOCK_BADGE = "Fita simulada";

export const FIXTURES_DIR = fileURLToPath(new URL("../fixtures/ruth-1-1-5", import.meta.url));

/** A full sha256 in hex — must never be part of the visible text outside technical details. */
export const HEX64 = /[0-9a-f]{64}/i;

// ---------------------------------------------------------------------------
// navigation

export async function gotoPassages(page: Page): Promise<void> {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1, name: "Passagens" })).toBeVisible();
}

/** Load the demo passage from the passage list and wait for both versions. */
export async function loadDemo(page: Page): Promise<void> {
  await gotoPassages(page);
  await page.getByRole("button", { name: "Carregar passagem de demonstração" }).click();
  await expect(page.getByRole("status").filter({ hasText: "Passagem de demonstração carregada com duas versões." })).toBeVisible({
    timeout: 30_000,
  });
  await expect(passageCard(page)).toBeVisible();
  await expect(versionItem(page, V1)).toBeVisible();
  await expect(versionItem(page, V2)).toBeVisible();
}

export function passageCard(page: Page, title: string = DEMO_TITLE): Locator {
  return page.getByRole("article", { name: title, exact: true });
}

/** The <li> of one version in the passage list (aria-label "Versão {label}"). */
export function versionItem(page: Page, label: string): Locator {
  return page.getByRole("listitem", { name: `Versão ${label}`, exact: true });
}

/** Open Listen for one version and wait until the audio is decoded. */
export async function openListen(page: Page, label: string): Promise<void> {
  await versionItem(page, label).getByRole("button", { name: "Ouvir", exact: true }).click();
  await expect(page).toHaveURL(/#\/listen\//);
  // "Toda a gravação" replaces "Preparando o áudio…" once the audio is decoded.
  await expect(page.getByText("Toda a gravação", { exact: true })).toBeVisible({ timeout: 30_000 });
}

/** From the passage list, compare the versions currently picked as A and B. */
export async function compareFromList(page: Page): Promise<void> {
  await page.getByRole("button", { name: "Comparar A e B", exact: true }).click();
  await expect(page).toHaveURL(/#\/compare\//);
}

/** Back to the passage list through the app's own link. */
export async function backToPassages(page: Page): Promise<void> {
  await page.getByRole("link", { name: "Passagens" }).first().click();
  await expect(page.getByRole("heading", { level: 1, name: "Passagens" })).toBeVisible();
}

// ---------------------------------------------------------------------------
// bead strips

/** The SVG bead strip by its aria-label (e.g. "Contas da versão v1 rascunho"). */
export function strip(page: Page, ariaLabel: string): Locator {
  return page.getByRole("group", { name: ariaLabel, exact: true });
}

/** One bead, addressed by its time label ("0:02,3" — pt-BR tenths): the only name a bead has. */
export function bead(stripLoc: Locator, time: string): Locator {
  return stripLoc.getByRole("button", { name: time, exact: true });
}

/** Drag across beads from one time label to another; the app snaps to cluster bounds. */
export async function dragBeads(page: Page, stripLoc: Locator, fromTime: string, toTime: string): Promise<void> {
  const from = await bead(stripLoc, fromTime).boundingBox();
  const to = await bead(stripLoc, toTime).boundingBox();
  if (!from || !to) throw new Error(`beads ${fromTime} / ${toTime} are not laid out`);
  const y = from.y + from.height / 2;
  await page.mouse.move(from.x + from.width / 2, y);
  await page.mouse.down();
  await page.mouse.move((from.x + to.x) / 2, y, { steps: 4 });
  await page.mouse.move(to.x + to.width / 2, y, { steps: 6 });
  await page.mouse.up();
}

// ---------------------------------------------------------------------------
// comments

export type Kind = "note" | "fix_requested" | "approved";

const KIND_LABEL: Record<Kind, string> = {
  note: "Observação",
  fix_requested: "Correção solicitada",
  approved: "Aprovado",
};

/**
 * With a span selected on Listen: press "c", type the text, pick the kind,
 * save, and wait for the comment to be listed.
 */
export async function addComment(page: Page, opts: { text: string; kind?: Kind }): Promise<void> {
  await page.keyboard.press("c");
  const editor = page.locator("form.comment-editor");
  await expect(editor).toBeVisible();
  await editor.getByRole("textbox", { name: "Comentário", exact: true }).fill(opts.text);
  await editor.getByRole("radio", { name: KIND_LABEL[opts.kind ?? "note"], exact: true }).check();
  await editor.getByRole("button", { name: "Salvar", exact: true }).click();
  await expect(editor).toBeHidden();
  await expect(page.locator(".comment-list .comment__text").filter({ hasText: opts.text })).toBeVisible();
}

// ---------------------------------------------------------------------------
// downloads and zips

export async function readDownload(download: Download): Promise<string> {
  const p = await download.path();
  if (!p) throw new Error(`download ${download.suggestedFilename()} has no path`);
  return fs.readFileSync(p, "utf8");
}

export async function readDownloadBytes(download: Download): Promise<Buffer> {
  const p = await download.path();
  if (!p) throw new Error(`download ${download.suggestedFilename()} has no path`);
  return fs.readFileSync(p);
}

/**
 * A Recording zip built from fixtures/ruth-1-1-5/v1 (audio.wav, tape.json,
 * meta.json under one folder), optionally with another codebook hash and label.
 */
export function buildRecordingZip(opts: { codebookHash?: string; label?: string; omitTape?: boolean } = {}): Buffer {
  const dir = path.join(FIXTURES_DIR, "v1");
  const tape = JSON.parse(fs.readFileSync(path.join(dir, "tape.json"), "utf8")) as Record<string, unknown>;
  const meta = JSON.parse(fs.readFileSync(path.join(dir, "meta.json"), "utf8")) as Record<string, unknown>;
  if (opts.codebookHash !== undefined) tape.codebook_hash = opts.codebookHash;
  if (opts.label !== undefined) meta.label = opts.label;
  const files: Record<string, Uint8Array> = {
    "recording/audio.wav": new Uint8Array(fs.readFileSync(path.join(dir, "audio.wav"))),
    "recording/meta.json": strToU8(JSON.stringify(meta)),
  };
  if (!opts.omitTape) files["recording/tape.json"] = strToU8(JSON.stringify(tape));
  const zipped = zipSync(files, { level: 1 });
  return Buffer.from(zipped.buffer, zipped.byteOffset, zipped.byteLength);
}

// ---------------------------------------------------------------------------
// the numbers policy

/** innerText of the routed screen (excludes header, footer and the settings dialog). */
export function mainText(page: Page): Promise<string> {
  return page.locator("main").innerText();
}

/** Every technical-details block on the page, all expected closed by default. */
export async function expectTechnicalDetailsClosed(page: Page): Promise<void> {
  const details = page.locator("details.tech");
  const n = await details.count();
  expect(n).toBeGreaterThan(0);
  for (let i = 0; i < n; i++) await expect(details.nth(i)).toHaveJSProperty("open", false);
}

/** No codebook / sha256 words and no full hash in the visible text. */
export function expectNoTapeNumbers(text: string): void {
  expect(text).not.toMatch(/codebook/i);
  expect(text).not.toMatch(/sha256/i);
  expect(text).not.toMatch(HEX64);
}
