// LEZIONI DA ASCOLTARE — catalogo delle serie audio con slide.
//
// Fonte unica della vetrina /lezioni e delle pagine /lezioni/:concorso.
//
// ⚠️ NON dedurre la disponibilità da `avail` in materie.js: quel campo è il
// catalogo del SITO e dice `soon` su serie finite da mesi. Qui ci sono solo
// serie che esistono davvero sul disco di produzione
// (D:\BACKUP-DOWNLOAD-FOLDER-30-4-26\<MATERIA>_NB\video*\), contate file per
// file, con le durate MISURATE con ffprobe il 29/08/2026 — non stimate.
//
// Il nome del prodotto si cambia in UN punto solo: NOME_PRODOTTO qui sotto.
// Storia dei nomi: "video lezioni" (fino al 31/07/2026) → "audio lezioni con
// supporto visivo" (preciso ma nessuno lo dice così) → oggi. Il criterio è il
// caso d'uso che vende davvero: si ascoltano guidando, le slide sono un di più.
export const NOME_PRODOTTO = 'Lezioni da ascoltare'
export const SOTTOTITOLO_PRODOTTO = 'con le slide, se vuoi guardarle'

//  - slug:     chiave stabile (coincide con lo slug materia dove esiste)
//  - materia:  nome mostrato
//  - ep:       numero di episodi REALI
//  - min:      durata totale in minuti (ffprobe)
//  - epMin:    durata media di un episodio, in minuti
//  - anteprima: fileId Drive dell'EP1 intero, pubblico. null = non ancora caricato.
//  - ultimo:   di che tipo è l'ultimo episodio (trabocchetti/simulazione)
export const SERIE = [
  { slug: 'ordinamento-difesa', materia: 'Ordinamento del Ministero della Difesa', ep: 7, min: 275, epMin: 39,
    d: 'Cornice costituzionale, le otto componenti, il vertice militare, Forze armate e personale civile.',
    anteprima: '1hCkxslRS_kHGaiSYVmpKO7EWtLdjndaI', ep1: 'La Patria e il Codice' },
  { slug: 'diritto-amministrativo', materia: 'Diritto amministrativo', ep: 8, min: 260, epMin: 33,
    d: 'La L. 241/1990 dall\'inizio alla fine: procedimento, silenzio, SCIA, conferenza di servizi, accesso.',
    anteprima: '1H08moAzySs8RAWr0uDL65pTsbJcCXRxJ', ep1: 'Dallo Stato opaco alla casa di vetro' },
  { slug: 'diritto-ue', materia: 'Diritto dell\'Unione europea', ep: 8, min: 295, epMin: 37,
    d: 'Dai Trattati alle istituzioni, il primato del diritto UE, le competenze, la Carta dei diritti.',
    anteprima: '1GogtxoCIns7d_N4IURu68ae8qScgzOaZ', ep1: 'L\'Europa che non ti aspetti' },
  { slug: 'contabilita-pubblica', materia: 'Contabilità di Stato', ep: 8, min: 280, epMin: 35,
    d: 'Articolo 81, ciclo di bilancio, i diciotto principi contabili, entrata e spesa, Corte dei conti.',
    anteprima: '1C-Z2g58c5-qZIrn8J4Yjc7viwKR_YFK4', ep1: 'Il fondamento di tutto' },
  { slug: 'contratti-pubblici', materia: 'Contratti pubblici', ep: 8, min: 239, epMin: 30,
    d: 'Il D.Lgs. 36/2023: programmazione e RUP, procedure sopra e sotto soglia, aggiudicazione, esecuzione.',
    anteprima: null, ep1: 'Un nuovo codice per gli appalti' },
  { slug: 'pubblico-impiego', materia: 'Pubblico impiego', ep: 8, min: 235, epMin: 29,
    d: 'Privatizzazione del rapporto, dirigenza e spoils system, concorsi, CCNL, doveri e disciplina.',
    anteprima: null, ep1: 'Dal suddito al contratto' },
  { slug: 'marketing-comunicazione', materia: 'Marketing e comunicazione', ep: 8, min: 362, epMin: 45,
    d: 'La L. 150/2000, URP e ufficio stampa, marketing culturale, social e comunicazione di crisi.',
    anteprima: '1GuQO0g9cGzFqMxSQjSkG6GbGbK3FBXWq', ep1: 'La L. 150 e le tre attività' },
  { slug: 'organizzazione-mic', materia: 'Struttura e organizzazione del MiC', ep: 8, min: 288, epMin: 36,
    d: 'Il Ministero della cultura dall\'interno: direzioni generali, istituti autonomi, soprintendenze.',
    anteprima: null, ep1: 'Il Ministero della Cultura' },
  { slug: 'patrimonio-culturale', materia: 'Patrimonio culturale italiano', ep: 8, min: 292, epMin: 36,
    d: 'Musei e siti UNESCO, pittura, archeologia e paesaggio: l\'Italia che devi saper riconoscere.',
    anteprima: null, ep1: 'L\'Italia museo a cielo aperto' },
  { slug: 'sicurezza-lavoro', materia: 'Sicurezza sul lavoro', ep: 8, min: 332, epMin: 42,
    d: 'Il D.Lgs. 81/2008 per i luoghi della cultura: obblighi, deleghe, emergenza, sorveglianza sanitaria.',
    anteprima: null, ep1: 'La sicurezza non è un optional' },
  { slug: 'beni-culturali', materia: 'Diritto del patrimonio culturale', ep: 8, min: 319, epMin: 40,
    d: 'Il Codice dei beni culturali (D.Lgs. 42/2004): tutela, vincoli, autorizzazioni, circolazione, sanzioni.',
    anteprima: null, ep1: 'Il patrimonio della nazione' },
  { slug: 'diritto-penale-pa', materia: 'Diritto penale — reati contro la PA', ep: 7, min: 267, epMin: 38,
    d: 'Peculato, corruzione, concussione: i reati del pubblico ufficiale, con l\'abuso d\'ufficio abrogato nel 2024.',
    anteprima: null, ep1: 'Il codice dei colletti bianchi', incompleta: 'manca l\'ultimo episodio' },
]

