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
  'ripam-1340-amm': {
    concorso: 'RIPAM — Funzionari amministrativi (bando 1340), profilo Amministrativo (AMM)',
    concorsoShort: 'concorso RIPAM 1340 Funzionari · profilo Amministrativo (AMM)',
    // Cartella Drive anteprime: ANTEPRIME/report-custom/funz-1340-amm (10 report).
    reports: [
      {
        key: 'diritto-amm',
        label: 'Diritto amministrativo (L. 241/1990 — procedimento, provvedimento, accesso)',
        fileId: '1aqb1pSX-TVJca3IPND25cVAvlyn9teFj',
      },
      {
        key: 'diritto-costituzionale',
        label: 'Diritto costituzionale (fonti, organi, artt. 97-98 Cost.)',
        fileId: '1vjevz4ncIY-FdcAWKW_WVE9NBZL-qqFv',
      },
      {
        key: 'diritto-civile',
        label: 'Diritto civile (nozioni essenziali per la PA)',
        fileId: '1JvSJyTU_0KbqyNY0tXZcPtEa40pISzQr',
      },
      {
        key: 'diritto-penale',
        label: 'Diritto penale — reati contro la PA (314, 317, 319, 323 abrogato, 328)',
        fileId: '1mQ2sQvOWMPMjFv-J470jH8uLUu95Wtr4',
      },
      {
        key: 'contratti-pubblici',
        label: 'Contratti pubblici (D.Lgs. 36/2023 — principi, soglie, procedure)',
        fileId: '1Wje2nMKfGutRv8W8WyDczfFpGQDHPMw_',
      },
      {
        key: 'contabilita-pubblica',
        label: 'Contabilità pubblica (L. 196/2009, art. 81 Cost., ciclo di bilancio, Corte dei conti)',
        fileId: '1J42TtZu16rl1t95X384NKoVGTcIVrd_n',
      },
      {
        key: 'pubblico-impiego',
        label: 'Pubblico impiego — TUPI (D.Lgs. 165/2001: indirizzo/gestione, reclutamento, disciplina)',
        fileId: '1POFnqWZHrlKPDQrCwCbAZ_1JAKSGh8Yy',
      },
      {
        key: 'anticorruzione-trasparenza',
        label: 'Anticorruzione e trasparenza (L. 190/2012, D.Lgs. 33/2013, PIAO/RPCT, whistleblowing)',
        fileId: '17R68tZzQ53Rz8a8EN19yVuU0mBQWHy0E',
      },
      {
        key: 'cad',
        label: 'CAD — Codice dell\'Amministrazione Digitale (SPID, firme, documento informatico)',
        fileId: '12fbUw9G5Nd2UJ_im0ipyWBnz2N41_aL3',
      },
      {
        key: 'gdpr-privacy',
        label: 'GDPR e privacy (principi art. 5, basi giuridiche, data breach)',
        fileId: '1AvQ29xq028haZxutJobIJO5Eo8WOchIv',
      },
    ],
  },
  'inps-1695-pecs': {
    concorso: 'concorso INPS 1.695 Funzionari — profilo Consulente Protezione Sociale (PECS)',
    concorsoShort: 'concorso INPS 1.695 Funzionari · profilo PECS',
    // Cartella Drive anteprime: ANTEPRIME/report-custom/inps-1695-pecs (5 report =
    // le 5 materie della Sezione A della prova scritta). Stessi fileId esposti
    // dalla vetrina /report-custom (src/views/ReportCustom.vue).
    reports: [
      {
        key: 'diritto-lavoro-previdenza',
        label: 'Diritto del lavoro e della previdenza (rapporto subordinato, pensioni, ammortizzatori, INAIL)',
        fileId: '1u5EUA8O0Ob8OwXW1gRRq4vVlMixTaqVk',
      },
      {
        key: 'legislazione-sociale',
        label: 'Legislazione sociale (invalidità civile, ISEE, Assegno Unico, Assegno di Inclusione)',
        fileId: '1aezvJ_PXauQ9jhKsNeC8WFrYE5TuoRmC',
      },
      {
        key: 'organizzazione-pa',
        label: 'Organizzazione e funzionamento della PA (pubblico impiego, ordinamento INPS, trasparenza, privacy)',
        fileId: '1fIT5frKIzMcleRdxGHDx1fPlFXSq3tnA',
      },
      {
        key: 'pianificazione-controllo',
        label: 'Pianificazione e controllo di gestione (budget, scostamenti, ROI/EVA, performance)',
        fileId: '1WBrDY9zVELhdIO4_9F1Fm2vwkO8qnwhq',
      },
      {
        key: 'competenze-informatiche',
        label: 'Competenze informatiche (CAD, SPID/PEC, firme, PDND, GDPR)',
        fileId: '19GtKRXMnSGihOODuxuJCSp4pGzchcEUz',
      },
    ],
  },
  'ripam-1340-com': {
    concorso: 'RIPAM — Funzionari amministrativi (bando 1340), profilo Comunicazione (COM)',
    concorsoShort: 'concorso RIPAM 1340 Funzionari · profilo Comunicazione (COM)',
    // Cartella Drive anteprime: ANTEPRIME/report-custom/funz-1340-com (8 report).
    // Dossier completo (8 report in un unico PDF): fileId 1HUewe3UDt7bEuFjTuPVEnrYaT8lONhC6
    // (tenuto fuori dai reports: è la raccolta d'insieme, non un report singolo).
    reports: [
      {
        key: 'comunicazione-pubblica',
        label: 'Comunicazione pubblica (L. 150/2000 e teoria della comunicazione)',
        fileId: '1c3IwKEWItzKizn0kqZF3xV-EFHSXXCnE',
      },
      {
        key: 'comunicazione-digitale',
        label: 'Comunicazione digitale e social',
        fileId: '1ennHs5aIiPS_1y-AJuG4Z3cWn201W3pS',
      },
      {
        key: 'urp-ufficio-stampa',
        label: 'URP, ufficio stampa e giornalismo PA (campagne, comunicazione di crisi)',
        fileId: '1ORCmtazfOOZ5vSWurob-2sOIfwe8Inln',
      },
      {
        key: 'diritto-amm',
        label: 'Diritto amministrativo (L. 241/1990 — procedimento, provvedimento, accesso)',
        fileId: '1TvhTYQ0MJAAfIewJ0W6TzWnI7iAmrlNz',
      },
      {
        key: 'contratti-pubblici',
        label: 'Contratti pubblici (D.Lgs. 36/2023 — principi, soglie, procedure)',
        fileId: '1whqgm0_1aau9TAQBoonWRaNYIP8RoaFB',
      },
      {
        key: 'anticorruzione-trasparenza',
        label: 'Anticorruzione e trasparenza (L. 190/2012, D.Lgs. 33/2013, PIAO/RPCT, whistleblowing)',
        fileId: '1h7HaZZog0QodzgXCUffUwsb5GmNECAQZ',
      },
      {
        key: 'gdpr-privacy',
        label: 'GDPR e privacy (principi art. 5, basi giuridiche, data breach)',
        fileId: '1wjWhW9NEmNREYsZCBjxQSliyuVz7w3pc',
      },
      {
        key: 'cad',
        label: 'CAD — Codice dell\'Amministrazione Digitale (SPID, firme, documento informatico)',
        fileId: '1OH2xRVQbyF9j4kCmtIJ6aYUIz5UILjmI',
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
