export const FORMATI = [
  {
    k:'pod', ico:'🎙️',
    t:'Serie Podcast',
    short:'Podcast dialogato, 8 episodi',
    desc:'Serie podcast in stile NotebookLM: due voci che discutono la materia in modo accessibile. ~3 ore totali, con trascrizioni. Per ascolto rilassato in auto, palestra, passeggiata.',
    fmt:'MP3 + TXT', label:'Podcast', price:19
  },
  {
    k:'aul', ico:'🎧',
    t:'Audio Lezioni',
    short:'Lezioni audio, 8 episodi',
    desc:'Lettura integrale degli episodi testuali (~30.000 parole a episodio). Monovoce didattica, ~4 ore totali, con trascrizioni. Per studio strutturato e ripasso.',
    fmt:'MP3 + TXT', label:'Audio Lezioni', price:19
  },
  {
    k:'vid', ico:'🎥',
    t:'Serie Video',
    short:'Video lezioni, 8 episodi',
    desc:'Le stesse lezioni in formato visivo, con sottotitoli SRT. Per un ripasso rapido.',
    fmt:'MP4 + SRT', label:'Video', price:19
  },
  {
    k:'rep', ico:'📄',
    t:'Report di Studio',
    short:'Dispensa PDF sintetica',
    desc:'La sintesi essenziale in PDF: punti chiave, trabocchetti, tavole riassuntive. Ripasso veloce.',
    fmt:'PDF', label:'Report', price:9
  },
  {
    k:'man', ico:'📚',
    t:'Manuale Completo',
    short:'Manuale editoriale premium',
    desc:'Un manuale editoriale 200-300 pagine. Tabelle, FAQ, quiz per capitolo. Livello libreria.',
    fmt:'PDF + HTML', label:'Manuale Completo', price:19
  },
  {
    k:'sim', ico:'🎯',
    t:'Simulatore Custom',
    short:'500 domande su misura',
    desc:'500 domande stile concorso, cucite su misura. HTML offline, funziona ovunque.',
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
    anchor:'#contatti',
    cta:'Parliamone →',
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
    title:'I 5 formati di una materia',
    desc:'Podcast + Audio Lezioni + Video + Report + Simulatore, integrati sulla stessa materia. Il percorso di studio totale su un argomento.',
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
