import type { StringModule } from "../index";

/**
 * Report screen strings (#/report/:aId/:bId) and the Markdown export.
 * Keys are `report.section.item`.
 *
 * Sections: header (title line, version line, links), facts (the two
 * versions and their hashes), summary (the three numbers), regions (the
 * regions table), carried (the carried fix requests table), actions (the
 * two downloads), footer (generated-at and the settings used), state
 * (loading / not found / failed).
 *
 * Region kinds, verdicts, carry outcomes, comment kinds, the mock badge, the
 * technical-details summary, the settings labels and the codebook-mismatch
 * message come from common.ts and are not redefined here.
 */
export const report = {
  "pt-BR": {
    "report.header.title": "Relatório",
    "report.header.intro":
      "Comparação entre duas versões gravadas da mesma passagem: A (anterior) e B (mais recente).",
    "report.header.a_label": "A: {label}",
    "report.header.b_label": "B: {label}",
    "report.header.a_hint": "anterior",
    "report.header.b_hint": "mais recente",
    "report.header.compare": "Voltar à comparação",
    "report.header.passages": "Passagens",
    "report.header.untitled": "Passagem sem título",

    "report.facts.title": "Versões",
    "report.facts.version_a": "A (anterior)",
    "report.facts.version_b": "B (mais recente)",
    "report.facts.narrator": "Narrador(a)",
    "report.facts.recorded_at": "Gravada em",
    "report.facts.language": "Idioma",
    "report.facts.mock": "Fita simulada — não é uma gravação real.",
    "report.facts.hashes": "Identificação dos arquivos",
    "report.facts.version": "Versão",
    "report.facts.hash": "Hash",
    "report.facts.short": "Curto",
    "report.facts.full": "Completo",
    "report.facts.tape_hash": "Hash da fita (JSON canônico)",
    "report.facts.audio_hash": "Hash do áudio",
    "report.facts.codebook": "Codebook",
    "report.facts.shared": "A e B",
    "report.facts.none": "—",

    "report.summary.title": "Resumo",
    "report.summary.regions": "Regiões",
    "report.summary.changed_seconds": "Segundos alterados",
    "report.summary.stability": "Estabilidade",
    "report.summary.seconds": "{value} s",
    "report.summary.no_regions": "Nenhuma diferença encontrada entre A e B.",

    "report.regions.title": "Regiões",
    "report.regions.intro": "Cada região é um trecho em que B difere de A.",
    "report.regions.col_index": "#",
    "report.regions.col_kind": "Tipo",
    "report.regions.col_a": "Em A",
    "report.regions.col_b": "Em B",
    "report.regions.col_verdict": "Decisão",
    "report.regions.point": "em {time}",
    "report.regions.edit": "Alterar decisões na comparação",

    "report.carried.title": "Correções solicitadas em A",
    "report.carried.intro": "Cada correção solicitada em A foi transferida ao ponto correspondente em B.",
    "report.carried.empty": "Nenhuma correção solicitada em aberto em A.",
    "report.carried.col_author": "Autor(a)",
    "report.carried.col_kind": "Tipo",
    "report.carried.col_text": "Comentário",
    "report.carried.col_audio": "Áudio",
    "report.carried.col_a": "Em A",
    "report.carried.col_b": "Em B",
    "report.carried.col_outcome": "Resultado",
    "report.carried.audio_yes": "sim",
    "report.carried.audio_no": "não",
    "report.carried.warning":
      "Em pelo menos um ponto não foi detectada mudança. A equipe pode ter deixado passar a correção solicitada.",

    "report.actions.download_md": "Baixar Markdown",
    "report.actions.download_json": "Baixar JSON",
    "report.actions.hint": "Os arquivos baixados trazem os hashes completos, para identificar as gravações.",

    "report.footer.title": "Sobre este relatório",
    "report.footer.generated_at": "Gerado em {date}",
    "report.footer.generated_by": "Gerado por {app} (formato {version})",
    "report.footer.settings": "Parâmetros usados",
    "report.footer.format_version": "Versão do formato",

    "report.state.loading": "Preparando o relatório…",
    "report.state.not_found": "Versão não encontrada. Ela pode ter sido excluída.",
    "report.state.load_failed": "Não foi possível preparar o relatório: {message}",
  },
  en: {
    "report.header.title": "Report",
    "report.header.intro": "Comparison of two recorded versions of the same passage: A (earlier) and B (later).",
    "report.header.a_label": "A: {label}",
    "report.header.b_label": "B: {label}",
    "report.header.a_hint": "earlier",
    "report.header.b_hint": "later",
    "report.header.compare": "Back to the comparison",
    "report.header.passages": "Passages",
    "report.header.untitled": "Untitled passage",

    "report.facts.title": "Versions",
    "report.facts.version_a": "A (earlier)",
    "report.facts.version_b": "B (later)",
    "report.facts.narrator": "Narrator",
    "report.facts.recorded_at": "Recorded",
    "report.facts.language": "Language",
    "report.facts.mock": "Mock tape — not a real recording.",
    "report.facts.hashes": "File identification",
    "report.facts.version": "Version",
    "report.facts.hash": "Hash",
    "report.facts.short": "Short",
    "report.facts.full": "Full",
    "report.facts.tape_hash": "Tape hash (canonical JSON)",
    "report.facts.audio_hash": "Audio hash",
    "report.facts.codebook": "Codebook",
    "report.facts.shared": "A and B",
    "report.facts.none": "—",

    "report.summary.title": "Summary",
    "report.summary.regions": "Regions",
    "report.summary.changed_seconds": "Seconds changed",
    "report.summary.stability": "Stability",
    "report.summary.seconds": "{value} s",
    "report.summary.no_regions": "No differences found between A and B.",

    "report.regions.title": "Regions",
    "report.regions.intro": "Each region is a stretch where B differs from A.",
    "report.regions.col_index": "#",
    "report.regions.col_kind": "Kind",
    "report.regions.col_a": "In A",
    "report.regions.col_b": "In B",
    "report.regions.col_verdict": "Verdict",
    "report.regions.point": "at {time}",
    "report.regions.edit": "Change verdicts in the comparison",

    "report.carried.title": "Fixes requested on A",
    "report.carried.intro": "Each fix requested on A was carried to the matching spot on B.",
    "report.carried.empty": "No open fix requests on A.",
    "report.carried.col_author": "Author",
    "report.carried.col_kind": "Kind",
    "report.carried.col_text": "Comment",
    "report.carried.col_audio": "Audio",
    "report.carried.col_a": "In A",
    "report.carried.col_b": "In B",
    "report.carried.col_outcome": "Outcome",
    "report.carried.audio_yes": "yes",
    "report.carried.audio_no": "no",
    "report.carried.warning":
      "At one or more spots no change was detected. The team may have missed the requested fix.",

    "report.actions.download_md": "Download Markdown",
    "report.actions.download_json": "Download JSON",
    "report.actions.hint": "The downloaded files carry the full hashes, to identify the recordings.",

    "report.footer.title": "About this report",
    "report.footer.generated_at": "Generated {date}",
    "report.footer.generated_by": "Generated by {app} (format {version})",
    "report.footer.settings": "Settings used",
    "report.footer.format_version": "Format version",

    "report.state.loading": "Preparing the report…",
    "report.state.not_found": "Version not found. It may have been deleted.",
    "report.state.load_failed": "The report could not be prepared: {message}",
  },
} satisfies StringModule;
