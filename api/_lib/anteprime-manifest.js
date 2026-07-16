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
  'anticorruzione-trasparenza':  '16sQ2Cb8po8MSGsj3SFJJ0ru_VRlkivKL',
  'cad':                         '1e31Ei6EOuZf2FGaMYZG-TFbEhsTIlqaH',
  'contabilita-pubblica':        '1EmAxlL-8-4CUbw_qmCl4FI1EQ0xtT1-K',
  'contratti-pubblici':          '1c0ECzLDP5Xj4IOS6e6TKTTnvdlLqTroK',
  'diritto-amministrativo':      '1uMrup1rmjdfcDsn1fya6S487fJP_qFlx',
  'diritto-civile':              null,
  'diritto-costituzionale':      null,
  'diritto-penale-pa':           '15XP2oXuWTfZyGkuX4v3U_9FRu_2nd9CW',
  'diritto-processuale-civile':  null,
  'diritto-ue':                  '1qVFE38twejtMv1yZdjWJphH7GkeZuSfr',
  'gdpr':                        '12Y1ukX0nI1ABAovt0lostZxAcDRGD4nA',
  'informatica':                 '1ROh5VILoIDSYmASUCC9bfLdLqOBF8C6P',
  'logica':                      '1ZaorlL5PFzog31vV-K2n5xaolmAnwCUO',
  // ⚠️ NON confondere queste due: sono PRODOTTI DIVERSI, non due versioni.
  //   'ordinamento-pa'              → anteprima del manuale Ordinamento PA (D.Lgs. 300/1999),
  //                                   materia storica a catalogo in src/data/materie.js.
  //   'ordinamento-amministrazioni' → anteprima del manuale NUOVO "Amministrazioni
  //                                   Pubbliche/Statali" (19 capitoli, trasversale a più
  //                                   concorsi). Vive di vita propria: sovrascrivere il
  //                                   fileId di 'ordinamento-pa' con questo farebbe
  //                                   consegnare il manuale sbagliato a chi chiede
  //                                   Ordinamento PA, e renderebbe l'altro irraggiungibile.
  'ordinamento-pa':              '1uVqAZUbbdJDSdDiIvFpgZUoKZBWAufZC',
  'ordinamento-amministrazioni': '1KO6u3m5074WBEyWlYSGR6JL3HEyrbMaG',
  'patrimonio-culturale':        '1OdwQQxv5fXakU0F6K-fPH0wCfXXOhYAy',
  'pubblico-impiego':            '1p5lak1Eo0_WIR2b4BOGWqd2gBctxKFPS',
  'sicurezza-lavoro':            '1zEh4-4cLBbZroEyO0oXyCiddkX-sMjqL',
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
