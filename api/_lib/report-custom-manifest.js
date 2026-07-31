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
// ⚠️ SYNC con `src/data/report-concorsi.js` (la vetrina /report-custom/:key).
// Le chiavi concorso dei 5 bandi in vetrina DEVONO esistere anche qui, con gli
// STESSI fileId: la vetrina genera il testo del form ("Vorrei l'anteprima del
// report …"), la skill auto-risposte-lead risponde da qui (categoria RC). Se una
// chiave manca, la bozza RC fallisce con "concorso sconosciuto". Le altre voci
// (cpi-sicilia-sac, cerveteri-istruttore-amm) sono storiche e non hanno vetrina.
// Quando si carica una nuova anteprima su Drive: fileId qui E in report-concorsi.js.
//
// Listino report custom (NON in questo file — solo promemoria): nuovi clienti
// 25 €/report (dal 08/06/2026); clienti grandfathered a tariffa precedente
// (es. Stefania 19,99 €/report). Il prezzo si passa esplicitamente alla mail
// (--prezzo), così non si rischia di comunicare la tariffa sbagliata.

export const REPORT_CUSTOM_MANIFEST = {
  'ripam-3997-amm': {
    concorso: 'RIPAM — 3.997 Assistenti amministrativi, profilo AMM (14 Amministrazioni, Funzioni Centrali)',
    concorsoShort: 'concorso RIPAM 3.997 Assistenti · profilo Amministrativo (AMM)',
    // Vetrina: /report-custom/ripam-3997-amm (10 report = le 10 materie del
    // programma AMM). Esiste anche il Dossier completo (10 report in un PDF):
    // tenuto fuori di proposito, non è un report singolo.
    reports: [
      {
        key: 'diritto-amm',
        label: 'Diritto amministrativo (L. 241/1990 — procedimento, provvedimento, invalidità, accesso)',
        fileId: '1uf8RHgTVGvw0GwutsyYQdFepBaryzOxM',
      },
      {
        key: 'pubblico-impiego',
        label: 'Pubblico impiego (D.Lgs. 165/2001 — rapporto di lavoro, responsabilità, codice di comportamento)',
        fileId: '1ZX6VFpaSBN1RAvB3sfSwYT1etNOzV6aA',
      },
      {
        key: 'contratti-pubblici',
        label: 'Contratti pubblici (D.Lgs. 36/2023 — soggetti, procedure di affidamento, fasi del contratto)',
        fileId: '1AGrmmFR70ay54H8FImQoUepOTGI-u8vP',
      },
      {
        key: 'diritto-penale',
        label: "Diritto penale — reati contro la PA (peculato, corruzione, abuso d'ufficio abrogato, artt. 314-360 c.p.)",
        fileId: '1kVaSi9ANwxCjbuANhXglx3sPDd832FW-',
      },
      {
        key: 'diritto-ue',
        label: "Diritto dell'Unione europea (fonti, istituzioni, principi, rapporto con l'ordinamento interno — TUE/TFUE)",
        fileId: '1Vx96Pv-1rpD08Xadih8GPJA7l6WV_M4C',
      },
      {
        key: 'contabilita-stato',
        label: 'Contabilità di Stato (L. 196/2009, art. 81 Cost. — ciclo di bilancio, DEF, rendiconto, controlli)',
        fileId: '1Nr7vzOJ9LL3EhnL4tU8JMdLNgkP1hoXU',
      },
      {
        key: 'cad',
        label: "CAD — Codice dell'Amministrazione Digitale (identità e domicilio digitale, firme elettroniche, PDND)",
        fileId: '1coPfbJP-kA5s02vYHCR9U6nrEi4NbSLz',
      },
      {
        key: 'gdpr',
        label: "GDPR e privacy (principi, basi giuridiche, diritti dell'interessato, adempimenti del titolare)",
        fileId: '1XWUvu90vmoPOD3O4iqg-ta2Rv5-M2VuH',
      },
      {
        key: 'informatica',
        label: 'Informatica (hardware, software, reti e sicurezza informatica di base)',
        fileId: '16ouxwSREj2Ie67DY4DesbV7uMrWWFki9',
      },
      {
        key: 'ordinamento-amministrazioni',
        label: 'Ordinamento delle Amministrazioni (PA centrali, organi costituzionali, D.Lgs. 300/1999)',
        fileId: '1aTrEAhc0QmTOO5qks0KWX1IpxyYLRF5n',
      },
    ],
  },
  'ade-622-gest': {
    concorso: 'Agenzia delle Entrate — 622 Assistenti gestionali (categorie protette L. 68/1999)',
    concorsoShort: 'concorso AdE 622 Assistenti gestionali · categorie protette',
    // Vetrina: /report-custom/ade-622-gest. 4 report ordinati per PESO nella
    // prova (Ordinamento AdE 40%, Dir. amm. 20%, Pubblico impiego 20%,
    // Applicazioni informatiche 10%). L'inglese (10%) non ha report per scelta:
    // si allena coi quiz, non con una dispensa.
    reports: [
      {
        key: 'ordinamento-ade',
        label: "Ordinamento dell'Agenzia delle Entrate — il 40% della prova (fonti, organi e quorum, uffici periferici, convenzione col MEF)",
        fileId: '1FgALOO1bRwn7lBYFvSjU1cMg78eOVLDr',
      },
      {
        key: 'diritto-amm',
        label: 'Elementi di diritto amministrativo (L. 241/1990 — procedimento, vizi e autotutela, silenzio-assenso, SCIA, accesso)',
        fileId: '1DAgKA2zTzEX2Ac-eHf-ddBFO3MkjuvrR',
      },
      {
        key: 'pubblico-impiego',
        label: 'Rapporto di pubblico impiego (D.Lgs. 165/2001 — accesso e mansioni, dirigenza, procedimento disciplinare, performance)',
        fileId: '1c8zaF92LUhg8_jh2rqklkDaZjciZE9gH',
      },
      {
        key: 'applicazioni-informatiche',
        label: 'Applicazioni informatiche e software diffusi (sistemi operativi, reti e sicurezza + PA digitale: identità, firme, documento informatico)',
        fileId: '1RxBiIo59KORzQCMttms3gn8NKhck84Nj',
      },
    ],
  },
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
    // Cartella Drive anteprime: ANTEPRIME/report-custom/inps-1695-pecs (7 report =
    // la preselettiva Cultura generale + le 5 materie della Sezione A della prova
    // scritta + la Sezione B, prova situazionale SJT). Stessi fileId esposti dalla
    // vetrina /report-custom (src/views/ReportCustom.vue).
    reports: [
      {
        key: 'cultura-generale',
        label: 'Cultura generale — la preselettiva (Costituzione e ordinamento dello Stato, UE, storia, geografia, scienza, letteratura)',
        fileId: '1zkYbN0hzpU1lmI-HmZYVYm30DnRzcmLW',
      },
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
      {
        key: 'sezione-b-sjt',
        label: 'Sezione B — Prova situazionale (SJT): metodo, griglia decisionale e 20 scenari commentati',
        fileId: '10sumfSmjfLktX4EPcTVFN4NKSVugzHHP',
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
