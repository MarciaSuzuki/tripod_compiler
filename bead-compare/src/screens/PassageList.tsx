import { useCallback, useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { MockBadge } from "../components/MockBadge";
import { DATA_CLEARED_EVENT } from "../components/SettingsPanel";
import { TechnicalDetails } from "../components/TechnicalDetails";
import { parseRecordingFiles, type ParsedRecording } from "../db/recording";
import { repo } from "../db/repo";
import { downloadBlob, safeFilename } from "../export/download";
import { useI18n, type Lang, type T } from "../i18n";
import type { Meta, Passage, Version } from "../model";
import { parseTape, shortHash } from "../model";
import { navigate } from "../router";

/**
 * Passage list (#/): create passages, load the demo passage, import
 * recordings as versions (folder or zip), pick A/B and open Compare, open
 * Listen, export/import/delete passages.
 *
 * Hashes and frame counts appear only inside <TechnicalDetails>.
 */

interface PassageItem {
  passage: Passage;
  versions: Version[];
}

const DEMO_DIR = "ruth-1-1-5";
const DEMO_VERSIONS = ["v1", "v2"] as const;
const META_FIELDS: ReadonlyArray<keyof Meta> = ["passage", "language", "narrator", "recorded_at", "label"];

function errorMessage(e: unknown): string {
  return e instanceof Error ? e.message : String(e);
}

/** A fixture URL relative to Vite's base ("./" in production builds, "/" in dev). */
export function demoUrl(path: string): string {
  const base = import.meta.env.BASE_URL || "./";
  return base.endsWith("/") ? base + path : `${base}/${path}`;
}

/** Keep only the known string fields of a meta.json object. */
function pickMeta(raw: unknown): Meta {
  const meta: Meta = {};
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return meta;
  const r = raw as Record<string, unknown>;
  for (const k of META_FIELDS) {
    const v = r[k];
    if (typeof v === "string" && v.trim().length > 0) meta[k] = v;
  }
  return meta;
}

function isWav(bytes: ArrayBuffer): boolean {
  if (bytes.byteLength < 12) return false;
  const b = new Uint8Array(bytes, 0, 12);
  const tag = (from: number) => String.fromCharCode(b[from], b[from + 1], b[from + 2], b[from + 3]);
  return tag(0) === "RIFF" && tag(8) === "WAVE";
}

async function fetchOk(url: string): Promise<Response> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return res;
}

/** Fetch one demo version from the served fixtures and shape it like a folder import. */
async function fetchDemoRecording(version: string, t: T): Promise<ParsedRecording> {
  const dir = `${DEMO_DIR}/${version}`;
  const audioFile = `${dir}/audio.wav`;
  const tapeFile = `${dir}/tape.json`;
  const metaFile = `${dir}/meta.json`;

  const [audioRes, tapeRes] = await Promise.all([fetchOk(demoUrl(audioFile)), fetchOk(demoUrl(tapeFile))]);
  const audioBytes = await audioRes.arrayBuffer();
  // The dev server answers unknown paths with index.html, so check the bytes.
  if (!isWav(audioBytes)) throw new Error(t("passages.demo.bad_audio", { file: audioFile }));
  const audio = new Blob([audioBytes], { type: "audio/wav" });

  const parsed = parseTape(await tapeRes.text());
  if (!parsed.tape) throw new Error(t("passages.demo.bad_tape", { file: tapeFile, message: parsed.errors.join("; ") }));

  const warnings: string[] = [];
  let meta: Meta = {};
  try {
    const metaRes = await fetch(demoUrl(metaFile));
    if (metaRes.ok) meta = pickMeta(JSON.parse(await metaRes.text()));
    else warnings.push("meta.json missing");
  } catch {
    warnings.push("meta.json missing");
  }

  return { audio, tape: parsed.tape, meta, warnings };
}

export function formatDate(iso: string, lang: Lang): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  try {
    return new Intl.DateTimeFormat(lang, { dateStyle: "medium", timeStyle: "short" }).format(d);
  } catch {
    return d.toLocaleString();
  }
}

/** A file input that opens a folder picker (webkitdirectory is not in React's typings). */
function FolderInput(props: { onFiles(files: File[]): void; disabled?: boolean; inputRef: React.RefObject<HTMLInputElement> }): JSX.Element {
  const { inputRef } = props;
  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.setAttribute("webkitdirectory", "");
    el.setAttribute("directory", "");
  }, [inputRef]);
  return (
    <input
      ref={inputRef}
      type="file"
      multiple
      hidden
      disabled={props.disabled}
      onChange={(e) => {
        const files = Array.from(e.target.files ?? []);
        e.target.value = "";
        if (files.length > 0) props.onFiles(files);
      }}
    />
  );
}

