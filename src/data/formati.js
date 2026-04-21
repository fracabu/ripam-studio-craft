export const FORMATI = [
  {
    k:'pod', ico:'🎙️',
    t:'Serie Podcast',
    short:'Audio podcast, 8 episodi',
    desc:'8 episodi audio, ~3 ore totali. Generati con TTS professionale da testi normativi ufficiali. Trascrizioni testuali incluse. Ideale per studiare in mobilità.',
    fmt:'MP3 + TXT', label:'Podcast', price:19
  },
  {
    k:'vid', ico:'🎥',
    t:'Serie Video',
    short:'Video lezioni, 8 episodi',
    desc:'8 episodi video con stessa struttura del podcast in formato visivo. Sottotitoli SRT inclusi. Perfetto per ripasso e studio visivo.',
    fmt:'MP4 + SRT', label:'Video', price:19
  },
  {
    k:'rep', ico:'📄',
    t:'Report di Studio',
    short:'Dispensa PDF studio-ready',
    desc:'PDF strutturato: sintesi normativa, punti chiave, trabocchetti frequenti, tavole riassuntive. Aggiornato 2026.',
    fmt:'PDF', label:'Report', price:9
  },
  {
    k:'sim', ico:'🎯',
    t:'Simulatore Custom',
    short:'500 domande su misura',
    desc:'500 domande in stile concorso — mix bilanciato di quesiti concettuali e specifici, cuciti su misura per te. HTML offline con spiegazioni, errore comune e riferimento normativo per ogni domanda.',
    fmt:'HTML', label:'Simulatore Custom', price:29
  }
]

export const SERVIZI = [
  {
    k:'t2a', ico:'🎧',
    t:'Testo → Podcast',
    short:'Trasformo il tuo testo in audio',
    desc:'Mi mandi un PDF, Markdown o testo. Te lo restituisco come podcast: voce singola o dialogo a due voci.',
    fmt:'MP3 · 128kbps',
    price:'indicativo: 5€ / 1.000 parole',
    priceNote:'preventivo finale su misura',
    label:'Servizio: Testo → Podcast'
  },
  {
    k:'a2t', ico:'📝',
    t:'Audio → Testo',
    short:'Trascrizione pulita e formattata',
    desc:'Mi mandi una registrazione (lezione, nota vocale, audio-lezione). Te la restituisco trascritta in testo pulito e formattato.',
    fmt:'TXT · Markdown · PDF',
    price:'indicativo: 15€ / ora audio',
    priceNote:'preventivo finale su misura',
    label:'Servizio: Audio → Testo'
  }
]

export const PILASTRI = [
  {
    k:'formazione',
    ico:'📚',
    t:'Formazione',
    lead:'Materiali didattici multicanale',
    desc:'Podcast, video, report e simulatori costruiti con AI su normativa ufficiale. Per ogni materia, ogni concorso, ogni esigenza.',
    anchor:'#materie',
    cta:'Vedi le materie →',
    accent:'acid'
  },
  {
    k:'consulenza',
    ico:'💡',
    t:'Consulenza',
    lead:'Coaching NotebookLM 1:1',
    desc:'Un\'ora con me in videochiamata: ti insegno come alimentare NotebookLM per la tua materia, come scrivere i prompt giusti, come arrivare al risultato.',
    anchor:'#coaching',
    cta:'Scopri il coaching →',
    accent:'pink'
  },
  {
    k:'sviluppo',
    ico:'🛠️',
    t:'Sviluppo tool',
    lead:'Web app e strumenti su misura',
    desc:'Web app dedicate a una singola materia, simulatori custom, dashboard di studio, strumenti di conversione: dalla tua idea al prodotto finito.',
    anchor:'#tools',
    cta:'Scopri gli strumenti →',
    accent:'blue'
  }
]

export const TOOLS = [
  {
    k:'webapp',
    ico:'📱',
    t:'Web App Mono-Materia',
    desc:'Un\'applicazione web dedicata a una sola materia: quiz adattivi, flashcard, glossario, normativa aggiornata, tracking progressi. Per singolo utente, gruppo studio o ente/associazione in white-label.',
    examples:['Diritto Amministrativo App','GDPR Compliance App','CAD App','Contratti Pubblici App']
  },
  {
    k:'simulator',
    ico:'🎯',
    t:'Simulatore Custom',
    desc:'500 domande in stile concorso, cucite sui tuoi argomenti. HTML offline personalizzato con il tuo brand, logo, stile grafico. Funziona ovunque, senza installazione.',
    examples:['Per singoli candidati','Per corsi di formazione','Per aziende e PA','Per ordini professionali']
  },
  {
    k:'conversion',
    ico:'🔄',
    t:'Conversione contenuti',
    desc:'Testo → podcast audio, audio → trascrizione testuale. Servizi di trasformazione dei tuoi materiali esistenti in nuovi formati studiabili.',
    examples:['Dispense in podcast','Audio-lezioni in testo','Appunti vocali in note organizzate','Video in testo']
  }
]

export const CONCORSI = ['RIPAM','MIC','FUNZ','MIMIT','ISAC','CPI']

export const BUNDLES = [
  {
    slug:'materia-completa',
    tag:'MATERIA COMPLETA',
    title:'I 4 formati di una materia',
    desc:'Podcast + Video + Report + Simulatore, integrati sulla stessa materia. Il percorso di studio totale su un argomento.',
    note:'modulabile sul taglio che preferisci',
    accent:'acid'
  },
  {
    slug:'concorso',
    tag:'CONCORSO INTERO',
    title:'Concorso intero',
    desc:'Tutte le materie di un singolo concorso (RIPAM, MIC, FUNZ, MIMIT, ISAC, CPI), nei formati che scegli. Preparazione completa da zero.',
    note:'scegli formati e priorità insieme a me',
    accent:'pink'
  }
]
