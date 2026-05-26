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
  'contabilita-pubblica':        '187s0GdhUXuBrx_en2e0Q-VYCqDi8vC4l',
  'contratti-pubblici':          null,
  'diritto-amministrativo':      null,
  'diritto-civile':              null,
  'diritto-costituzionale':      null,
  'diritto-penale-pa':           null,
  'diritto-processuale-civile':  null,
  'diritto-ue':                  '1N47ae_WQbIPcgMThFilBlfsu5mUZYjJh',
  'gdpr':                        null,
  'informatica':                 null,
  'logica':                      null,
  'ordinamento-pa':              null,
  'patrimonio-culturale':        null,
  'pubblico-impiego':            '1uwecpQ8Rd_8bKD8Lc3C8J7ejYGiHVg_K',
  'sicurezza-lavoro':            null,
}

// Lista degli slug ammessi (usata da subscribe.js per validare il body).
export const ANTEPRIME_SLUGS = new Set(Object.keys(ANTEPRIME_MANIFEST))

// Restituisce { viewUrl, downloadUrl } per uno slug, o null se l'anteprima
// non è ancora disponibile (fileId placeholder).
//   viewUrl     → apre il viewer Drive (toolbar download, anteprima inline)
//   downloadUrl → fa partire il download diretto del PDF senza UI Drive
// Entrambi richiedono permission "Chiunque con il link" sul file Drive.
export function getAnteprimaDriveUrls(slug) {
  const fileId = ANTEPRIME_MANIFEST[slug]
  if (!fileId) return null
  return {
    viewUrl: `https://drive.google.com/file/d/${fileId}/view`,
    downloadUrl: `https://drive.google.com/uc?export=download&id=${fileId}`,
  }
}

// Compat: vecchia API single-URL, rimuovere se non più usata.
export function getAnteprimaDriveUrl(slug) {
  const urls = getAnteprimaDriveUrls(slug)
  return urls ? urls.viewUrl : null
}
