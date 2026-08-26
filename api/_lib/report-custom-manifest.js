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
  'inps-499-assist-inf': {
    concorso: 'concorso INPS 499 Assistenti informatici (Area degli assistenti, famiglia professionale assistente informatico)',
    concorsoShort: 'concorso INPS 499 Assistenti informatici',
    // Cartella Drive anteprime: ANTEPRIME/report-custom/inps-499-ass-inf (12 report
    // = tutte e 16 le voci di programma dell'art. 6 del bando). Stessi fileId
    // esposti dalla vetrina /report-custom/inps-499-assist-inf.
    // Ordine per PRIORITÀ di studio (blocco tecnico ≈ 60-65% del programma, poi
    // giuridico), non per ordine del bando. Prova unica: 60 quesiti in 120', 21/30.
    reports: [
      {
        key: 'reti',
        label: 'Reti — fondamenti di sistemi, reti locali e geografiche (livelli OSI, TCP/IP, indirizzamento, apparati) + reti multimediali e smart working',
        fileId: '1OapoRuiVIHVSQj7OLZequj_lniwrkH7e',
      },
      {
        key: 'sistemi-operativi',
        label: 'Sistemi operativi — Linux e Windows per server e client (filesystem e permessi, processi e servizi, Active Directory, virtualizzazione)',
        fileId: '1WhHutjNrnER_ehoZY_4hJbEaTFEMgprs',
      },
      {
        key: 'database',
        label: 'Database relazionali (modello relazionale, chiavi, normalizzazione, SQL, transazioni ACID, cenni NoSQL)',
        fileId: '1i3a-AWq7sHJZg9htfak2tur3gnGyqfbF',
      },
      {
        key: 'programmazione-middleware',
        label: 'Programmazione e middleware (linguaggi e paradigmi, application server, web service REST e SOAP)',
        fileId: '1oiwkfBPPGyLN7Qpflgbun7Lrqhc6j0YF',
      },
      {
        key: 'informatica-base-office',
        label: 'Informatica di base e office automation — la materia più sottovalutata da chi arriva dal tecnico',
        fileId: '16n12FL9XB6HumQP6mjZGttmitx6_wi-l',
      },
      {
        key: 'backup-recovery',
        label: 'Backup e recovery (full/incrementale/differenziale, RTO e RPO, RAID, NAS e SAN, disaster recovery)',
        fileId: '1ylnScXcgpwfZ17mwYXLXd1ZtFGAqiTqT',
      },
      {
        key: 'intelligenza-artificiale',
        label: 'Principi di intelligenza artificiale (apprendimento supervisionato e non, classificazione, clustering, reti neurali, IA nella PA)',
        fileId: '1Au5vKkr_TrQq_ImLYsHc77LKAnWpAq_q',
      },
      {
        key: 'gdpr-sicurezza',
        label: 'GDPR e sicurezza informatica (principi, categorie particolari, diritti, DPO, misure tecniche, data breach)',
        fileId: '1G5A8rQbrQkLgcUw1hb-tFPfGFCPLrrw8',
      },
      {
        key: 'cad',
        label: "CAD — Codice dell'amministrazione digitale (SPID/CIE/CNS, firme elettroniche, documento informatico, conservazione)",
        fileId: '1mSSfr_cpi_MtMpA5l-45VcnfjDcb_5Ft',
      },
      {
        key: 'diritto-amm',
        label: 'Nozioni di diritto amministrativo (procedimento, provvedimento, accesso documentale e civico — L. 241/1990)',
        fileId: '1gjcYdmOfYJncOvsPaiJ2v2WPRBYST0lY',
      },
      {
        key: 'pubblico-impiego',
        label: 'Ordinamento del lavoro alle dipendenze delle PA (accesso, gestione del personale, responsabilità disciplinare — D.Lgs. 165/2001)',
        fileId: '16SuhPcH93rRjJEroG_S12sJuZMwFJZzc',
      },
      {
        key: 'trasparenza-anticorruzione',
        label: 'Trasparenza e anticorruzione (obblighi di pubblicazione, accesso civico, PNA, PTPCT, RPCT — L. 190/2012, D.Lgs. 33/2013)',
        fileId: '1oP-afLdO0zXF9caIT55X8n2rqMikTMbb',
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
  // MIC 1.800 — i due profili. Anteprime tagliate dai due dossier (839 e 855 pp)
  // in ANTEPRIME/report-custom/mic-1800-vigilanza e /mic-1800-tecnici.
  'mic-1800-cod01': {
    concorso: 'MIC — 1.800 Assistenti del Ministero della cultura, Codice 01 (vigilanza, accoglienza e tutela)',
    concorsoShort: 'concorso MIC 1.800 Assistenti · Codice 01',
    reports: [
      { key: 'organizzazione-mic', label: 'Struttura e organizzazione del MiC (organigramma, direzioni generali, istituti autonomi, soprintendenze)', fileId: '15JwyJEGzWoTVuppuRwdwlTGOy1ab2ZRt' },
      { key: 'patrimonio-culturale-italiano', label: 'Patrimonio culturale italiano (musei, siti UNESCO, arte, archeologia, paesaggio)', fileId: '12h_D1p1pidVt3t7TO3XdnDtWeg4vTTr9' },
      { key: 'diritto-patrimonio-culturale', label: 'Diritto del patrimonio culturale (D.Lgs. 42/2004 — tutela, vincoli, circolazione, sanzioni)', fileId: '1D_J7khHycgpMi08n8mL5afiAb23ISHKw' },
      { key: 'marketing-comunicazione', label: 'Marketing e comunicazione (L. 150/2000, URP e portavoce, comunicazione museale e brand identity)', fileId: '1p12RYHfhNhAc-7dSRaTMNHj5wtw4EXj_' },
      { key: 'quesiti-situazionali', label: 'Quesiti situazionali (8 domande su 40, nessuna penalità)', fileId: '1lB0mYmcIsesTdbPjRq18GFTeRK2SXx9g' },
      { key: 'diritto-amm', label: 'Diritto amministrativo (L. 241/1990 — procedimento, provvedimento, invalidità, accesso)', fileId: '1Lh_7KB0ulfDQiHESde-u9p9xganRxR1M' },
      { key: 'pubblico-impiego', label: 'Pubblico impiego (D.Lgs. 165/2001 — rapporto, responsabilità, codice di comportamento)', fileId: '1VBpaJ3xYwNRP8IlmpYzGwI_wBlELX3ag' },
      { key: 'anticorruzione', label: 'Anticorruzione e trasparenza (L. 190/2012, D.Lgs. 33/2013 — PNA, PTPCT, accesso civico)', fileId: '1lTFYNIeGKfPIyFsvsgO7BArxetuY14O3' },
      { key: 'contratti-pubblici', label: 'Contratti pubblici (D.Lgs. 36/2023 — soggetti, procedure, fasi del contratto)', fileId: '17_18pYbyXGMaHPKbQWhomnmH9zQ32hZ5' },
      { key: 'contabilita-stato', label: 'Contabilità di Stato (L. 196/2009 — ciclo di bilancio, rendiconto, controlli)', fileId: '1QyjAE_jcpjXEQo81UHi_wyhzdAfZS7Of' },
      { key: 'diritto-penale', label: 'Diritto penale — reati contro la PA (artt. 314-360 c.p.)', fileId: '1JYC12lazqmpJzHoj2kKFmpVKgYsL2jM1' },
      { key: 'diritto-ue', label: "Diritto dell'Unione europea (istituzioni, fonti, principi — TUE/TFUE)", fileId: '1HNM2JOFDhCtMGOPwrrCgGmLaIEXN6j1l' },
      { key: 'cad', label: 'CAD — amministrazione digitale (D.Lgs. 82/2005 — identità digitale, firme, documento informatico)', fileId: '1Ba0pT8gYpeATv80aY8GQvbTsIs0_hV3u' },
      { key: 'gdpr', label: "GDPR (Reg. UE 2016/679 — principi, basi giuridiche, diritti dell'interessato, data breach)", fileId: '1w7khblxyBsdaN1JjrwEqeewKqoB7UDEg' },
      { key: 'informatica', label: 'Informatica e ICT (hardware, sistemi operativi, reti, sicurezza, office automation)', fileId: '1nt5SXuLhtHyxGb3Hf-Bq55PVDdoE_qtO' },
      { key: 'sicurezza-lavoro', label: 'Sicurezza sul lavoro (D.Lgs. 81/2008 — soggetti, obblighi, valutazione dei rischi)', fileId: '1KIaQNlA1k-CBSR0rGCND2AKaGZD_KbAs' },
    ],
  },
  'mic-1800-cod02': {
    concorso: 'MIC — 1.800 Assistenti del Ministero della cultura, Codice 02 (assistente tecnico per la tutela e la valorizzazione)',
    concorsoShort: 'concorso MIC 1.800 Assistenti · Codice 02',
    reports: [
      { key: 'metodologie-scavo', label: 'Metodologie e tecniche dello scavo (metodo stratigrafico, documentazione, archeologia subacquea)', fileId: '1z9VvxHTMe8a6Dx-n9DB8SM77bQC3SdE4' },
      { key: 'archeologia-arte-musei', label: "Archeologia, storia dell'arte e musei (dalle civiltà antiche al contemporaneo, museologia e museografia)", fileId: '1MzmQLgyiNXPKFrP9Xoju_P9e5FoF0T8K' },
      { key: 'diritto-patrimonio-culturale', label: 'Diritto del patrimonio culturale (D.Lgs. 42/2004 — beni culturali e paesaggistici, tutela, sanzioni)', fileId: '1Z4E__ED4y_tHer9YxuGiI0HTORk4s89g' },
      { key: 'patrimonio-culturale-italiano', label: 'Patrimonio culturale italiano (musei, siti UNESCO, geografia e storia dell\'arte)', fileId: '1XhHmBtr66_GZ_7efgpIgmwhKBQr8hbiP' },
      { key: 'organizzazione-mic', label: 'Struttura e organizzazione del MiC (organigramma, direzioni generali, soprintendenze)', fileId: '1Bfz5YhiCEzGCrMA6eGbkAM_mais3m00U' },
      { key: 'quesiti-situazionali', label: 'Quesiti situazionali (8 domande su 40, nessuna penalità)', fileId: '1GeMv3V_Yvm7rQ4e7EnbvTQtAHcTTlzFe' },
      { key: 'diritto-amm', label: 'Diritto amministrativo (L. 241/1990 — procedimento e fasi, termini, vizi, accesso)', fileId: '1eszQWZ72lo6vZZsK5JccZjk2yxgd9Pdh' },
      { key: 'diritto-ue', label: "Diritto dell'Unione europea (le sette istituzioni, fonti e principi — TUE/TFUE)", fileId: '1280UcwdTiLG9hBrDPsbDo3MungyOYik3' },
      { key: 'informatica', label: 'Informatica e ICT (hardware e memorie, sistemi operativi, reti, sicurezza)', fileId: '1L76tSD94mATpRp-YvTfG90qX3ymqQfyH' },
      { key: 'diritto-penale', label: 'Diritto penale — reati contro la PA (peculato, corruzione, artt. 314-360 c.p.)', fileId: '1mviZLbGAbinEW3BJThx-Fk3qMjTM2lu6' },
      { key: 'contabilita-stato', label: 'Contabilità di Stato (ciclo del bilancio e nuovi saldi, rendiconto, controlli)', fileId: '18IUvmRy3zkp3ApCM63BrjeU0jPBkao92' },
      { key: 'cad', label: 'CAD — amministrazione digitale (documento informatico, identità digitale, firme)', fileId: '1r6szIZCANUNE-laIhHw_8flCPPEUCYva' },
      { key: 'pubblico-impiego', label: 'Pubblico impiego (D.Lgs. 165/2001 — privatizzazione, accesso, disciplinare)', fileId: '1anEj6LbHW7vTMrInJA1bT_ZlBkW-TPAU' },
      { key: 'gdpr', label: "GDPR e protezione dei dati (Reg. UE 2016/679 — principi, diritti, data breach)", fileId: '1O9Lv99uAsx7lf6C5eSYPPS2N3Po4I-EU' },
      { key: 'contratti-pubblici', label: 'Contratti pubblici (D.Lgs. 36/2023 — procedure di affidamento, soggetti, fasi)', fileId: '16MWzDpIDz6TICcUZJeo9MbwJNZsS1Cym' },
      { key: 'anticorruzione', label: 'Anticorruzione e trasparenza (L. 190/2012, D.Lgs. 33/2013 — PNA, PTPCT, accesso civico)', fileId: '1O-9Anbum1xq_SjQW6tsSu8G4NHyWXTtI' },
    ],
  },
  // Difesa 1.100 — 11 report. Ordine per chi arriva dal RIPAM 3.997: prima le
  // due materie davvero nuove (ordinamento Difesa e il blocco disciplinare).
  'difesa-1100-amm': {
    concorso: 'Ministero della Difesa — 1.100 Assistenti amministrativi (Area Assistenti)',
    concorsoShort: 'concorso Difesa 1.100 Assistenti · profilo amministrativo',
    reports: [
      { key: 'ordinamento-difesa', label: "Ordinamento del Ministero della Difesa (D.Lgs. 66/2010 — Consiglio Supremo, Stato Maggiore e COVI, armamenti, PERSOCIV)", fileId: '19lAELDs56ajCyfPkVfeuSTVPgpTYLSjd' },
      { key: 'pubblico-impiego', label: 'Pubblico impiego (D.Lgs. 165/2001 — con doveri, codice di comportamento e sanzioni disciplinari)', fileId: '1PdX2pinVc43JXFjC36n1N-7E51xe8BJx' },
      { key: 'diritto-amm', label: 'Diritto amministrativo (L. 241/1990 — procedimento, provvedimento, invalidità, accesso)', fileId: '1EB8SH0xpxJTK1uwjyBSawULTWvoXg4qm' },
      { key: 'contratti-pubblici', label: 'Contratti pubblici (D.Lgs. 36/2023 — soggetti, procedure, fasi del contratto)', fileId: '11nQ3nB7n-HxZeNHkKOkjnU-AopTvJ2TQ' },
      { key: 'contabilita-stato', label: 'Contabilità di Stato (L. 196/2009 — ciclo di bilancio, rendiconto, controlli)', fileId: '14P4g1givy55cGte-W8W0bhCbHdAASMWS' },
      { key: 'diritto-penale', label: 'Diritto penale nella PA (peculato, corruzione, concussione — artt. 314-360 c.p.)', fileId: '10Pb9ev3Sbo61xpm7-Q0I7rARSsT49eO2' },
      { key: 'diritto-ue', label: "Diritto dell'Unione Europea (istituzioni, fonti, principi — TUE/TFUE)", fileId: '1_c3gutcRpaq52bcPO0pmeI-CY6lcVDRl' },
      { key: 'anticorruzione', label: 'Anticorruzione e trasparenza (L. 190/2012, D.Lgs. 33/2013 — PNA, PTPCT, accesso civico)', fileId: '1T5TTn5bwBf9Kt9q50DsvX1nkcWLkjkUL' },
      { key: 'gdpr', label: "GDPR (Reg. UE 2016/679 — principi, basi giuridiche, diritti dell'interessato)", fileId: '15lyfdobOMivUBudCPrilp17ga9eWscg5' },
      { key: 'cad', label: 'CAD (D.Lgs. 82/2005 — identità e domicilio digitale, firme, documento informatico)', fileId: '1K2Co2ED65ciWQ9HdVqO2p-E5Puo5sW64' },
      { key: 'informatica', label: 'Informatica (hardware, software, reti e sicurezza di base)', fileId: '1myUtdLSpzrtRsjJkLjLaUU_PZ1FFEIt_' },
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
