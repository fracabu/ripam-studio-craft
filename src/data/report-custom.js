// REPORT DI STUDIO SU MISURA — mappa slug materia -> report custom pronto.
//
// Sono i report "ripasso veloce" (schemi a 2 colonne, tabelle, trabocchetti):
// li mostriamo nel tab REPORT della pagina /materia/:slug al posto dei vecchi
// report NotebookLM. Fonte unica anche per la vetrina /report-custom.
//
//  - cover:       basename PNG in public/report-cover/<concorsoKey>/<cover>.png
//                 (pagina 1 del PDF report renderizzata). Può differire dallo slug.
//  - fileId:      PDF anteprima su Drive (ANTEPRIME/report-custom/...). null = non
//                 ancora caricato su Drive (anteprima non consegnabile in automatico).
//  - sezioni/trabocchetti/quiz: dati presi dalla copertina del report.
//
// Popolato con i 10 report RIPAM 3.997 Assistenti (profilo AMM). Man mano che
// arrivano gli altri profili (Funzionari, INPS, ecc.) si aggiungono qui.
export const REPORT_CUSTOM = {
  'diritto-amministrativo': {
    concorso: 'RIPAM 3.997 Assistenti', concorsoKey: 'ripam-3997-amm',
    cover: 'diritto-amministrativo', fileId: '1uf8RHgTVGvw0GwutsyYQdFepBaryzOxM',
    sezioni: 24, trabocchetti: 50, quiz: 75,
    desc: 'Procedimento, provvedimento, invalidità, accesso e processo amministrativo (L. 241/1990).',
  },
  'pubblico-impiego': {
    concorso: 'RIPAM 3.997 Assistenti', concorsoKey: 'ripam-3997-amm',
    cover: 'pubblico-impiego', fileId: '1ZX6VFpaSBN1RAvB3sfSwYT1etNOzV6aA',
    sezioni: 25, trabocchetti: 30, quiz: 50,
    desc: 'Costituzione del rapporto, responsabilità, codice di comportamento, sanzioni disciplinari (D.Lgs. 165/2001).',
  },
  'contratti-pubblici': {
    concorso: 'RIPAM 3.997 Assistenti', concorsoKey: 'ripam-3997-amm',
    cover: 'contratti-pubblici', fileId: '1AGrmmFR70ay54H8FImQoUepOTGI-u8vP',
    sezioni: 18, trabocchetti: 30, quiz: 40,
    desc: 'Soggetti, procedure di affidamento, fasi del contratto (D.Lgs. 36/2023).',
  },
  'diritto-penale-pa': {
    concorso: 'RIPAM 3.997 Assistenti', concorsoKey: 'ripam-3997-amm',
    cover: 'diritto-penale', fileId: null,
    sezioni: 12, trabocchetti: 30, quiz: 40,
    desc: "I reati contro la PA: peculato, corruzione, abuso d'ufficio (artt. 314-360 c.p.).",
  },
  'diritto-ue': {
    concorso: 'RIPAM 3.997 Assistenti', concorsoKey: 'ripam-3997-amm',
    cover: 'diritto-ue', fileId: '1Vx96Pv-1rpD08Xadih8GPJA7l6WV_M4C',
    sezioni: 26, trabocchetti: 42, quiz: 65,
    desc: "Fonti, istituzioni, principi e rapporto con l'ordinamento italiano (TUE/TFUE).",
  },
  'contabilita-pubblica': {
    concorso: 'RIPAM 3.997 Assistenti', concorsoKey: 'ripam-3997-amm',
    cover: 'contabilita-stato', fileId: '1Nr7vzOJ9LL3EhnL4tU8JMdLNgkP1hoXU',
    sezioni: 18, trabocchetti: 30, quiz: 40,
    desc: 'Ciclo di bilancio, DEF, rendiconto, controlli (L. 196/2009, art. 81 Cost.).',
  },
  'cad': {
    concorso: 'RIPAM 3.997 Assistenti', concorsoKey: 'ripam-3997-amm',
    cover: 'cad', fileId: '1coPfbJP-kA5s02vYHCR9U6nrEi4NbSLz',
    sezioni: 27, trabocchetti: 50, quiz: 95,
    desc: 'Identità digitale, domicilio digitale, firme elettroniche, PDND (D.Lgs. 82/2005).',
  },
  'gdpr': {
    concorso: 'RIPAM 3.997 Assistenti', concorsoKey: 'ripam-3997-amm',
    cover: 'gdpr', fileId: null,
    sezioni: 26, trabocchetti: 45, quiz: 65,
    desc: "Principi, basi giuridiche, diritti dell'interessato, adempimenti del titolare (Reg. UE 2016/679).",
  },
  'informatica': {
    concorso: 'RIPAM 3.997 Assistenti', concorsoKey: 'ripam-3997-amm',
    cover: 'informatica', fileId: '16ouxwSREj2Ie67DY4DesbV7uMrWWFki9',
    sezioni: 18, trabocchetti: 30, quiz: 25,
    desc: 'Hardware, software, reti e sicurezza informatica di base.',
  },
  'ordinamento-pa': {
    concorso: 'RIPAM 3.997 Assistenti', concorsoKey: 'ripam-3997-amm',
    cover: 'ordinamento-amministrazioni', fileId: '1aTrEAhc0QmTOO5qks0KWX1IpxyYLRF5n',
    sezioni: 11, trabocchetti: 30, quiz: 40,
    desc: 'Assetto delle PA centrali, organi costituzionali, D.Lgs. 300/1999.',
  },
}

export const getReportCustom = (slug) => REPORT_CUSTOM[slug] || null
