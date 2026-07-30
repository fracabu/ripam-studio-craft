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
      { t: 'Diritto Penale', d: "I reati contro la PA: peculato, corruzione, abuso d'ufficio (artt. 314-360 c.p.).", fileId: null, img: 'diritto-penale' },
      { t: 'Diritto UE', d: "Fonti, istituzioni, principi e rapporto con l'ordinamento italiano (TUE/TFUE).", fileId: '1Vx96Pv-1rpD08Xadih8GPJA7l6WV_M4C', img: 'diritto-ue' },
      { t: 'Contabilità di Stato', d: 'Ciclo di bilancio, DEF, rendiconto, controlli (L. 196/2009, art. 81 Cost.).', fileId: '1Nr7vzOJ9LL3EhnL4tU8JMdLNgkP1hoXU', img: 'contabilita-stato' },
      { t: 'CAD', d: 'Identità digitale, domicilio digitale, firme elettroniche, PDND (D.Lgs. 82/2005).', fileId: '1coPfbJP-kA5s02vYHCR9U6nrEi4NbSLz', img: 'cad' },
      { t: 'GDPR', d: "Principi, basi giuridiche, diritti dell'interessato, adempimenti del titolare (Reg. UE 2016/679).", fileId: null, img: 'gdpr' },
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
]

// Anteprime "sfogliabili" (effetto giornale): set di pagine PNG in
// public/report-cover/<key>/<slug>/p1.png … pN.png. Chiave = key del concorso.
export const SFOGLIABILI = {
  'ripam-3997-amm': { slug: 'pubblico-impiego', titolo: 'Pubblico Impiego', pagine: 12 },
}

export const getConcorso = (key) => REPORT_CONCORSI.find((c) => c.key === key) || null

// Anteprima consegnabile: su Drive (fileId) o pronta e consegnata a mano.
export const hasAnteprima = (r) => !!(r.fileId || r.anteprima)
