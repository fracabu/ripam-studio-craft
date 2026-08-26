// REPORT DI STUDIO SU MISURA — catalogo per CONCORSO.
//
// Fonte unica della vetrina /report-custom e delle pagine dedicate
// /report-custom/:concorso (link da mandare a un lead: vede solo il suo bando).
//
//  - key:      slug di rotta E nome cartella delle cover
//              (public/report-cover/<key>/<img>.png, pagina 1 del PDF report).
//  - cod:      valore precompilato nel select "Concorso" del form /scrivimi.
//              Deve stare in CONCORSI (src/data/formati.js) o essere 'Altro',
//              altrimenti Scrivimi.vue scarta il prefill.
//  - fileId:   PDF anteprima su Drive. Qui NON si costruisce un link diretto:
//              serve solo a sapere se l'anteprima è consegnabile.
//  - anteprima: true = anteprima pronta ma non ancora su Drive (consegna a mano).
//              Senza fileId né anteprima la card mostra "Anteprima in arrivo".
//
// I report NON sono in ordine di programma ma di peso nella prova, dove il
// bando lo dichiara (è l'ordine in cui conviene studiarli).
export const REPORT_CONCORSI = [
  {
    key: 'ripam-3997-amm',
    cod: 'RIPAM',
    nome: 'RIPAM 3.997 Assistenti Amministrativi',
    tag: 'profilo AMM · 14 Amministrazioni · Funzioni Centrali',
    intro: 'Le 10 materie del programma AMM, ognuna in un report a sé — più il Dossier completo con tutte e 10 in un unico PDF.',
    reports: [
      { t: 'Diritto Amministrativo', d: 'Procedimento, provvedimento, invalidità, accesso e processo amministrativo (L. 241/1990).', fileId: '1uf8RHgTVGvw0GwutsyYQdFepBaryzOxM', img: 'diritto-amministrativo' },
      { t: 'Pubblico Impiego', d: 'Costituzione del rapporto, responsabilità, codice di comportamento, sanzioni disciplinari (D.Lgs. 165/2001).', fileId: '1ZX6VFpaSBN1RAvB3sfSwYT1etNOzV6aA', img: 'pubblico-impiego' },
      { t: 'Contratti Pubblici', d: 'Soggetti, procedure di affidamento, fasi del contratto (D.Lgs. 36/2023).', fileId: '1AGrmmFR70ay54H8FImQoUepOTGI-u8vP', img: 'contratti-pubblici' },
      { t: 'Diritto Penale', d: "I reati contro la PA: peculato, corruzione, abuso d'ufficio (artt. 314-360 c.p.).", fileId: '1kVaSi9ANwxCjbuANhXglx3sPDd832FW-', img: 'diritto-penale' },
      { t: 'Diritto UE', d: "Fonti, istituzioni, principi e rapporto con l'ordinamento italiano (TUE/TFUE).", fileId: '1Vx96Pv-1rpD08Xadih8GPJA7l6WV_M4C', img: 'diritto-ue' },
      { t: 'Contabilità di Stato', d: 'Ciclo di bilancio, DEF, rendiconto, controlli (L. 196/2009, art. 81 Cost.).', fileId: '1Nr7vzOJ9LL3EhnL4tU8JMdLNgkP1hoXU', img: 'contabilita-stato' },
      { t: 'CAD', d: 'Identità digitale, domicilio digitale, firme elettroniche, PDND (D.Lgs. 82/2005).', fileId: '1coPfbJP-kA5s02vYHCR9U6nrEi4NbSLz', img: 'cad' },
      { t: 'GDPR', d: "Principi, basi giuridiche, diritti dell'interessato, adempimenti del titolare (Reg. UE 2016/679).", fileId: '1XWUvu90vmoPOD3O4iqg-ta2Rv5-M2VuH', img: 'gdpr' },
      { t: 'Informatica', d: 'Hardware, software, reti e sicurezza informatica di base.', fileId: '16ouxwSREj2Ie67DY4DesbV7uMrWWFki9', img: 'informatica' },
      { t: 'Ordinamento delle Amministrazioni', d: 'Assetto delle PA centrali, organi costituzionali, D.Lgs. 300/1999.', fileId: '1aTrEAhc0QmTOO5qks0KWX1IpxyYLRF5n', img: 'ordinamento-amministrazioni' },
    ],
  },
  {
    key: 'inps-1695-pecs',
    cod: 'INPS',
    nome: 'INPS 1.695 Funzionari PECS',
    tag: 'Progettazione, Erogazione e Controllo dei Servizi',
    intro: 'Il report della preselettiva (Cultura generale), le 5 materie della Sezione A della prova scritta e la Sezione B (prova situazionale, SJT) — ognuna in un report a sé.',
    reports: [
      { t: 'Cultura generale', d: 'La preselettiva (60 quesiti): Costituzione e ordinamento dello Stato, UE e organizzazioni internazionali, storia contemporanea, geografia, scienza, letteratura e arte.', fileId: '1zkYbN0hzpU1lmI-HmZYVYm30DnRzcmLW', img: 'cultura-generale' },
      { t: 'Diritto del lavoro e della previdenza', d: 'Rapporto di lavoro subordinato, sistema previdenziale, pensioni, ammortizzatori sociali, tutela INAIL.', fileId: '1u5EUA8O0Ob8OwXW1gRRq4vVlMixTaqVk', img: 'diritto-lavoro' },
      { t: 'Legislazione sociale', d: "L'assistenza e il welfare: invalidità civile, ISEE, Assegno Unico, Assegno di Inclusione.", fileId: '1aezvJ_PXauQ9jhKsNeC8WFrYE5TuoRmC', img: 'legislazione-sociale' },
      { t: 'Organizzazione e funzionamento della PA', d: 'Pubblico impiego, ordinamento INPS, trasparenza, anticorruzione e privacy.', fileId: '1fIT5frKIzMcleRdxGHDx1fPlFXSq3tnA', img: 'organizzazione-pa' },
      { t: 'Pianificazione e controllo di gestione', d: 'Budget, scostamenti, centri di responsabilità, ROI/EVA e performance nella PA.', fileId: '1WBrDY9zVELhdIO4_9F1Fm2vwkO8qnwhq', img: 'pianificazione-controllo' },
      { t: 'Competenze informatiche', d: 'Amministrazione digitale (CAD, SPID/PEC, firme, PDND), GDPR e informatica di base.', fileId: '19GtKRXMnSGihOODuxuJCSp4pGzchcEUz', img: 'competenze-informatiche' },
      { t: 'Sezione B — Prova situazionale (SJT)', d: 'Come ragioni e ti comporti, non cosa sai: metodo, griglia decisionale e 20 scenari commentati con le trappole tipiche.', fileId: '10sumfSmjfLktX4EPcTVFN4NKSVugzHHP', img: 'sezione-b-sjt' },
    ],
  },
  {
    key: 'inps-499-assist-inf',
    cod: 'INPS',
    nome: 'INPS 499 Assistenti Informatici',
    tag: 'profilo informatico · Area assistenti · Funzioni Centrali',
    intro:
      'Una sola prova scritta — 60 quesiti in 120 minuti, soglia 21/30 (il 70%, non il canonico 18/30): niente preselettiva, niente orale. Il blocco tecnico vale da solo circa i due terzi del programma. I report seguono l\'ordine di priorità, non quello del bando — e c\'è anche il Dossier completo, tutti e dodici in un unico PDF da 497 pagine.',
    reports: [
      { t: 'Reti', d: 'Fondamenti di sistemi, reti locali e geografiche: i sette livelli OSI, TCP/IP, indirizzamento, apparati — più reti multimediali e smart working.', fileId: '1OapoRuiVIHVSQj7OLZequj_lniwrkH7e', img: 'reti' },
      { t: 'Sistemi operativi', d: 'Linux e Windows per la gestione di server e client: filesystem e permessi, processi e servizi, Active Directory, virtualizzazione.', fileId: '1WhHutjNrnER_ehoZY_4hJbEaTFEMgprs', img: 'sistemi-operativi' },
      { t: 'Database relazionali', d: 'Modello relazionale, chiavi, relazioni e normalizzazione, SQL, transazioni ACID e cenni NoSQL.', fileId: '1i3a-AWq7sHJZg9htfak2tur3gnGyqfbF', img: 'database' },
      { t: 'Programmazione e middleware', d: 'Linguaggi e paradigmi a livello concettuale, application server e componenti middleware, web service REST e SOAP.', fileId: '1oiwkfBPPGyLN7Qpflgbun7Lrqhc6j0YF', img: 'programmazione-middleware' },
      { t: 'Informatica di base e office automation', d: 'Le fondamenta e gli strumenti da ufficio: la materia dove chi è tecnico perde più punti per sottovalutazione.', fileId: '16n12FL9XB6HumQP6mjZGttmitx6_wi-l', img: 'informatica-base-office' },
      { t: 'Backup e recovery', d: 'Full, incrementale e differenziale, RTO e RPO, RAID, NAS e SAN, disaster recovery e business continuity.', fileId: '1ylnScXcgpwfZ17mwYXLXd1ZtFGAqiTqT', img: 'backup-recovery' },
      { t: 'Intelligenza artificiale', d: 'Principi di IA: apprendimento supervisionato e non, classificazione e clustering, reti neurali, applicazioni nella PA.', fileId: '1Au5vKkr_TrQq_ImLYsHc77LKAnWpAq_q', img: 'intelligenza-artificiale' },
      { t: 'GDPR e sicurezza informatica', d: "Data privacy e sicurezza: principi, categorie particolari, diritti dell'interessato, DPO, misure tecniche e data breach (Reg. UE 2016/679).", fileId: '1G5A8rQbrQkLgcUw1hb-tFPfGFCPLrrw8', img: 'gdpr-sicurezza' },
      { t: 'CAD', d: 'Identità digitale SPID/CIE/CNS, firme elettroniche, documento informatico e conservazione, piattaforme abilitanti (D.Lgs. 82/2005).', fileId: '1mSSfr_cpi_MtMpA5l-45VcnfjDcb_5Ft', img: 'cad' },
      { t: 'Diritto amministrativo', d: 'Procedimento, provvedimento, accesso documentale e civico (L. 241/1990).', fileId: '1gjcYdmOfYJncOvsPaiJ2v2WPRBYST0lY', img: 'diritto-amministrativo' },
      { t: 'Pubblico impiego', d: 'Ordinamento del lavoro alle dipendenze delle PA: accesso, gestione del personale, responsabilità disciplinare (D.Lgs. 165/2001).', fileId: '16SuhPcH93rRjJEroG_S12sJuZMwFJZzc', img: 'pubblico-impiego' },
      { t: 'Trasparenza e anticorruzione', d: 'Obblighi di pubblicazione e accesso civico, PNA, PTPCT e RPCT (L. 190/2012, D.Lgs. 33/2013).', fileId: '1oP-afLdO0zXF9caIT55X8n2rqMikTMbb', img: 'trasparenza-anticorruzione' },
    ],
  },
  {
    key: 'ripam-1340-amm',
    cod: 'RIPAM',
    nome: 'RIPAM 1.340 Funzionari — profilo AMM',
    tag: 'profilo Amministrativo · Funzioni Centrali',
    intro: 'Le 10 materie del programma del profilo Amministrativo (AMM), ognuna in un report a sé.',
    reports: [
      { t: 'Diritto Amministrativo', d: 'Atti e provvedimenti, principi, procedimento, accesso, invalidità e autotutela (L. 241/1990).', fileId: '1aqb1pSX-TVJca3IPND25cVAvlyn9teFj', img: 'diritto-amministrativo' },
      { t: 'Diritto Costituzionale', d: 'Fonti del diritto, organi costituzionali, principi sulla PA (artt. 97-98 Cost.).', fileId: '1vjevz4ncIY-FdcAWKW_WVE9NBZL-qqFv', img: 'diritto-costituzionale' },
      { t: 'Diritto Civile', d: 'Nozioni essenziali di diritto civile per la Pubblica Amministrazione.', fileId: '1JvSJyTU_0KbqyNY0tXZcPtEa40pISzQr', img: 'diritto-civile' },
      { t: 'Diritto Penale', d: 'I reati contro la PA: peculato, concussione, corruzione, rifiuto/omissione di atti (artt. 314-360 c.p.).', fileId: '1mQ2sQvOWMPMjFv-J470jH8uLUu95Wtr4', img: 'diritto-penale' },
      { t: 'Contratti Pubblici', d: 'Principi, soglie, procedure di affidamento e fasi del contratto (D.Lgs. 36/2023).', fileId: '1Wje2nMKfGutRv8W8WyDczfFpGQDHPMw_', img: 'contratti-pubblici' },
      { t: 'Contabilità Pubblica', d: 'Ciclo di bilancio, art. 81 Cost., Corte dei conti e controlli (L. 196/2009).', fileId: '1J42TtZu16rl1t95X384NKoVGTcIVrd_n', img: 'contabilita-pubblica' },
      { t: 'Pubblico Impiego', d: 'Indirizzo e gestione, reclutamento, responsabilità e disciplina (TUPI, D.Lgs. 165/2001).', fileId: '1POFnqWZHrlKPDQrCwCbAZ_1JAKSGh8Yy', img: 'pubblico-impiego' },
      { t: 'Anticorruzione e Trasparenza', d: 'Piani, RPCT, obblighi di pubblicità e whistleblowing (L. 190/2012, D.Lgs. 33/2013, PIAO).', fileId: '17R68tZzQ53Rz8a8EN19yVuU0mBQWHy0E', img: 'anticorruzione-trasparenza' },
      { t: 'CAD', d: 'Identità digitale, firme elettroniche, documento informatico (D.Lgs. 82/2005).', fileId: '12fbUw9G5Nd2UJ_im0ipyWBnz2N41_aL3', img: 'cad' },
      { t: 'GDPR e Privacy', d: "Principi (art. 5), basi giuridiche, diritti dell'interessato e data breach (Reg. UE 2016/679).", fileId: '1AvQ29xq028haZxutJobIJO5Eo8WOchIv', img: 'gdpr' },
    ],
  },
  {
    key: 'ripam-1340-com',
    cod: 'RIPAM',
    nome: 'RIPAM 1.340 Funzionari — profilo COM',
    tag: 'profilo Comunicazione · Funzioni Centrali',
    intro: 'Gli 8 report del profilo Comunicazione (COM): le materie specialistiche della comunicazione pubblica più il diritto trasversale.',
    reports: [
      { t: 'Comunicazione Pubblica', d: 'Portavoce, ufficio stampa, URP, ciclo di programmazione e teoria della comunicazione (L. 150/2000).', fileId: '1c3IwKEWItzKizn0kqZF3xV-EFHSXXCnE', img: 'comunicazione-pubblica' },
      { t: 'Comunicazione Digitale e Social', d: 'Strategie e strumenti della comunicazione digitale e dei social nella PA.', fileId: '1ennHs5aIiPS_1y-AJuG4Z3cWn201W3pS', img: 'comunicazione-digitale' },
      { t: 'URP, Ufficio Stampa e Giornalismo PA', d: 'Campagne di comunicazione, comunicazione di crisi e rapporti con i media.', fileId: '1ORCmtazfOOZ5vSWurob-2sOIfwe8Inln', img: 'urp-ufficio-stampa' },
      { t: 'Diritto Amministrativo', d: 'Atti e provvedimenti, principi, procedimento, accesso (L. 241/1990).', fileId: '1TvhTYQ0MJAAfIewJ0W6TzWnI7iAmrlNz', img: 'diritto-amministrativo' },
      { t: 'Contratti Pubblici', d: 'Principi, soglie, procedure di affidamento e fasi del contratto (D.Lgs. 36/2023).', fileId: '1whqgm0_1aau9TAQBoonWRaNYIP8RoaFB', img: 'contratti-pubblici' },
      { t: 'Anticorruzione e Trasparenza', d: 'Piani, RPCT, obblighi di pubblicità e whistleblowing (L. 190/2012, D.Lgs. 33/2013, PIAO).', fileId: '1h7HaZZog0QodzgXCUffUwsb5GmNECAQZ', img: 'anticorruzione-trasparenza' },
      { t: 'GDPR e Privacy', d: "Principi (art. 5), basi giuridiche, diritti dell'interessato e data breach (Reg. UE 2016/679).", fileId: '1wjWhW9NEmNREYsZCBjxQSliyuVz7w3pc', img: 'gdpr' },
      { t: 'CAD', d: 'Identità digitale, firme elettroniche, documento informatico (D.Lgs. 82/2005).', fileId: '1OH2xRVQbyF9j4kCmtIJ6aYUIz5UILjmI', img: 'cad' },
    ],
  },
  {
    key: 'ade-622-gest',
    // 'ADE' non è tra i CONCORSI del form: passarlo farebbe scartare il prefill
    // del select. Il concorso resta nelle note precompilate.
    cod: 'Altro',
    nome: 'Agenzia delle Entrate — 622 Assistenti gestionali',
    tag: 'categorie protette L. 68/1999 · prova unica, 50 quesiti, nessun orale',
    intro: "Le 4 materie tecniche della prova, ognuna in un report a sé e dimensionata sul peso reale in graduatoria: l'ordinamento dell'Agenzia da solo vale il 40% dei quesiti ed è il report più esteso. L'inglese (10%) non ha un report: si allena con i quiz, non con una dispensa.",
    reports: [
      { t: "Ordinamento dell'Agenzia delle Entrate", d: 'Il 40% della prova: fonti, missione, organi e quorum, organigramma, uffici periferici, convenzione col MEF e Carta dei servizi (D.Lgs. 300/1999, artt. 57-73).', fileId: '1FgALOO1bRwn7lBYFvSjU1cMg78eOVLDr', img: 'ordinamento-ade' },
      { t: 'Elementi di diritto amministrativo', d: 'Procedimento e provvedimento, termini e partecipazione, vizi e autotutela, silenzio-assenso, SCIA, conferenza di servizi, accesso e trasparenza (L. 241/1990).', fileId: '1DAgKA2zTzEX2Ac-eHf-ddBFO3MkjuvrR', img: 'diritto-amministrativo' },
      { t: 'Normativa sul rapporto di pubblico impiego', d: 'Fonti e privatizzazione, accesso e mansioni, dirigenza e contrattazione, procedimento disciplinare, codice di comportamento e performance (D.Lgs. 165/2001).', fileId: '1c8zaF92LUhg8_jh2rqklkDaZjciZE9gH', img: 'pubblico-impiego' },
      { t: 'Applicazioni informatiche e software diffusi', d: 'Hardware e software, sistemi operativi e file, reti e sicurezza, più il blocco PA digitale: identità e domicilio digitale, firme elettroniche, documento informatico.', fileId: '1RxBiIo59KORzQCMttms3gn8NKhck84Nj', img: 'applicazioni-informatiche' },
    ],
  },
  {
    key: 'mic-1800-cod01',
    cod: 'MIC',
    nome: 'MIC 1.800 Assistenti — Codice 01',
    tag: 'vigilanza, accoglienza e tutela · Ministero della cultura · Area Assistenti',
    intro:
      'Una sola prova scritta digitale: 40 quesiti in 60 minuti, soglia 21/30, nessun orale. I sedici report seguono il peso reale nella prova — prima le quattro materie specifiche del Codice 01, poi i quesiti situazionali (8 domande su 40 e nessuna penalità: il punteggio più economico della prova), infine le comuni.',
    reports: [
      { t: 'Struttura e organizzazione del MiC', d: 'La materia più nozionistica del programma: organigramma, direzioni generali, istituti autonomi, soprintendenze e organi consultivi.', fileId: '15JwyJEGzWoTVuppuRwdwlTGOy1ab2ZRt', img: 'organizzazione-mic' },
      { t: 'Patrimonio culturale italiano', d: 'Cultura generale storico-artistica e geografica: musei, siti UNESCO, arte, archeologia e paesaggio.', fileId: '12h_D1p1pidVt3t7TO3XdnDtWeg4vTTr9', img: 'patrimonio-culturale-italiano' },
      { t: 'Diritto del patrimonio culturale', d: 'Il Codice dei beni culturali (D.Lgs. 42/2004): tutela, vincoli, circolazione, valorizzazione e sanzioni.', fileId: '1D_J7khHycgpMi08n8mL5afiAb23ISHKw', img: 'diritto-patrimonio-culturale' },
      { t: 'Marketing e comunicazione', d: "Comunicazione istituzionale della PA (L. 150/2000), URP e portavoce, più il marketing della cultura: comunicazione museale, didascalie, brand identity.", fileId: '1p12RYHfhNhAc-7dSRaTMNHj5wtw4EXj_', img: 'marketing-comunicazione' },
      { t: 'Quesiti situazionali', d: 'Otto domande su quaranta e nessuna penalità: la matrice situazione → risposta efficace, con gli scenari tipici della vigilanza e dell\'accoglienza.', fileId: '1lB0mYmcIsesTdbPjRq18GFTeRK2SXx9g', img: 'quesiti-situazionali' },
      { t: 'Diritto amministrativo', d: 'Procedimento e provvedimento, termini e partecipazione, vizi e autotutela, accesso documentale e civico (L. 241/1990).', fileId: '1Lh_7KB0ulfDQiHESde-u9p9xganRxR1M', img: 'diritto-amministrativo' },
      { t: 'Pubblico impiego', d: 'Rapporto di lavoro contrattualizzato, accesso e mansioni, responsabilità disciplinare e codice di comportamento (D.Lgs. 165/2001).', fileId: '1VBpaJ3xYwNRP8IlmpYzGwI_wBlELX3ag', img: 'pubblico-impiego' },
      { t: 'Anticorruzione e trasparenza', d: 'PNA, PTPCT e RPCT, obblighi di pubblicazione e accesso civico generalizzato (L. 190/2012, D.Lgs. 33/2013).', fileId: '1lTFYNIeGKfPIyFsvsgO7BArxetuY14O3', img: 'anticorruzione' },
      { t: 'Contratti pubblici', d: 'Soggetti, procedure di affidamento e fasi del contratto, ridotto a ciò che la prova chiede davvero (D.Lgs. 36/2023).', fileId: '17_18pYbyXGMaHPKbQWhomnmH9zQ32hZ5', img: 'contratti-pubblici' },
      { t: 'Contabilità di Stato', d: 'Ciclo del bilancio dello Stato, DEF e rendiconto, controlli e responsabilità contabile (L. 196/2009, art. 81 Cost.).', fileId: '1QyjAE_jcpjXEQo81UHi_wyhzdAfZS7Of', img: 'contabilita-stato' },
      { t: 'Diritto penale — reati contro la PA', d: "Peculato, corruzione, concussione e gli altri reati dei pubblici ufficiali (artt. 314-360 c.p.).", fileId: '1JYC12lazqmpJzHoj2kKFmpVKgYsL2jM1', img: 'diritto-penale' },
      { t: "Diritto dell'Unione europea", d: 'Istituzioni, fonti, principi e rapporto con l\'ordinamento interno (TUE/TFUE).', fileId: '1HNM2JOFDhCtMGOPwrrCgGmLaIEXN6j1l', img: 'diritto-ue' },
      { t: 'CAD — amministrazione digitale', d: 'Identità digitale, domicilio digitale, firme elettroniche, documento informatico e conservazione (D.Lgs. 82/2005).', fileId: '1Ba0pT8gYpeATv80aY8GQvbTsIs0_hV3u', img: 'cad' },
      { t: 'GDPR', d: "Principi, basi giuridiche, diritti dell'interessato, titolare e DPO, data breach (Reg. UE 2016/679).", fileId: '1w7khblxyBsdaN1JjrwEqeewKqoB7UDEg', img: 'gdpr' },
      { t: 'Informatica e ICT', d: 'Hardware e memorie, sistemi operativi, reti, sicurezza e office automation.', fileId: '1nt5SXuLhtHyxGb3Hf-Bq55PVDdoE_qtO', img: 'informatica' },
      { t: 'Sicurezza sul lavoro', d: 'Il D.Lgs. 81/2008 nella parte che la prova chiede: soggetti, obblighi, valutazione dei rischi, emergenze.', fileId: '1KIaQNlA1k-CBSR0rGCND2AKaGZD_KbAs', img: 'sicurezza-lavoro' },
    ],
  },
  {
    key: 'mic-1800-cod02',
    cod: 'MIC',
    nome: 'MIC 1.800 Assistenti — Codice 02',
    tag: 'assistente tecnico per la tutela e la valorizzazione · 300 posti',
    intro:
      'Il profilo tecnico del bando: stessa prova del Codice 01 — 40 quesiti in 60 minuti, soglia 21/30 — ma cinque materie specifiche diverse, che da sole valgono 15 quesiti su 40. I report sono nell\'ordine del dossier: prima le specifiche, poi i situazionali, poi le comuni e gli approfondimenti di diritto amministrativo.',
    reports: [
      { t: 'Metodologie e tecniche dello scavo', d: 'Metodo stratigrafico, documentazione di scavo e archeologia subacquea: 465 quesiti in banca dati, di cui 106 sul subacqueo.', fileId: '1z9VvxHTMe8a6Dx-n9DB8SM77bQC3SdE4', img: 'metodologie-scavo' },
      { t: "Archeologia, storia dell'arte e musei", d: "Dalle civiltà antiche al contemporaneo, con museologia e museografia: la materia più ampia del profilo tecnico.", fileId: '1MzmQLgyiNXPKFrP9Xoju_P9e5FoF0T8K', img: 'archeologia-arte-musei' },
      { t: 'Diritto del patrimonio culturale', d: 'Beni culturali e paesaggistici, tutela e vincoli, circolazione e sanzioni (D.Lgs. 42/2004).', fileId: '1Z4E__ED4y_tHer9YxuGiI0HTORk4s89g', img: 'diritto-patrimonio-culturale' },
      { t: 'Patrimonio culturale italiano', d: 'Musei, siti UNESCO, geografia e storia dell\'arte del patrimonio italiano.', fileId: '1XhHmBtr66_GZ_7efgpIgmwhKBQr8hbiP', img: 'patrimonio-culturale-italiano' },
      { t: 'Struttura e organizzazione del MiC', d: 'Organigramma, direzioni generali, istituti autonomi e soprintendenze: la materia più nozionistica.', fileId: '1Bfz5YhiCEzGCrMA6eGbkAM_mais3m00U', img: 'organizzazione-mic' },
      { t: 'Quesiti situazionali', d: 'La matrice situazione → risposta efficace: otto domande su quaranta, senza penalità per gli errori.', fileId: '1GeMv3V_Yvm7rQ4e7EnbvTQtAHcTTlzFe', img: 'quesiti-situazionali' },
      { t: 'Diritto amministrativo', d: 'Procedimento e fasi, termini, vizi e autotutela, accesso e trasparenza (L. 241/1990).', fileId: '1eszQWZ72lo6vZZsK5JccZjk2yxgd9Pdh', img: 'diritto-amministrativo' },
      { t: "Diritto dell'Unione europea", d: 'Le sette istituzioni, le fonti e i principi, il rapporto con il diritto interno (TUE/TFUE).', fileId: '1280UcwdTiLG9hBrDPsbDo3MungyOYik3', img: 'diritto-ue' },
      { t: 'Informatica e ICT', d: 'Hardware e memorie, sistemi operativi, reti e sicurezza, strumenti da ufficio.', fileId: '1L76tSD94mATpRp-YvTfG90qX3ymqQfyH', img: 'informatica' },
      { t: 'Diritto penale — reati contro la PA', d: "Peculato, corruzione e gli altri reati dei pubblici ufficiali (artt. 314-360 c.p.).", fileId: '1mviZLbGAbinEW3BJThx-Fk3qMjTM2lu6', img: 'diritto-penale' },
      { t: 'Contabilità di Stato', d: 'Ciclo del bilancio e nuovi saldi, rendiconto e controlli (L. 196/2009).', fileId: '18IUvmRy3zkp3ApCM63BrjeU0jPBkao92', img: 'contabilita-stato' },
      { t: 'CAD — amministrazione digitale', d: 'Documento informatico, identità e domicilio digitale, firme e conservazione (D.Lgs. 82/2005).', fileId: '1r6szIZCANUNE-laIhHw_8flCPPEUCYva', img: 'cad' },
      { t: 'Pubblico impiego', d: 'Privatizzazione del rapporto, accesso, responsabilità disciplinare e codice di comportamento (D.Lgs. 165/2001).', fileId: '1anEj6LbHW7vTMrInJA1bT_ZlBkW-TPAU', img: 'pubblico-impiego' },
      { t: 'GDPR e protezione dei dati', d: "Principi, basi giuridiche, diritti dell'interessato, titolare e responsabile, data breach (Reg. UE 2016/679).", fileId: '1O9Lv99uAsx7lf6C5eSYPPS2N3Po4I-EU', img: 'gdpr' },
      { t: 'Contratti pubblici', d: 'Procedure di affidamento, soggetti e fasi del contratto (D.Lgs. 36/2023).', fileId: '16MWzDpIDz6TICcUZJeo9MbwJNZsS1Cym', img: 'contratti-pubblici' },
      { t: 'Anticorruzione e trasparenza', d: 'PNA e PTPCT, RPCT, obblighi di pubblicazione e accesso civico (L. 190/2012, D.Lgs. 33/2013).', fileId: '1O-9Anbum1xq_SjQW6tsSu8G4NHyWXTtI', img: 'anticorruzione' },
    ],
  },
  {
    key: 'difesa-1100-amm',
    cod: 'Altro',
    nome: 'Ministero della Difesa — 1.100 Assistenti amministrativi',
    tag: 'profilo amministrativo · Area Assistenti',
    intro:
      "Se arrivi dal RIPAM 3.997 le materie davvero nuove sono due — l'ordinamento del Ministero della Difesa e il blocco doveri, codice di comportamento e sanzioni disciplinari. Tutto il resto è ripasso, e per questo i report sono in quest'ordine: prima quello che non hai mai studiato.",
    reports: [
      { t: 'Ordinamento del Ministero della Difesa', d: "La materia che altrove non trovi: Consiglio Supremo di Difesa, Stato Maggiore e COVI, Segretario generale e Direttore nazionale degli armamenti, area tecnico-industriale, personale civile e PERSOCIV (D.Lgs. 66/2010).", fileId: '19lAELDs56ajCyfPkVfeuSTVPgpTYLSjd', img: 'ordinamento-difesa' },
      { t: 'Pubblico impiego', d: 'Con dentro il blocco che nel 3.997 era marginale e qui pesa: doveri, codice di comportamento e sanzioni disciplinari (D.Lgs. 165/2001).', fileId: '1PdX2pinVc43JXFjC36n1N-7E51xe8BJx', img: 'pubblico-impiego' },
      { t: 'Diritto amministrativo', d: 'Procedimento, provvedimento, invalidità e accesso (L. 241/1990).', fileId: '1EB8SH0xpxJTK1uwjyBSawULTWvoXg4qm', img: 'diritto-amm' },
      { t: 'Contratti pubblici', d: 'Soggetti, procedure di affidamento e fasi del contratto (D.Lgs. 36/2023).', fileId: '11nQ3nB7n-HxZeNHkKOkjnU-AopTvJ2TQ', img: 'contratti-pubblici' },
      { t: 'Contabilità di Stato', d: 'Ciclo di bilancio, rendiconto, controlli e responsabilità contabile (L. 196/2009).', fileId: '14P4g1givy55cGte-W8W0bhCbHdAASMWS', img: 'contabilita-stato' },
      { t: 'Diritto penale nella PA', d: "I reati contro la pubblica amministrazione: peculato, corruzione, concussione (artt. 314-360 c.p.).", fileId: '10Pb9ev3Sbo61xpm7-Q0I7rARSsT49eO2', img: 'penale-pa' },
      { t: "Diritto dell'Unione Europea", d: 'Istituzioni, fonti e principi, rapporto con l\'ordinamento interno (TUE/TFUE).', fileId: '1_c3gutcRpaq52bcPO0pmeI-CY6lcVDRl', img: 'diritto-ue' },
      { t: 'Anticorruzione e trasparenza', d: 'PNA, PTPCT e RPCT, obblighi di pubblicazione e accesso civico (L. 190/2012, D.Lgs. 33/2013).', fileId: '1T5TTn5bwBf9Kt9q50DsvX1nkcWLkjkUL', img: 'anticorruzione' },
      { t: 'GDPR', d: "Principi, basi giuridiche, diritti dell'interessato e adempimenti del titolare (Reg. UE 2016/679).", fileId: '15lyfdobOMivUBudCPrilp17ga9eWscg5', img: 'gdpr' },
      { t: 'CAD', d: 'Identità e domicilio digitale, firme elettroniche, documento informatico (D.Lgs. 82/2005).', fileId: '1K2Co2ED65ciWQ9HdVqO2p-E5Puo5sW64', img: 'cad' },
      { t: 'Informatica', d: 'Hardware, software, reti e sicurezza informatica di base.', fileId: '1myUtdLSpzrtRsjJkLjLaUU_PZ1FFEIt_', img: 'informatica' },
    ],
  },
]

// Anteprime "sfogliabili" (effetto giornale): set di pagine PNG in
// public/report-cover/<key>/<slug>/p1.png … pN.png. Chiave = key del concorso.
export const SFOGLIABILI = {
  'ripam-3997-amm': { slug: 'pubblico-impiego', titolo: 'Pubblico Impiego', pagine: 12 },
}

export const getConcorso = (key) => REPORT_CONCORSI.find((c) => c.key === key) || null

// Anteprima consegnabile: su Drive (fileId) o pronta e consegnata a mano.
export const hasAnteprima = (r) => !!(r.fileId || r.anteprima)
