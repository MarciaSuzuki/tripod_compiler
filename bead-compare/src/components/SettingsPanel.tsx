import { useEffect, useId, useRef, useState, type ChangeEvent } from "react";
import type { AlignmentSettings, GroupingSettings, Settings } from "../model";
import { AudioEngine } from "../audio/engine";
import { repo } from "../db/repo";
import { LANGS, isLang, useI18n, type Lang } from "../i18n";
import { navigate } from "../router";
import { useSettings } from "../settings";

/**
 * Settings panel: a fixed side panel (dialog role) editing every field of
 * Settings with number inputs, one short explanation per field, a reset
 * button, a language selector and a "clear all local data" button.
 *
 * The settings values are parameters (sizes in beads, scores), not tape
 * numbers, so they may be shown here.
 */

/** Fired on window after repo.clearAll() so open screens can refresh. */
export const DATA_CLEARED_EVENT = "bead-compare:data-cleared";

type Field =
  | { group: "grouping"; name: keyof GroupingSettings; min: number; step: number; integer: boolean }
  | { group: "alignment"; name: keyof AlignmentSettings; min: number; step: number; integer: boolean };

const FIELDS: readonly Field[] = [
  { group: "grouping", name: "min_cluster_frames", min: 1, step: 1, integer: true },
  { group: "alignment", name: "match_score", min: 0, step: 0.5, integer: false },
  { group: "alignment", name: "mismatch_penalty", min: 0, step: 0.5, integer: false },
  { group: "alignment", name: "gap_penalty", min: 0, step: 0.5, integer: false },
  { group: "alignment", name: "merge_gap_frames", min: 0, step: 1, integer: true },
  { group: "alignment", name: "melody_threshold", min: 0, step: 0.5, integer: false },
];

const GROUPS: ReadonlyArray<Field["group"]> = ["grouping", "alignment"];

function fieldId(f: Field): string {
  return `${f.group}.${f.name}`;
}

function getField(s: Settings, f: Field): number {
  return f.group === "grouping" ? s.grouping[f.name] : s.alignment[f.name];
}

function setField(s: Settings, f: Field, value: number): Settings {
  if (f.group === "grouping") return { ...s, grouping: { ...s.grouping, [f.name]: value } };
  return { ...s, alignment: { ...s.alignment, [f.name]: value } };
}

/** The number a draft string stands for, or null when it is not an acceptable value for the field. */
export function parseFieldValue(f: Pick<Field, "min" | "integer">, draft: string): number | null {
  const trimmed = draft.trim().replace(",", ".");
  if (trimmed === "") return null;
  const n = Number(trimmed);
  if (!Number.isFinite(n) || n < f.min) return null;
  if (f.integer && !Number.isInteger(n)) return null;
  return n;
}

function draftsFrom(s: Settings): Record<string, string> {
  const out: Record<string, string> = {};
  for (const f of FIELDS) out[fieldId(f)] = String(getField(s, f));
  return out;
}

export function SettingsPanel(props: { open: boolean; onClose(): void }): JSX.Element {
  const { open, onClose } = props;
  const { t, lang, setLang } = useI18n();
  const { settings, update, reset } = useSettings();
  const [drafts, setDrafts] = useState<Record<string, string>>(() => draftsFrom(settings));
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();

  // Sync drafts when the panel opens or the settings change underneath
  // (reset). A draft that already means the stored value is left alone so a
  // half-typed "3." is not clobbered.
  useEffect(() => {
    if (!open) return;
    setDrafts((d) => {
      const next = { ...d };
      for (const f of FIELDS) {
        const id = fieldId(f);
        const stored = getField(settings, f);
        if (parseFieldValue(f, d[id] ?? "") !== stored) next[id] = String(stored);
      }
      return next;
    });
  }, [open, settings]);

  // Escape closes; focus moves into the panel on open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    panelRef.current?.focus();
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return <></>;

  const onDraftChange = (f: Field) => (e: ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    setDrafts((d) => ({ ...d, [fieldId(f)]: text }));
    const value = parseFieldValue(f, text);
    if (value !== null && value !== getField(settings, f)) update(setField(settings, f, value));
  };

  const onDraftBlur = (f: Field) => () => {
    // An unusable draft snaps back to the stored value.
    if (parseFieldValue(f, drafts[fieldId(f)] ?? "") === null) {
      setDrafts((d) => ({ ...d, [fieldId(f)]: String(getField(settings, f)) }));
    }
  };

  const onLangChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const v = e.target.value;
    if (isLang(v)) setLang(v);
  };

  const onReset = () => {
    reset();
    setNotice(null);
  };

  const onClearAll = async () => {
    if (busy) return;
    if (!window.confirm(t("common.settings.clear_all.confirm"))) return;
    setBusy(true);
    try {
      await repo.clearAll();
      AudioEngine.get().unloadAll();
      window.dispatchEvent(new CustomEvent(DATA_CLEARED_EVENT));
      setNotice(t("common.settings.clear_all.done"));
      navigate({ name: "passages" });
    } catch (e) {
      setNotice(t("common.error.with_detail", { message: e instanceof Error ? e.message : String(e) }));
    } finally {
      setBusy(false);
    }
  };

  const langName: Record<Lang, string> = { "pt-BR": t("common.lang.pt_name"), en: t("common.lang.en_name") };

  return (
    <div className="settings-overlay">
      <div className="settings-backdrop" onClick={onClose} aria-hidden="true" />
      <div
        className="settings-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        ref={panelRef}
      >
        <div className="settings-panel__head">
          <h2 id={titleId} className="settings-panel__title">
            {t("common.settings.title")}
          </h2>
          <button type="button" className="btn btn--quiet" onClick={onClose}>
            {t("common.button.close")}
          </button>
        </div>
        <p className="muted">{t("common.settings.description")}</p>

        <section className="settings-panel__group">
          <label className="field">
            <span className="field__label">{t("common.settings.language")}</span>
            <select value={lang} onChange={onLangChange}>
              {LANGS.map((l) => (
                <option key={l} value={l}>
                  {langName[l]}
                </option>
              ))}
            </select>
          </label>
        </section>

        {GROUPS.map((group) => (
          <section key={group} className="settings-panel__group">
            <h3 className="settings-panel__group-title">{t(`common.settings.${group}`)}</h3>
            {FIELDS.filter((f) => f.group === group).map((f) => {
              const id = fieldId(f);
              const invalid = parseFieldValue(f, drafts[id] ?? "") === null;
              return (
                <label key={id} className={"field" + (invalid ? " field--invalid" : "")}>
                  <span className="field__label">{t(`common.settings.${f.name}`)}</span>
                  <input
                    type="number"
                    inputMode="decimal"
                    min={f.min}
                    step={f.step}
                    value={drafts[id] ?? ""}
                    aria-invalid={invalid || undefined}
                    onChange={onDraftChange(f)}
                    onBlur={onDraftBlur(f)}
                  />
                  <span className="field__hint">{t(`common.settings.${f.name}.hint`)}</span>
                </label>
              );
            })}
          </section>
        ))}

        <div className="row settings-panel__actions">
          <button type="button" className="btn" onClick={onReset}>
            {t("common.settings.reset")}
          </button>
        </div>

        <section className="settings-panel__group settings-panel__danger">
          <button type="button" className="btn btn--danger" onClick={onClearAll} disabled={busy}>
            {t("common.settings.clear_all")}
          </button>
          <p className="field__hint">{t("common.settings.clear_all.hint")}</p>
          {notice && (
            <p className="notice" role="status">
              {notice}
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
