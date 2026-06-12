// Manifest delle anteprime dei REPORT STUDIO CUSTOM (dispense su misura per un
// concorso/profilo specifico) ospitate su Google Drive dell'account brand
// `ripamstudiocraft@gmail.com`, dentro:
//   ANTEPRIME/report-custom/<concorso>/<materia>-anteprima.pdf
//
// Differenza dal manifest delle anteprime-materia (anteprime-manifest.js):
//   - lì la chiave è lo SLUG di una materia → 1 solo file (il manuale 15 pp);
//   - qui la chiave è un CONCORSO/PROFILO → un BUNDLE di più report (3-4 PDF).
// I nomi-cartella concorso NON sono slug di materie.js: per questo restano
// FUORI dal matching automatico della skill auto-risposte-lead (che cerca le
// sottocartelle ANTEPRIME per title = slug). Le anteprime sono comunque
// pubbliche per eredità (ANTEPRIME = "chiunque con il link → visualizzatore").
//
// Canale di consegna: SOLO su richiesta esplicita, semi-manuale — la skill
// auto-risposte-lead (via scripts/lead-draft.mjs, categoria RC) compone la mail
// bundle coi link qui sotto. NESSUN flusso automatico newsletter (scelta utente
// 2026-06-09). Il report COMPLETO resta a pagamento (listino custom, vedi sotto).
//
// fileId null / report assente = anteprima non ancora prodotta/caricata.
// Per aggiornare: leggere il fileId dei PDF in ANTEPRIME/report-custom/<concorso>/
// (search_files parentId=<cartella>) e incollarlo qui.
//
// Listino report custom (NON in questo file — solo promemoria): nuovi clienti
// 25 €/report (dal 08/06/2026); clienti grandfathered a tariffa precedente
// (es. Stefania 19,99 €/report). Il prezzo si passa esplicitamente alla mail
// (--prezzo), così non si rischia di comunicare la tariffa sbagliata.

export const REPORT_CUSTOM_MANIFEST = {
  'cpi-sicilia-sac': {
    concorso: 'CPI Regione Siciliana — Specialista amministrativo contabile (SAC), 200 posti',
    concorsoShort: 'concorso CPI Sicilia · profilo SAC',
    reports: [
      {
        key: 'contabilita-regionale',
        label: 'Contabilità regionale armonizzata (D.Lgs. 118/2011 — Titoli I·II·III)',
        fileId: '1NT__cNzQdtrGrh9PjkTmICEnA8LRxz56',
      },
      {
        key: 'ordinamento-regione-siciliana',
        label: 'Ordinamento della Regione Siciliana (Statuto, organi, controlli, enti locali)',
        fileId: '1UXTic5Pz2hPdVl3iyPxYRGgrYa88xfQA',
      },
      {
        key: 'lr-10-2000',
        label: 'L.R. Sicilia 10/2000 — pubblico impiego e dirigenza regionale',
        fileId: '1bSfd_aU5Obu4Kvi6XHWNDWTKgCglvfN3',
      },
      // PENDENTE: 'contabilita-enti-locali' (Contabilità Enti Locali TUEL/118) —
      // anteprima non ancora prodotta/caricata.
    ],
  },
  'cerveteri-istruttore-amm': {
    concorso: 'Comune di Cerveteri — Istruttore amministrativo cat. C',
    concorsoShort: 'concorso Istruttore amministrativo cat. C — Cerveteri',
    reports: [
      {
        key: 'diritto-amm',
        label: 'Diritto amministrativo (L. 241/1990 — atti, procedimento, accesso)',
        fileId: '1YxsJQygUhg5yCy0vZscvBXbqGNeWyuQJ',
      },
      {
        key: 'ordinamento-eell',
        label: 'Ordinamento degli enti locali — TUEL Parte I (organi, atti, dirigenza)',
        fileId: '1_J61Cq13RF1IJPsK8TgcTkz1A0tS0vW3',
      },
      {
        key: 'contabilita-bilancio-eell',
        label: 'Contabilità e bilancio degli enti locali — TUEL Parte II + D.Lgs. 118/2011',
        fileId: '1TFfAute-N9hiCME8BNkpk2XkeKriUNW-',
      },
    ],
  },
}

// Lista delle chiavi concorso ammesse (per validare l'input lato CLI/skill).
export const REPORT_CUSTOM_CONCORSI = new Set(Object.keys(REPORT_CUSTOM_MANIFEST))

// Restituisce il bundle pronto per la mail per un concorso:
//   { concorso, concorsoShort, reports: [{ key, label, viewUrl, downloadUrl }] }
// Filtra i report senza fileId (anteprima non ancora caricata). Ritorna null se
// il concorso è sconosciuto; { ..., reports: [] } se nessuna anteprima è pronta.
export function getReportCustomBundle(concorso) {
  const entry = REPORT_CUSTOM_MANIFEST[concorso]
  if (!entry) return null
  const reports = (entry.reports || [])
    .filter((r) => r && r.fileId)
    .map((r) => ({
      key: r.key,
      label: r.label,
      viewUrl: `https://drive.google.com/file/d/${r.fileId}/view`,
      downloadUrl: `https://drive.google.com/uc?export=download&id=${r.fileId}`,
    }))
  return { concorso: entry.concorso, concorsoShort: entry.concorsoShort, reports }
}
