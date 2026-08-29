// INDICE DI RICERCA — una sola fonte, costruita dai dati che già esistono.
//
// Perché così: se l'indice fosse un elenco scritto a mano, alla terza materia
// nuova sarebbe già vecchio. Qui si genera da materie.js, report-concorsi.js e
// lezioni.js all'avvio dell'app: aggiungi una materia e compare anche nella
// ricerca, senza toccare niente.
//
// Voci: materia · bando (report) · serie di lezioni · report singolo · pagina.
// Ogni voce ha un `to` (rotta interna) o un `href` (link esterno).
import { MATERIE } from './materie.js'
import { REPORT_CONCORSI } from './report-concorsi.js'
import { LEZIONI_CONCORSI, SERIE, NOME_PRODOTTO } from './lezioni.js'

// "Contabilità" e "contabilita" devono trovarsi a vicenda: chi cerca da telefono
// non mette gli accenti, e chi copia-incolla dal bando li mette tutti.
export const norm = (s) =>
  String(s || '')
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/['’`]/g, ' ')
    .replace(/[^a-z0-9\s.-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

// Le pagine che non nascono da un elenco di dati.
const PAGINE = [
  { t: 'Piano di studio su misura', d: 'Gratuito: mi dici bando, ore e materie scoperte, ti mando il calendario in PDF.', to: '/piano-studio', k: 'piano calendario gratis studio programma settimane' },
  { t: 'Anteprime gratuite', d: 'Iscriviti e ricevi gli estratti dei report e il primo episodio delle lezioni.', to: '/newsletter', k: 'newsletter anteprima estratto gratis iscrizione' },
  { t: 'RIPAM Studio Quiz Pro', d: 'Quiz generati dagli articoli di legge. Credenziali gratuite su richiesta.', to: '/quiz-pro', k: 'quiz simulazione allenamento credenziali gratis' },
  { t: 'Coaching NotebookLM', d: 'Impari a usare l’AI per studiare: sessioni individuali.', to: '/coaching', k: 'coaching notebooklm ai lezione individuale' },
  { t: 'Tool su misura', d: 'Simulatori e strumenti costruiti sul tuo concorso.', to: '/tool', k: 'tool simulatore strumento software su misura' },
  { t: 'Scrivimi', d: 'Dimmi cosa ti serve: rispondo entro 6-24 ore.', to: '/scrivimi', k: 'contatto mail domanda aiuto richiesta' },
  { t: 'Chi sono', d: 'Chi c’è dietro Ripam Studio Craft e come nascono i materiali.', to: '/chi-sono', k: 'chi sono about francesco autore' },
]

// Risorse gratuite esterne: sono il primo passo della scala, vanno trovate.
const ESTERNE = [
  { t: 'ripamstudio.it — report e riassunti gratis', d: 'Report di studio, riassunti, decaloghi e flashcard su una cinquantina di materie.', href: 'https://www.ripamstudio.it/', k: 'gratis free riassunti decaloghi flashcard report' },
  { t: 'RIPAM Studio Logica', d: 'Allenamento cronometrato su logica e ragionamento.', href: 'https://ripam-studio-logica.vercel.app/', k: 'logica ragionamento deduttivo serie numeriche gratis' },
]

const vociMaterie = () => MATERIE.map((m) => ({
  tipo: 'materia',
  t: m.t,
  d: m.intro,
  to: `/materia/${m.slug}`,
  k: [m.slug, m.norm, ...(m.c || []), ...(m.topics || [])].join(' '),
}))

const vociBandi = () => REPORT_CONCORSI.map((c) => ({
  tipo: 'concorso',
  t: c.nome,
  d: `${c.reports.length} report di studio · ${c.tag}`,
  to: `/report-custom/${c.key}`,
  k: [c.key, c.cod, c.tag, ...c.reports.map((r) => r.t)].join(' '),
}))

const vociReport = () =>
  REPORT_CONCORSI.flatMap((c) =>
    c.reports.map((r) => ({
      tipo: 'report',
      t: `${r.t} — report`,
      d: `${r.d} (${c.nome})`,
      to: `/report-custom/${c.key}`,
      k: [r.t, c.nome, c.cod, c.key].join(' '),
    }))
  )

const vociLezioni = () => SERIE.map((s) => {
  // La serie si apre sulla pagina del primo bando che la contiene: è il contesto
  // in cui ha senso, e da lì si raggiungono gli altri con i chip.
  const c = LEZIONI_CONCORSI.find((x) => x.serie.includes(s.slug))
  return {
    tipo: 'lezioni',
    t: `${s.materia} — ${NOME_PRODOTTO.toLowerCase()}`,
    d: `${s.ep} episodi · ${s.d}`,
    to: c ? `/media/${c.key}` : '/media',
    k: [s.slug, s.materia, 'audio', 'video', 'podcast', 'ascoltare', 'lezioni', s.ep1].join(' '),
  }
})

// L'ordine dei tipi è l'ordine in cui compaiono a parità di punteggio: prima
// dove si atterra bene (concorso, pagina), poi il dettaglio.
export const PESO_TIPO = { concorso: 0, pagina: 1, materia: 2, lezioni: 3, report: 4, esterna: 5 }

export const INDICE = [
  ...vociBandi(),
  ...PAGINE.map((p) => ({ ...p, tipo: 'pagina' })),
  ...vociMaterie(),
  ...vociLezioni(),
  ...vociReport(),
  ...ESTERNE.map((e) => ({ ...e, tipo: 'esterna' })),
].map((v) => ({ ...v, _n: norm(`${v.t} ${v.d} ${v.k || ''}`), _t: norm(v.t) }))

export const ETICHETTA_TIPO = {
  concorso: 'Concorso',
  pagina: 'Pagina',
  materia: 'Materia',
  lezioni: 'Lezioni',
  report: 'Report',
  esterna: 'Gratis',
}

// Punteggio: più è "all'inizio del titolo", più sale. Tutte le parole cercate
// devono comparire da qualche parte (AND), altrimenti "contabilità difesa"
// restituirebbe mezzo catalogo.
const punteggio = (voce, parole) => {
  let p = 0
  for (const w of parole) {
    if (!voce._n.includes(w)) return 0
    if (voce._t.startsWith(w)) p += 12
    else if (new RegExp(`\\b${w}`).test(voce._t)) p += 8
    else if (voce._t.includes(w)) p += 5
    else p += 2
  }
  return p - PESO_TIPO[voce.tipo]
}

export const cerca = (q, limite = 12) => {
  const parole = norm(q).split(' ').filter((w) => w.length >= 2)
  if (!parole.length) return []
  return INDICE
    .map((v) => ({ v, p: punteggio(v, parole) }))
    .filter((x) => x.p > 0)
    .sort((a, b) => b.p - a.p)
    .slice(0, limite)
    .map((x) => x.v)
}

// Suggerimenti a campo vuoto: le strade che vogliamo far prendere per prime.
export const SCORCIATOIE = [
  { t: 'Il mio concorso', to: '/report-custom' },
  { t: NOME_PRODOTTO, to: '/media' },
  { t: 'Piano di studio gratis', to: '/piano-studio' },
  { t: 'Anteprime gratuite', to: '/newsletter' },
]