// I bandi, con le serie che li riguardano (ordine = peso nella prova).
// `key` combacia con report-concorsi.js dove il bando esiste anche lì, così i
// due cataloghi si possono linkare a vicenda.
export const LEZIONI_CONCORSI = [
  {
    key: 'mic-1800-cod01',
    cod: 'MIC',
    nome: 'MIC 1.800 Assistenti — Codice 01',
    tag: 'tutela, accoglienza e vigilanza · 1.500 posti',
    intro: 'Le quattro materie specifiche del Codice 01 valgono 15 quesiti su 40 — e sono quelle che non trovi in nessun altro concorso. Ci sono tutte.',
    serie: ['organizzazione-mic', 'beni-culturali', 'patrimonio-culturale', 'marketing-comunicazione',
            'sicurezza-lavoro', 'diritto-amministrativo', 'pubblico-impiego', 'contratti-pubblici', 'diritto-ue'],
  },
  {
    key: 'difesa-1100-amm',
    cod: 'RIPAM',
    nome: 'RIPAM 1.100 Ministero della Difesa',
    tag: 'profilo amministrativo',
    intro: 'L\'ordinamento della Difesa è la materia che si trova solo qui: nessun manuale da libreria la copre come la chiede questo bando.',
    serie: ['ordinamento-difesa', 'diritto-amministrativo', 'diritto-ue', 'contabilita-pubblica',
            'contratti-pubblici', 'pubblico-impiego', 'diritto-penale-pa'],
  },
  {
    key: 'ripam-3997-amm',
    cod: 'RIPAM',
    nome: 'RIPAM 3.997 Assistenti Amministrativi',
    tag: '14 Amministrazioni · Funzioni Centrali',
    intro: 'Le materie comuni del comparto: le studi una volta e ti contano su tutti i concorsi RIPAM che farai.',
    serie: ['diritto-amministrativo', 'pubblico-impiego', 'contratti-pubblici', 'diritto-ue',
            'contabilita-pubblica', 'diritto-penale-pa'],
  },
  {
    key: 'inps-1695-pecs',
    cod: 'INPS',
    nome: 'INPS 1.695 Funzionari PECS',
    tag: 'Progettazione, Erogazione e Controllo dei Servizi',
    intro: 'La parte di organizzazione e funzionamento della PA, in lezioni da ascoltare mentre fai altro.',
    serie: ['diritto-amministrativo', 'pubblico-impiego', 'contratti-pubblici', 'contabilita-pubblica'],
  },
]

export const getSerie = (slug) => SERIE.find((s) => s.slug === slug) || null
export const getConcorsoLezioni = (key) => LEZIONI_CONCORSI.find((c) => c.key === key) || null
export const serieDi = (c) => c.serie.map(getSerie).filter(Boolean)

// "4h 35" — il formato con cui i candidati ragionano (quanto dura un viaggio).
export const durata = (min) => {
  const h = Math.floor(min / 60)
  const m = min % 60
  return h ? `${h}h ${String(m).padStart(2, '0')}` : `${m} min`
}
export const totaleOre = (serie) => durata(serie.reduce((a, s) => a + s.min, 0))
export const totaleEp = (serie) => serie.reduce((a, s) => a + s.ep, 0)
