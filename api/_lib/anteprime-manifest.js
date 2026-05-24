// Manifest delle anteprime manuali (15 pp) ospitate su Google Drive
// dell'account brand `ripamstudiocraft@gmail.com`.
//
// Chiave: slug materia (vedi src/data/materie.js).
// Valore: fileId Drive del PDF anteprima — null finché l'anteprima non è
//         stata caricata (es. durante il redesign manuali in corso).
//
// Permission Drive richiesta: "anyone with link can view" con download
// abilitato. Il link consegnato all'utente è:
//   https://drive.google.com/file/d/<fileId>/view
// (viewer Drive con toolbar download — NON /preview che è iframe-only).
//
// Single source of truth: importato da api/newsletter/confirm.js per la
// consegna automatica post-doppio-opt-in, e consultato dalla skill
// `deliver-anteprima-manuale` per la consegna manuale (casi edge).
//
// Per aggiornare i fileId dopo l'upload batch: sostituire null con la
// stringa fileId restituita da Drive (es. '1abc...xyz', 33 caratteri).

export const ANTEPRIME_MANIFEST = {
  'anticorruzione-trasparenza':  null,
  'cad':                         null,
  'contabilita-pubblica':        null,
  'contratti-pubblici':          null,
  'diritto-amministrativo':      null,
  'diritto-civile':              null,
  'diritto-costituzionale':      null,
  'diritto-penale-pa':           null,
  'diritto-processuale-civile':  null,
  'diritto-ue':                  null,
  'gdpr':                        null,
  'informatica':                 null,
  'logica':                      null,
  'ordinamento-pa':              null,
  'patrimonio-culturale':        null,
  'pubblico-impiego':            null,
  'sicurezza-lavoro':            null,
}

// Lista degli slug ammessi (usata da subscribe.js per validare il body).
export const ANTEPRIME_SLUGS = new Set(Object.keys(ANTEPRIME_MANIFEST))

// Restituisce il link Drive viewer per uno slug, o null se l'anteprima
// non è ancora disponibile (fileId placeholder).
export function getAnteprimaDriveUrl(slug) {
  const fileId = ANTEPRIME_MANIFEST[slug]
  if (!fileId) return null
  return `https://drive.google.com/file/d/${fileId}/view`
}
