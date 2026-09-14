import type { StringModule } from "../index";

/**
 * Strings shared by every screen: app title, navigation, buttons, comment
 * kinds and statuses, region kinds, verdicts, carry outcomes, the mock
 * badge, technical details, settings labels, the codebook-mismatch message
 * and generic states.
 *
 * Keys are `common.section.item`. Both languages must define the same keys;
 * tests/i18n.test.ts fails when they drift apart.
 */
export const common = {
  "pt-BR": {
    "common.app.title": "Bead Compare",
    "common.app.subtitle": "Checagem de consultor para tradução oral da Bíblia",

    "common.nav.passages": "Passagens",
    "common.nav.listen": "Ouvir",
    "common.nav.compare": "Comparar",
    "common.nav.report": "Relatório",
    "common.nav.back": "Voltar",
    "common.nav.settings": "Configurações",

    "common.button.play": "Tocar",
    "common.button.pause": "Pausar",
    "common.button.stop": "Parar",
    "common.button.loop": "Repetir",
    "common.button.save": "Salvar",
    "common.button.cancel": "Cancelar",
    "common.button.delete": "Excluir",
    "common.button.export": "Exportar",
    "common.button.import": "Importar",
    "common.button.close": "Fechar",
    "common.button.confirm": "Confirmar",

    "common.kind.note": "Observação",
    "common.kind.fix_requested": "Correção solicitada",
    "common.kind.approved": "Aprovado",

    "common.status.open": "Em aberto",
    "common.status.resolved": "Resolvido",
    "common.status.carried": "Transferido",

    "common.region.substituted": "Substituído",
    "common.region.inserted": "Inserido",
    "common.region.deleted": "Removido",
    "common.region.melody": "Mesmos sons, outra melodia",

    "common.verdict.requested_fix_confirmed": "Correção solicitada confirmada",
    "common.verdict.unrequested_ok": "Mudança não solicitada, aceitável",
    "common.verdict.unrequested_problem": "Mudança não solicitada, com problema",
    "common.verdict.undecided": "Ainda sem decisão",

    "common.carry.changed_here": "Mudou aqui",
    "common.carry.no_change_detected": "Sem mudança detectada aqui",

    "common.mock.badge": "Fita simulada",
    "common.tech.summary": "Detalhes técnicos",

    "common.settings.title": "Configurações",
    "common.settings.description":
      "Como as contas são agrupadas e comparadas. Os valores padrão servem para a maioria das gravações.",
    "common.settings.grouping": "Agrupamento",
    "common.settings.alignment": "Comparação",
    "common.settings.min_cluster_frames": "Tamanho mínimo de grupo",
    "common.settings.min_cluster_frames.hint":
      "Grupos com menos contas do que isso são unidos ao vizinho da esquerda (ou ao da direita, quando o grupo abre a gravação ou vem logo depois de uma pausa).",
    "common.settings.match_score": "Pontuação de correspondência",
    "common.settings.match_score.hint": "Quanto vale cada grupo que soa igual nas duas versões.",
    "common.settings.mismatch_penalty": "Penalidade de divergência",
    "common.settings.mismatch_penalty.hint": "Quanto custa alinhar dois grupos que soam diferentes.",
    "common.settings.gap_penalty": "Penalidade de lacuna",
    "common.settings.gap_penalty.hint": "Quanto custa tratar um grupo como inserido ou removido.",
    "common.settings.merge_gap_frames": "Distância para unir regiões",
    "common.settings.merge_gap_frames.hint":
      "Mudanças separadas por menos contas iguais do que isso passam a ser uma única região.",
    "common.settings.melody_threshold": "Sensibilidade de melodia",
    "common.settings.melody_threshold.hint":
      "Acima desta diferença de altura, sons iguais contam como “outra melodia”.",
    "common.settings.reset": "Restaurar padrões",
    "common.settings.language": "Idioma",
    "common.settings.clear_all": "Apagar todos os dados locais",
    "common.settings.clear_all.hint": "Remove todas as passagens, versões e comentários salvos neste navegador.",
    "common.settings.clear_all.confirm":
      "Apagar todas as passagens, versões e comentários deste navegador? Isso não pode ser desfeito.",
    "common.settings.clear_all.done": "Todos os dados locais foram apagados.",

    "common.error.codebook_mismatch":
      "Estas duas gravações usam códigos de som diferentes e não podem ser comparadas.",
    "common.error.frame_rate_mismatch":
      "Estas duas gravações usam taxas de quadros diferentes e não podem ser comparadas.",
    "common.error.too_large":
      "Estas duas gravações têm grupos demais para serem comparadas com as configurações atuais. Aumente o tamanho mínimo de grupo em Configurações.",
    "common.error.generic": "Algo deu errado.",
    "common.error.with_detail": "Algo deu errado: {message}",
    "common.error.not_found": "Não encontrado.",
    "common.error.screen_failed": "Esta tela encontrou um problema e não pôde ser exibida.",
    "common.error.screen_failed.hint":
      "Se o problema continuar, restaure as configurações padrão; as passagens e os comentários não são apagados.",
    "common.error.screen_failed.reset": "Restaurar padrões e tentar de novo",
    "common.error.screen_failed.retry": "Tentar de novo",
    "common.error.screen_failed.home": "Voltar às passagens",

    "common.state.loading": "Carregando…",
    "common.state.working": "Um momento…",
    "common.state.empty": "Nada por aqui ainda.",
    "common.state.coming_soon": "Esta tela ainda está em construção.",

    "common.footer.original_only":
      "Este aplicativo toca apenas as gravações originais. Nenhum som é sintetizado.",

    "common.author.label": "Autor(a)",

    "common.lang.pt": "PT",
    "common.lang.en": "EN",
    "common.lang.pt_name": "Português (Brasil)",
    "common.lang.en_name": "Inglês",
  },
  en: {
    "common.app.title": "Bead Compare",
    "common.app.subtitle": "Consultant checking for Oral Bible Translation",

    "common.nav.passages": "Passages",
    "common.nav.listen": "Listen",
    "common.nav.compare": "Compare",
    "common.nav.report": "Report",
    "common.nav.back": "Back",
    "common.nav.settings": "Settings",

    "common.button.play": "Play",
    "common.button.pause": "Pause",
    "common.button.stop": "Stop",
    "common.button.loop": "Loop",
    "common.button.save": "Save",
    "common.button.cancel": "Cancel",
    "common.button.delete": "Delete",
    "common.button.export": "Export",
    "common.button.import": "Import",
    "common.button.close": "Close",
    "common.button.confirm": "Confirm",

    "common.kind.note": "Note",
    "common.kind.fix_requested": "Fix requested",
    "common.kind.approved": "Approved",

    "common.status.open": "Open",
    "common.status.resolved": "Resolved",
    "common.status.carried": "Carried forward",

    "common.region.substituted": "Substituted",
    "common.region.inserted": "Inserted",
    "common.region.deleted": "Deleted",
    "common.region.melody": "Same sounds, different melody",

    "common.verdict.requested_fix_confirmed": "Requested fix confirmed",
    "common.verdict.unrequested_ok": "Unrequested change, acceptable",
    "common.verdict.unrequested_problem": "Unrequested change, problematic",
    "common.verdict.undecided": "Not decided yet",

    "common.carry.changed_here": "Changed here",
    "common.carry.no_change_detected": "No change detected here",

    "common.mock.badge": "Mock tape",
    "common.tech.summary": "Technical details",

    "common.settings.title": "Settings",
    "common.settings.description":
      "How beads are grouped and compared. The default values suit most recordings.",
    "common.settings.grouping": "Grouping",
    "common.settings.alignment": "Comparison",
    "common.settings.min_cluster_frames": "Minimum group size",
    "common.settings.min_cluster_frames.hint":
      "Groups with fewer beads than this are merged into their left neighbor (or the right one, when the group opens the recording or follows a pause).",
    "common.settings.match_score": "Match score",
    "common.settings.match_score.hint": "How much each group that sounds the same in both versions is worth.",
    "common.settings.mismatch_penalty": "Mismatch penalty",
    "common.settings.mismatch_penalty.hint": "The cost of lining up two groups that sound different.",
    "common.settings.gap_penalty": "Gap penalty",
    "common.settings.gap_penalty.hint": "The cost of treating a group as inserted or deleted.",
    "common.settings.merge_gap_frames": "Distance for merging regions",
    "common.settings.merge_gap_frames.hint":
      "Changes separated by fewer matching beads than this become a single region.",
    "common.settings.melody_threshold": "Melody sensitivity",
    "common.settings.melody_threshold.hint":
      "Above this pitch difference, the same sounds count as “different melody”.",
    "common.settings.reset": "Reset to defaults",
    "common.settings.language": "Language",
    "common.settings.clear_all": "Clear all local data",
    "common.settings.clear_all.hint": "Removes every passage, version and comment stored in this browser.",
    "common.settings.clear_all.confirm":
      "Delete every passage, version and comment from this browser? This cannot be undone.",
    "common.settings.clear_all.done": "All local data has been cleared.",

    "common.error.codebook_mismatch":
      "These two recordings use different sound codebooks and cannot be compared.",
    "common.error.frame_rate_mismatch": "These two recordings use different frame rates and cannot be compared.",
    "common.error.too_large":
      "These two recordings have too many groups to be compared with the current settings. Raise the minimum group size in the settings.",
    "common.error.generic": "Something went wrong.",
    "common.error.with_detail": "Something went wrong: {message}",
    "common.error.not_found": "Not found.",
    "common.error.screen_failed": "This screen ran into a problem and could not be shown.",
    "common.error.screen_failed.hint": "If it keeps happening, reset the settings to their defaults; passages and comments are not deleted.",
    "common.error.screen_failed.reset": "Reset to defaults and try again",
    "common.error.screen_failed.retry": "Try again",
    "common.error.screen_failed.home": "Back to passages",

    "common.state.loading": "Loading…",
    "common.state.working": "One moment…",
    "common.state.empty": "Nothing here yet.",
    "common.state.coming_soon": "This screen is still being built.",

    "common.footer.original_only": "This app plays the original recordings only. No sound is ever synthesized.",

    "common.author.label": "Author",

    "common.lang.pt": "PT",
    "common.lang.en": "EN",
    "common.lang.pt_name": "Portuguese (Brazil)",
    "common.lang.en_name": "English",
  },
} satisfies StringModule;