// ---------------------------------------------------------------------------

export function PassageList(): JSX.Element {
  const { t, lang } = useI18n();
  const [items, setItems] = useState<PassageItem[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const zipInput = useRef<HTMLInputElement>(null);

  const reload = useCallback(async () => {
    try {
      const passages = await repo.listPassages();
      const loaded = await Promise.all(
        passages.map(async (passage) => ({ passage, versions: await repo.listVersions(passage.id) })),
      );
      setItems(loaded);
      setLoadError(null);
    } catch (e) {
      setLoadError(errorMessage(e));
      setItems([]);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  useEffect(() => {
    const onCleared = () => void reload();
    window.addEventListener(DATA_CLEARED_EVENT, onCleared);
    return () => window.removeEventListener(DATA_CLEARED_EVENT, onCleared);
  }, [reload]);

  const run = async (label: string | null, fn: () => Promise<string | null>) => {
    if (busy) return;
    setError(null);
    setNotice(null);
    setBusy(label ?? t("common.state.working"));
    try {
      const done = await fn();
      if (done) setNotice(done);
    } catch (e) {
      setError(t("common.error.with_detail", { message: errorMessage(e) }));
    } finally {
      setBusy(null);
      await reload();
    }
  };

  const onCreate = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;
    void run(null, async () => {
      await repo.createPassage(trimmed);
      setTitle("");
      return null;
    });
  };

  const onLoadDemo = () => {
    void run(t("passages.demo.loading"), async () => {
      let recordings: ParsedRecording[];
      try {
        recordings = await Promise.all(DEMO_VERSIONS.map((v) => fetchDemoRecording(v, t)));
      } catch (e) {
        throw new Error(t("passages.demo.failed", { message: errorMessage(e) }));
      }
      const passage = await repo.createPassage(t("passages.demo.passage_title"));
      for (const rec of recordings) await repo.addVersion(passage.id, rec);
      return t("passages.demo.done");
    });
  };

  const onImportPassage = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    void run(null, async () => {
      try {
        const passage = await repo.importPassage(file);
        return t("passages.passage.imported", { title: passage.title });
      } catch (err) {
        throw new Error(t("passages.passage.import_failed", { message: errorMessage(err) }));
      }
    });
  };

  const onExport = (passage: Passage) => {
    void run(null, async () => {
      try {
        const blob = await repo.exportPassage(passage.id);
        downloadBlob(`${safeFilename(passage.title)}.zip`, blob);
        return null;
      } catch (err) {
        throw new Error(t("passages.passage.export_failed", { message: errorMessage(err) }));
      }
    });
  };

  const onDelete = (passage: Passage) => {
    if (!window.confirm(t("passages.passage.delete_confirm", { title: passage.title }))) return;
    void run(null, async () => {
      await repo.deletePassage(passage.id);
      return t("passages.passage.deleted", { title: passage.title });
    });
  };

  return (
    <section className="screen passages">
      <div className="screen__head">
        <div>
          <h1 className="screen__title">{t("passages.title")}</h1>
          <p className="muted">{t("passages.intro")}</p>
        </div>
      </div>

      <div className="card stack">
        <form className="row" onSubmit={onCreate}>
          <label className="field field--grow">
            <span className="field__label">{t("passages.create.label")}</span>
            <input
              type="text"
              value={title}
              placeholder={t("passages.create.placeholder")}
              onChange={(e) => setTitle(e.target.value)}
              disabled={busy !== null}
            />
          </label>
          <button type="submit" className="btn btn--primary" disabled={busy !== null || title.trim() === ""}>
            {t("passages.create.button")}
          </button>
        </form>
        <div className="row toolbar">
          <button type="button" className="btn" onClick={onLoadDemo} disabled={busy !== null}>
            {t("passages.demo.button")}
          </button>
          <button type="button" className="btn" onClick={() => zipInput.current?.click()} disabled={busy !== null}>
            {t("passages.passage.import")}
          </button>
          <input ref={zipInput} type="file" accept=".zip,application/zip" hidden onChange={onImportPassage} />
        </div>
        {busy && (
          <p className="muted" role="status">
            {busy}
          </p>
        )}
        {notice && (
          <p className="notice" role="status">
            {notice}
          </p>
        )}
        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}
        {loadError && (
          <p className="error" role="alert">
            {t("common.error.with_detail", { message: loadError })}
          </p>
        )}
      </div>

      {items === null ? (
        <p className="muted">{t("common.state.loading")}</p>
      ) : items.length === 0 ? (
        <p className="empty">{t("passages.empty")}</p>
      ) : (
        <div className="stack">
          {items.map((item) => (
            <PassageCard
              key={item.passage.id}
              item={item}
              lang={lang}
              t={t}
              disabled={busy !== null}
              onChanged={reload}
              onExport={() => onExport(item.passage)}
              onDelete={() => onDelete(item.passage)}
            />
          ))}
        </div>
      )}
    </section>
  );
}

// ---------------------------------------------------------------------------

interface PassageCardProps {
  item: PassageItem;
  lang: Lang;
  t: T;
  disabled: boolean;
  onChanged(): Promise<void>;
  onExport(): void;
  onDelete(): void;
}

function PassageCard(props: PassageCardProps): JSX.Element {
  const { item, lang, t } = props;
  const { passage, versions } = item;
  const n = versions.length;

  // A must come before B in version order. Defaults: A = previous, B = latest.
  const [aIdx, setAIdx] = useState(n - 2);
  const [bIdx, setBIdx] = useState(n - 1);
  useEffect(() => {
    setAIdx(n - 2);
    setBIdx(n - 1);
  }, [n]);

  const [importing, setImporting] = useState(false);
  const [importErrors, setImportErrors] = useState<string[]>([]);
  const [importWarnings, setImportWarnings] = useState<string[]>([]);
  const [importNotice, setImportNotice] = useState<string | null>(null);
  const folderInput = useRef<HTMLInputElement>(null);
  const zipInput = useRef<HTMLInputElement>(null);

  const pickA = (i: number) => {
    setAIdx(i);
    if (i >= bIdx) setBIdx(i + 1);
  };
  const pickB = (j: number) => {
    setBIdx(j);
    if (j <= aIdx) setAIdx(j - 1);
  };
  const canCompare = n >= 2 && aIdx >= 0 && bIdx > aIdx && bIdx < n;

  const onCompare = () => {
    if (!canCompare) return;
    navigate({ name: "compare", aId: versions[aIdx].id, bId: versions[bIdx].id });
  };

  const onFiles = async (files: File[]) => {
    if (importing) return;
    setImporting(true);
    setImportErrors([]);
    setImportWarnings([]);
    setImportNotice(null);
    try {
      const result = await parseRecordingFiles(files);
      if (!result.recording) {
        setImportErrors(result.errors.length > 0 ? result.errors : [t("common.error.generic")]);
        return;
      }
      const version = await repo.addVersion(passage.id, result.recording);
      setImportWarnings(result.recording.warnings);
      setImportNotice(t("passages.version.imported", { label: version.label }));
      await props.onChanged();
    } catch (e) {
      setImportErrors([errorMessage(e)]);
    } finally {
      setImporting(false);
    }
  };

  const onZipChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (files.length > 0) void onFiles(files);
  };

  const busy = props.disabled || importing;

  return (
    <article className="card passage" aria-labelledby={`passage-${passage.id}`}>
      <div className="passage__head">
        <div>
          <h2 id={`passage-${passage.id}`} className="passage__title">
            {passage.title}
          </h2>
          <p className="muted small">
            {t("passages.passage.created_at")}: {formatDate(passage.created_at, lang)}
          </p>
        </div>
        <div className="row passage__actions">
          <button type="button" className="btn btn--quiet" onClick={props.onExport} disabled={busy}>
            {t("passages.passage.export")}
          </button>
          <button type="button" className="btn btn--quiet btn--danger" onClick={props.onDelete} disabled={busy}>
            {t("passages.passage.delete")}
          </button>
        </div>
      </div>

      {n === 0 ? (
        <p className="muted">{t("passages.passage.no_versions")}</p>
      ) : (
        <div className="version-list-wrap">
          <div className="version-list__head" aria-hidden="true">
            <span className="version__pick-head">{t("passages.compare.a")}</span>
            <span className="version__pick-head">{t("passages.compare.b")}</span>
            <span>{t("passages.passage.versions")}</span>
          </div>
          <ul className="version-list">
            {versions.map((v, i) => (
              <li key={v.id} className="version" aria-label={t("passages.version.aria", { label: v.label })}>
                <span className="version__pick">
                  <input
                    type="radio"
                    name={`a-${passage.id}`}
                    checked={aIdx === i}
                    disabled={n < 2 || i === n - 1}
                    onChange={() => pickA(i)}
                    aria-label={t("passages.compare.pick_a", { label: v.label })}
                  />
                </span>
                <span className="version__pick">
                  <input
                    type="radio"
                    name={`b-${passage.id}`}
                    checked={bIdx === i}
                    disabled={n < 2 || i === 0}
                    onChange={() => pickB(i)}
                    aria-label={t("passages.compare.pick_b", { label: v.label })}
                  />
                </span>
                <div className="version__body">
                  <div className="row version__head">
                    <span className="version__label">{v.label}</span>
                    <MockBadge tape={v.tape} label={t("common.mock.badge")} />
                  </div>
                  <dl className="version__meta">
                    {v.meta.recorded_at && (
                      <div className="version__meta-item">
                        <dt>{t("passages.version.recorded_at")}</dt>
                        <dd>{formatDate(v.meta.recorded_at, lang)}</dd>
                      </div>
                    )}
                    {v.meta.narrator && (
                      <div className="version__meta-item">
                        <dt>{t("passages.version.narrator")}</dt>
                        <dd>{v.meta.narrator}</dd>
                      </div>
                    )}
                    {v.meta.language && (
                      <div className="version__meta-item">
                        <dt>{t("passages.version.language")}</dt>
                        <dd>{v.meta.language}</dd>
                      </div>
                    )}
                  </dl>
                  <TechnicalDetails summary={t("common.tech.summary")}>
                    <dl className="tech__list">
                      <dt>{t("passages.tech.tape_hash")}</dt>
                      <dd>
                        <code>{shortHash(v.tape_sha256)}</code> <code className="tech__full">{v.tape_sha256}</code>
                      </dd>
                      <dt>{t("passages.tech.audio_hash")}</dt>
                      <dd>
                        <code>{shortHash(v.audio_sha256)}</code> <code className="tech__full">{v.audio_sha256}</code>
                      </dd>
                      <dt>{t("passages.tech.codebook")}</dt>
                      <dd>
                        <code>{shortHash(v.tape.codebook_hash)}</code>{" "}
                        <code className="tech__full">{v.tape.codebook_hash}</code>
                      </dd>
                      <dt>{t("passages.tech.frames")}</dt>
                      <dd>
                        <code>{v.tape.u.length}</code>
                      </dd>
                      <dt>{t("passages.tech.frame_rate")}</dt>
                      <dd>
                        <code>{v.tape.frame_rate}</code>
                      </dd>
                      <dt>{t("passages.version.imported_at")}</dt>
                      <dd>{formatDate(v.imported_at, lang)}</dd>
                      <dt>{t("passages.tech.id")}</dt>
                      <dd>
                        <code className="tech__full">{v.id}</code>
                      </dd>
                    </dl>
                  </TechnicalDetails>
                </div>
                <div className="version__actions">
                  <button
                    type="button"
                    className="btn"
                    onClick={() => navigate({ name: "listen", versionId: v.id })}
                    disabled={busy}
                  >
                    {t("passages.version.listen")}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="row passage__foot">
        <div className="row">
          <button type="button" className="btn" onClick={() => folderInput.current?.click()} disabled={busy}>
            {t("passages.version.import_folder")}
          </button>
          <button type="button" className="btn" onClick={() => zipInput.current?.click()} disabled={busy}>
            {t("passages.version.import_zip")}
          </button>
          <FolderInput inputRef={folderInput} onFiles={(files) => void onFiles(files)} disabled={busy} />
          <input ref={zipInput} type="file" accept=".zip,application/zip" hidden onChange={onZipChange} disabled={busy} />
        </div>
        <div className="row passage__compare">
          <span className="muted small">{n >= 2 ? t("passages.compare.hint") : t("passages.compare.need_two")}</span>
          <button type="button" className="btn btn--primary" onClick={onCompare} disabled={busy || !canCompare}>
            {t("passages.compare.button")}
          </button>
        </div>
      </div>
      <p className="field__hint">{t("passages.version.import_hint")}</p>

      {importing && (
        <p className="muted" role="status">
          {t("common.state.working")}
        </p>
      )}
      {importNotice && (
        <p className="notice" role="status">
          {importNotice}
        </p>
      )}
      {importErrors.length > 0 && (
        <div className="import-errors" role="alert">
          <p>{t("passages.version.import_errors")}</p>
          <ul>
            {importErrors.map((m, i) => (
              <li key={i}>{m}</li>
            ))}
          </ul>
        </div>
      )}
      {importWarnings.length > 0 && (
        <div className="import-warnings" role="status">
          <p>{t("passages.version.import_warnings")}</p>
          <ul>
            {importWarnings.map((m, i) => (
              <li key={i}>{m}</li>
            ))}
          </ul>
        </div>
      )}
    </article>
  );
}
