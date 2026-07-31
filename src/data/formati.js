export const FORMATI = [
  {
    k:'pod', ico:'🎙️',
    t:'Serie Podcast',
    short:'Podcast dialogato, 8 episodi',
    desc:'Serie podcast in stile NotebookLM: due voci che discutono la materia in modo accessibile. ~3 ore totali, con trascrizioni. Per ascolto rilassato in auto, palestra, passeggiata.',
    fmt:'MP3 + TXT', label:'Podcast', price:29
  },
  {
    // NB: la chiave resta 'vid' (è usata come chiave di `avail` in materie.js e
    // dei blocchi in contenuti.js). Cambia solo il nome pubblico: non erano
    // "video lezioni", sono audio lezioni con supporto visivo.
    k:'vid', ico:'🎥',
    t:'Audio Lezioni con Supporto Visivo',
    short:'8 episodi audio + visivo',
    desc:'Gli 8 episodi della materia letti per intero, con il supporto visivo che accompagna l\'ascolto (slide dei punti chiave, riferimenti normativi a schermo) e i sottotitoli SRT. Per studiare guardando, non solo ascoltando.',
    fmt:'MP4 + SRT', label:'Audio Lezioni con Supporto Visivo', price:35
  },
  {
    k:'rep', ico:'📄',
    t:'Report di Studio',
    short:'Dispensa PDF sul tuo concorso',
    desc:'La dispensa costruita sul programma del tuo bando: sezioni, punti dove si sbaglia più spesso, quiz commentati. Nasce da una base di conoscenza su fonti ufficiali e, dove esiste una banca dati, dalle domande già uscite nelle prove.',
    fmt:'PDF', label:'Report', price:29
  },
  {
    k:'man', ico:'📚',
    t:'Manuale Completo',
    short:'Manuale editoriale premium',
    desc:'Un manuale editoriale 200-300 pagine. Tabelle, FAQ, quiz per capitolo. Livello libreria.',
    fmt:'PDF + HTML', label:'Manuale Completo', price:39
  },
  {
    k:'sim', ico:'🎯',
    t:'Simulatore Custom',
    short:'1.000 domande su misura',
    desc:'1.000 domande HTML offline cucite sul tuo concorso. Scegli tu da quali materie pescare e in che proporzione (es. 300 Diritto Amm + 200 Penale + 500 trasversali) e se le vuoi concettuali, specifiche o miste.',
    fmt:'HTML', label:'Simulatore Custom', price:39
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
    desc:'Podcast, audio lezioni con supporto visivo, report, manuali e simulatori costruiti con AI su normativa ufficiale. Per ogni materia, ogni concorso, ogni esigenza.',
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
    t:'Simulatore White-Label',
    desc:'Versione professionale del simulatore: 1.000+ domande personalizzate sui tuoi argomenti, con brand, logo e stile grafico tuoi. Per corsi di formazione, associazioni, ordini professionali, scuole di preparazione. Funziona ovunque, senza installazione.',
    examples:['Per corsi di formazione','Per aziende e PA','Per ordini professionali','Per scuole di preparazione']
  },
  {
    k:'conversion',
    ico:'🔄',
    t:'Conversione contenuti',
    desc:'Testo → podcast audio, audio → trascrizione testuale. Servizi di trasformazione dei tuoi materiali esistenti in nuovi formati studiabili.',
    examples:['Dispense in podcast','Audio-lezioni in testo','Appunti vocali in note organizzate','Video in testo']
  }
]

export const CONCORSI = ['RIPAM','INPS','MIC','FUNZ','MIMIT','ISAC','CPI','REG']

export const BUNDLES = [
  {
    slug:'materia-completa',
    tag:'MATERIA COMPLETA',
    title:'I 4 formati di una materia',
    desc:'Podcast + Audio Lezioni con Supporto Visivo + Report + Manuale, integrati sulla stessa materia. Il percorso di studio totale su un argomento.',
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
