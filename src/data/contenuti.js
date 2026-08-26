// Indice dettagliato dei contenuti per materia.
// Se una materia manca qui, Materia.vue usa il fallback dai topics.
//
// Struttura:
//   pod: { total, episodes:[{n,title,duration,free?}] }
//   aul: { total, episodes:[{n,title,duration,free?}] }
//   vid: { total, episodes:[{n,title,duration,free?}] }
//   rep: { total, chapters:[string] }
//   man: { total, chapters:[string] }
//   sim: { total, breakdown:[{topic,count}] }

export const CONTENUTI = {
  'pubblico-impiego': {
    pod: {
      total: '8 episodi · 3h 24min',
      episodes: [
        { n:1, title:'Panoramica privatizzazione', duration:'31:42', free:true, preview:'/preview/pubblico-impiego/pod-ep1.mp3' },
        { n:2, title:'Chi comanda gestione', duration:'22:20' },
        { n:3, title:'Dirigenza', duration:'18:00' },
        { n:4, title:'Accesso concorsi', duration:'24:51' },
        { n:5, title:'Contrattazione ARAN', duration:'33:32' },
        { n:6, title:'Doveri sanzioni', duration:'17:04' },
        { n:7, title:'Incompatibilità pantouflage', duration:'29:55' },
        { n:8, title:'Trabocchetti', duration:'27:31' }
      ]
    },
    aul: {
      total: '8 episodi · 3h 55min',
      episodes: [
        { n:1, title:'Dal suddito al contratto',              duration:'30 min', free:true, preview:'/preview/pubblico-impiego/aul-ep1.mp3' },
        { n:2, title:'Il potere dei dirigenti',               duration:'29 min' },
        { n:3, title:'Entrare nello Stato',                   duration:'29 min' },
        { n:4, title:'Il contratto che governa',              duration:'29 min' },
        { n:5, title:'Il codice del dipendente',              duration:'29 min' },
        { n:6, title:'I confini del dipendente',              duration:'28 min' },
        { n:7, title:'Il quadro completo',                    duration:'29 min' },
        { n:8, title:'Simulazione d\'esame — 30 domande',     duration:'33 min' }
      ]
    },
    rep: {
      total: '10 capitoli · ~95 pagine',
      chapters: [
        'Panoramica generale',
        'Organizzazione uffici',
        'Dirigenza',
        'Accesso reclutamento',
        'Contrattazione',
        'Doveri disciplina',
        'Incompatibilità',
        'Trabocchetti',
        'Collegamenti',
        'Riepilogo pre-esame'
      ]
    },
    man: {
      total: '239 pagine · 22 capitoli',
      chapters: [
        'Principi generali e fonti del pubblico impiego',
        'Organizzazione degli uffici, URP e trasparenza',
        'Piano dei fabbisogni e dotazione organica',
        'La dirigenza pubblica: ruoli, funzioni e responsabilità',
        'Accesso al pubblico impiego e reclutamento',
        'Contrattazione collettiva, ARAN e rapporti sindacali',
        'Il procedimento disciplinare: forme, termini e competenze',
        'Le sanzioni disciplinari e il licenziamento',
        'Falsa attestazione della presenza in servizio',
        'Il Codice di comportamento: regali, conflitto di interessi e obblighi di astensione',
        'Il Codice di comportamento: prevenzione corruzione, rapporto con il pubblico e trasparenza',
        'Il Codice di comportamento: definizione, vigilanza, formazione e sanzioni',
        'Il Codice di comportamento: principi generali e doveri del dipendente',
        'Doveri, obblighi, incompatibilità e segnalazione di illeciti',
        'Mansioni, inquadramento e jus variandi',
        'Mobilità e trasferimenti del personale',
        'Contratti flessibili: tempo determinato, somministrazione e lavoro flessibile',
        'Trattamento economico e performance',
        'Pari opportunità, CUG e gestione delle risorse umane',
        'Aspettative, permessi e assenze del dipendente',
        'Responsabilità del dipendente pubblico',
        'Giurisdizione e controversie di lavoro pubblico'
      ]
    }
  },
  'contabilita-pubblica': {
    pod: {
      total: '8 episodi · 3h 17min',
      episodes: [
        { n:1, title:'Come funziona davvero il bilancio statale', duration:'23:50', free:true },
        { n:2, title:'Come funziona il bilancio dello Stato', duration:'22:07' },
        { n:3, title:'Come lo Stato evita la bancarotta', duration:'32:00' },
        { n:4, title:'Come lo Stato finanzia le leggi', duration:'24:00' },
        { n:5, title:'Il sistema operativo dello Stato italiano', duration:'21:12' },
        { n:6, title:'L\'architettura invisibile dei conti dello Stato', duration:'29:27' },
        { n:7, title:'La logica della legge 196 del 2009', duration:'23:41' },
        { n:8, title:'Logica e scadenze della legge 196', duration:'21:22' }
      ]
    },
    aul: {
      total: '8 episodi · 4h 33min',
      episodes: [
        { n:1, title:'Il fondamento di tutto',                duration:'30 min', free:true, preview:'/preview/contabilita-pubblica/aul-ep1.mp3' },
        { n:2, title:'Il nuovo ciclo di bilancio',            duration:'30 min' },
        { n:3, title:'La mappa del tesoro',                   duration:'29 min' },
        { n:4, title:'Le regole d\'oro',                      duration:'28 min' },
        { n:5, title:'Il viaggio del denaro pubblico',        duration:'35 min' },
        { n:6, title:'Il muro della copertura',               duration:'37 min' },
        { n:7, title:'I guardiani dei conti',                 duration:'39 min' },
        { n:8, title:'Simulazione d\'esame — 30 domande',     duration:'45 min' }
      ]
    },
    rep: {
      total: '11 capitoli · ~95 pagine',
      chapters: [
        'Panoramica generale',
        'Ciclo programmazione',
        'Bilancio struttura',
        'Gestione bilancio',
        'Tesoreria rendiconto',
        'Copertura finanziaria',
        'Controlli monitoraggio',
        'Trabocchetti',
        'Collegamenti normativi',
        'Collegamenti extra',
        'Riepilogo pre-esame'
      ]
    },
    man: {
      total: '235 pagine · 25 capitoli',
      chapters: [
        'Nozioni generali di contabilità pubblica e concetti economici',
        'Principi contabili generali (L. 196/2009)',
        'Il principio dell\'integrità e dell\'universalità',
        'Strumenti della programmazione finanziaria e ciclo di bilancio',
        'Il Documento di Finanza Pubblica (DFP)',
        'Il Documento Programmatico di Finanza Pubblica (DPFP)',
        'Il bilancio di previsione dello Stato: struttura e classificazione',
        'Contenuto del disegno di legge di bilancio: sezioni, note e allegati',
        'Missioni, programmi e classificazione delle spese dello Stato',
        'Classificazione delle entrate per Titoli e Categorie',
        'Saldi di bilancio e quadro generale riassuntivo',
        'Fondi di riserva e fondi speciali',
        'Copertura finanziaria delle leggi di spesa',
        'Le fasi della gestione delle entrate',
        'Le fasi della gestione delle spese',
        'Residui, economie di bilancio e perenzione amministrativa',
        'Esercizio provvisorio e assestamento di bilancio',
        'Il Rendiconto generale dello Stato',
        'Il Ministero dell\'Economia e delle Finanze e i controlli',
        'Tesoreria e gestione della liquidità',
        'L\'armonizzazione contabile: D.Lgs. 118/2011 - Principi e bilancio',
        'Il risultato di amministrazione e il Fondo Pluriennale Vincolato',
        'Il rendiconto e il bilancio consolidato negli enti territoriali',
        'La programmazione negli enti locali: DUP, PEG e bilancio comunale',
        'La responsabilità contabile e la Corte dei conti'
      ]
    }
  },
  'contratti-pubblici': {
    pod: {
      total: '8 episodi · 2h 53min',
      // Le anteprime audio (campo opzionale `preview`) puntano a file in
      // public/preview/<slug>/<formato>-ep<n>.mp3 — Vercel li serve come asset statici.
      // Se il file non esiste, il player mostra "Anteprima in arrivo".
      episodes: [
        { n:1, title:'Il nuovo codice principi rivoluzionari', duration:'26:27', free:true, preview:'/preview/contratti-pubblici/pod-ep1.mp3' },
        { n:2, title:'Programmazione progettazione e digitalizzazione', duration:'27:07' },
        { n:3, title:'Le procedure sopra soglia', duration:'17:11' },
        { n:4, title:'Sotto soglia affidamento diretto e negoziata', duration:'16:01' },
        { n:5, title:'Aggiudicazione OEPV e offerte anomale', duration:'15:01' },
        { n:6, title:'Esclusione subappalto e garanzie', duration:'22:45' },
        { n:7, title:'I 20 trabocchetti del codice appalti', duration:'24:24', preview:'/preview/contratti-pubblici/pod-ep7.mp3' },
        { n:8, title:'Trenta trappole del nuovo codice appalti', duration:'24:15' }
      ]
    },
    aul: {
      total: '8 episodi · 3h 59min',
      episodes: [
        { n:1, title:'Un nuovo codice per gli appalti',       duration:'29 min', free:true, preview:'/preview/contratti-pubblici/aul-ep1.mp3' },
        { n:2, title:'Dall\'idea al bando',                   duration:'29 min' },
        { n:3, title:'Le regole del gioco',                   duration:'28 min' },
        { n:4, title:'Chi vince e perché',                    duration:'28 min' },
        { n:5, title:'La porta d\'ingresso',                  duration:'30 min' },
        { n:6, title:'Dopo l\'aggiudicazione',                duration:'29 min' },
        { n:7, title:'Soglie, numeri e collegamenti',         duration:'31 min' },
        { n:8, title:'Simulazione d\'esame — 30 domande',     duration:'34 min' }
      ]
    },
    rep: {
      total: '10 capitoli · ~90 pagine',
      chapters: [
        'Panoramica generale',
        'Programmazione progettazione',
        'Procedure sopra soglia',
        'Procedure sotto soglia',
        'Criteri aggiudicazione',
        'Cause esclusione',
        'Subappalto esecuzione garanzie',
        'Trabocchetti',
        'Collegamenti normativi',
        'Riepilogo pre-esame'
      ]
    },
    man: {
      total: '274 pagine · 25 capitoli',
      chapters: [
        'Principi generali del Codice dei contratti pubblici',
        'Ambito di applicazione e definizioni',
        'Soglie di rilevanza europea e calcolo dell\'importo',
        'Il Responsabile Unico del Progetto (RUP)',
        'Fasi della procedura di affidamento: decisione di contrarre e aggiudicazione',
        'Stipulazione del contratto',
        'Digitalizzazione del ciclo di vita dei contratti',
        'Programmazione dei lavori e degli acquisti',
        'Progettazione dei lavori pubblici',
        'Procedure di affidamento sotto soglia e principio di rotazione',
        'Procedure di scelta del contraente sopra soglia',
        'Accordi quadro e strumenti di acquisto aggregato',
        'Qualificazione delle stazioni appaltanti e centralizzazione',
        'Operatori economici e requisiti di partecipazione',
        'Cause di esclusione degli operatori economici',
        'Soccorso istruttorio e DGUE',
        'Avvalimento',
        'Garanzie per la partecipazione alla procedura',
        'Documenti di gara, bandi e pubblicità',
        'Criteri di aggiudicazione e commissione giudicatrice',
        'Subappalto e cessione del contratto',
        'Esecuzione del contratto e direzione lavori',
        'ANAC e contenzioso',
        'Concessioni e partenariato pubblico-privato',
        'Norme processuali e disposizioni finali'
      ]
    }
  },
  'diritto-costituzionale': {
    aul: {
      total: '8 episodi · 3h 51min',
      episodes: [
        { n:1, title:'La nascita della Repubblica',           duration:'29 min', free:true, preview:'/preview/diritto-costituzionale/aul-ep1.mp3' },
        { n:2, title:'I diritti inviolabili',                 duration:'27 min' },
        { n:3, title:'Dal cittadino alla società',            duration:'27 min' },
        { n:4, title:'La fabbrica delle leggi',               duration:'29 min' },
        { n:5, title:'Il garante della Costituzione',         duration:'28 min' },
        { n:6, title:'Chi governa e chi giudica',             duration:'28 min' },
        { n:7, title:'Dal centro alla periferia',             duration:'27 min' },
        { n:8, title:'Simulazione d\'esame — 30 domande',     duration:'37 min' }
      ]
    },
    rep: {
      total: '10 capitoli · ~95 pagine',
      chapters: [
        'Panoramica generale',
        'Principi fondamentali',
        'Diritti doveri',
        'Parlamento',
        'Presidente repubblica',
        'Governo magistratura',
        'Regioni',
        'Trabocchetti',
        'Corte costituzionale',
        'Riepilogo pre-esame'
      ]
    },
    man: {
      total: '253 pagine · 23 capitoli',
      chapters: [
        'Principi fondamentali (artt. 1-12)',
        'Libertà civili I: libertà personale, domicilio, comunicazioni, circolazione (artt. 13-16)',
        'Libertà civili II: riunione, associazione, religione, manifestazione del pensiero (artt. 17-21)',
        'Tutela giurisdizionale e principi del diritto penale (artt. 22-28)',
        'Rapporti etico-sociali: famiglia, salute, scuola, ricerca (artt. 29-34)',
        'Rapporti economici (artt. 35-47): lavoro, sindacato, sciopero, iniziativa economica, proprietà',
        'Rapporti politici: cittadinanza, voto, partiti, doveri (artt. 48-54)',
        'Il Parlamento I: Camere, composizione e durata (artt. 55-61)',
        'Il Parlamento II: organizzazione interna e status dei parlamentari (artt. 62-69)',
        'Procedimento legislativo e iniziativa delle leggi (artt. 70-74)',
        'Atti normativi del Governo: decreti legge e decreti legislativi (artt. 76-77)',
        'Funzioni di indirizzo, controllo, guerra, bilancio, amnistia (artt. 78-82)',
        'Il Presidente della Repubblica I: status, elezione, prerogative (artt. 83-86, 90-91)',
        'Il Presidente della Repubblica II: attribuzioni e atti (artt. 87-89)',
        'Il Governo: formazione, fiducia, responsabilità (artt. 92-96)',
        'Pubblica Amministrazione e organi ausiliari del Governo (artt. 97-100)',
        'La Magistratura: ordinamento, CSM, giurisdizione e giusto processo (artt. 101-113)',
        'Regioni, Province e Comuni: autonomie e Titolo V riformato (artt. 114-120)',
        'Organi della Regione: Consiglio, Giunta, Presidente, statuti (artt. 121-126)',
        'Controlli, contenzioso costituzionale Stato-Regioni e modificazioni territoriali (artt. 127-133)',
        'Corte Costituzionale: composizione e competenze (artt. 134-137)',
        'Revisione costituzionale e referendum (artt. 75, 138-139)',
        'Sistema delle fonti del diritto e rapporti con l\'ordinamento internazionale e UE'
      ]
    }
  },
  'diritto-ue': {
    pod: {
      total: '7 episodi · 2h 24min',
      episodes: [
        { n:1, title:'Chi comanda davvero nell\'unione europea', duration:'15:14', free:true },
        { n:2, title:'Come l\'Europa costringe gli stati a obbedire', duration:'17:43' },
        { n:3, title:'I trattati europei per i concorsi pubblici', duration:'16:15' },
        { n:4, title:'Il codice sorgente del potere europeo', duration:'22:44' },
        { n:5, title:'Il motore giuridico dell\'unione europea', duration:'24:35' },
        { n:6, title:'La carta dei diritti diventa legge europea', duration:'17:13' },
        { n:7, title:'Perché la legge europea vince sempre', duration:'30:51' }
      ]
    },
    aul: {
      total: '8 episodi · 4h 54min',
      episodes: [
        { n:1, title:'L\'Europa che non ti aspetti',          duration:'38 min', free:true, preview:'/preview/diritto-ue/aul-ep1.mp3' },
        { n:2, title:'Sette giganti al tavolo',               duration:'39 min' },
        { n:3, title:'Il DNA giuridico dell\'Europa',         duration:'39 min' },
        { n:4, title:'Chi può fare cosa',                     duration:'34 min' },
        { n:5, title:'Come nasce una legge europea',          duration:'35 min' },
        { n:6, title:'Il guardiano dei trattati',             duration:'34 min' },
        { n:7, title:'Cinquantaquattro articoli per i tuoi diritti', duration:'39 min' },
        { n:8, title:'Trenta trabocchetti d\'esame',          duration:'36 min' }
      ]
    },
    rep: {
      total: '10 capitoli · ~85 pagine',
      chapters: [
        'Panoramica generale',
        'Istituzioni UE',
        'Fonti diritto UE',
        'Competenze UE',
        'Procedure legislative',
        'Procedura infrazione',
        'Carta diritti',
        'Trabocchetti',
        'Collegamenti Italia',
        'Riepilogo pre-esame'
      ]
    },
    man: {
      total: '163 pagine · 18 capitoli',
      chapters: [
        'Storia e Trattati dell\'Unione Europea',
        'Principi fondamentali, valori e obiettivi dell\'Unione',
        'Competenze dell\'Unione: attribuzione, sussidiarietà e proporzionalità',
        'Il Parlamento Europeo',
        'Il Consiglio dell\'Unione Europea',
        'Il Consiglio Europeo',
        'La Commissione Europea',
        'La Corte di Giustizia dell\'Unione Europea',
        'La Corte dei Conti',
        'La BCE, la BEI e la politica monetaria',
        'Il Mediatore europeo e gli organi consultivi',
        'Le fonti del diritto dell\'Unione Europea',
        'Le procedure legislative, la pubblicazione degli atti e il bilancio',
        'Cittadinanza europea, diritti fondamentali e spazio di libertà',
        'Il mercato interno e le libertà fondamentali',
        'Politica estera, relazioni esterne e adesione all\'UE',
        'Politiche sociali e occupazione',
        'La politica di coesione e i fondi strutturali europei'
      ]
    }
  },
  'diritto-penale-pa': {
    pod: {
      total: '8 episodi · 2h 50min',
      episodes: [
        { n:1, title:'Titolo II e riforme per il RIPAM', duration:'19:33', free:true, preview:'/preview/diritto-penale-pa/pod-ep1.mp3' },
        { n:2, title:'Soldi pubblici e la trappola del centesimo', duration:'21:54' },
        { n:3, title:'Da vittima a complice nella pubblica amministrazione', duration:'24:49' },
        { n:4, title:'Reati della PA dalla Severino alla Nordio', duration:'27:32' },
        { n:5, title:'Addio abuso d\'ufficio e riforme PA', duration:'24:05' },
        { n:6, title:'I nuovi reati PA dopo la Nordio', duration:'18:27' },
        { n:7, title:'I 20 trabocchetti del diritto penale PA', duration:'14:19' },
        { n:8, title:'Trenta quiz sui nuovi reati PA', duration:'19:43' }
      ]
    },
    aul: {
      total: '8 episodi · 5h 5min',
      episodes: [
        { n:1, title:'Il codice dei colletti bianchi',        duration:'35 min', free:true, preview:'/preview/diritto-penale-pa/aul-ep1.mp3' },
        { n:2, title:'Mani nella cassa',                      duration:'38 min' },
        { n:3, title:'Il ricatto del potere',                 duration:'40 min' },
        { n:4, title:'Il mercato del potere',                 duration:'39 min' },
        { n:5, title:'Il reato fantasma',                     duration:'36 min' },
        { n:6, title:'Le conseguenze invisibili',             duration:'39 min' },
        { n:7, title:'Tre riforme in dieci anni',             duration:'38 min' },
        { n:8, title:'Trenta trabocchetti d\'esame',          duration:'42 min' }
      ]
    },
    rep: {
      total: '10 capitoli · ~85 pagine',
      chapters: [
        'Panoramica generale',
        'Peculato appropriazione',
        'Concussione induzione',
        'Corruzione',
        'Abuso ufficio abrogato',
        'Traffico influenze',
        'Pene accessorie',
        'Trabocchetti',
        'Riforme',
        'Riepilogo pre-esame'
      ]
    },
    man: {
      total: '184 pagine · 24 capitoli',
      chapters: [
        'Quadro generale dei delitti contro la Pubblica Amministrazione',
        'Principi generali, imputabilità e cause di giustificazione',
        'Classificazione dei reati: delitti, contravvenzioni e tipologie',
        'Elemento soggettivo del reato: dolo, colpa e preterintenzione',
        'Circostanze del reato, concorso di reati e pene',
        'Pubblico ufficiale, incaricato di pubblico servizio e servizio di pubblica necessità',
        'Peculato (art. 314 c.p.)',
        'Peculato d\'uso e peculato mediante profitto dell\'errore altrui (artt. 314 co. 2 e 316 c.p.)',
        'Malversazione di erogazioni pubbliche e indebita percezione (artt. 316-bis e 316-ter c.p.)',
        'Concussione (art. 317 c.p.)',
        'Corruzione per l\'esercizio della funzione (art. 318 c.p.)',
        'Corruzione per atto contrario ai doveri d\'ufficio e in atti giudiziari (artt. 319, 319-bis, 319-ter c.p.)',
        'Induzione indebita a dare o promettere utilità (art. 319-quater c.p.)',
        'Corruzione del privato, istigazione e traffico di influenze (artt. 320, 321, 322, 346-bis c.p.)',
        'Pene accessorie, confisca e attenuanti nei reati contro la P.A. (artt. 317-bis, 322-ter, 323-bis, 32-quinquies c.p.)',
        'Abuso d\'ufficio e omissione/rifiuto di atti d\'ufficio (art. 328 c.p.)',
        'Rivelazione di segreti d\'ufficio e utilizzazione di invenzioni (artt. 325-326 c.p.)',
        'Interruzione di servizio pubblico o di pubblica necessità (artt. 331, 340 c.p.)',
        'Violenza, minaccia e resistenza a pubblico ufficiale (artt. 336-337 c.p.)',
        'Turbata libertà degli incanti, del procedimento di scelta e astensione (artt. 353, 353-bis, 354 c.p.)',
        'Inadempimento di contratti e frode nelle pubbliche forniture (artt. 355-356 c.p.)',
        'Usurpazione di funzioni pubbliche ed esercizio abusivo di professione (artt. 347-348 c.p.)',
        'Violazione di sigilli, custodia di cose sequestrate e altri reati (artt. 334-335, 349, 352 c.p.)',
        'Falsità in atti pubblici, reati informatici e altri reati (artt. 476, 479, 480, 483, 612-ter, 615-ter c.p.)'
      ]
    }
  },
  'gdpr': {
    pod: {
      total: '9 episodi · 3h 3min',
      episodes: [
        { n:1, title:'Quiz su GDPR e codice privacy', duration:'17:46', free:true },
        { n:2, title:'I trabocchetti del GDPR nei concorsi pubblici', duration:'17:41' },
        { n:3, title:'I veri trabocchetti del GDPR', duration:'17:12' },
        { n:4, title:'Il conto alla rovescia del data breach', duration:'25:45' },
        { n:5, title:'Il vero architetto dei nostri dati', duration:'18:20' },
        { n:6, title:'La dogana digitale dei dati extra-UE', duration:'18:42' },
        { n:7, title:'La privacy non è un interruttore', duration:'19:04' },
        { n:8, title:'Multe milionarie e rischi penali della privacy', duration:'31:37' },
        { n:9, title:'Sanzioni privacy tra multe milionarie e carcere', duration:'17:01' }
      ]
    },
    aul: {
      total: '8 episodi · 5h 6min',
      episodes: [
        { n:1, title:'La rivoluzione silenziosa',             duration:'39 min', free:true, preview:'/preview/gdpr/aul-ep1.mp3' },
        { n:2, title:'Sette principi e sei basi giuridiche',  duration:'39 min' },
        { n:3, title:'I tuoi dati, i tuoi diritti',           duration:'40 min' },
        { n:4, title:'Chi custodisce i tuoi dati',            duration:'39 min' },
        { n:5, title:'Settantadue ore per reagire',           duration:'38 min' },
        { n:6, title:'La dogana digitale',                    duration:'36 min' },
        { n:7, title:'Multe milionarie e rischi penali',      duration:'35 min' },
        { n:8, title:'Trenta trabocchetti GDPR',              duration:'40 min' }
      ]
    },
    rep: {
      total: '10 capitoli · ~70 pagine',
      chapters: [
        'Panoramica GDPR',
        'Principi basi giuridiche',
        'Diritti interessato',
        'Titolare responsabile DPO',
        'Data breach DPIA',
        'Trasferimenti internazionali',
        'Sanzioni responsabilità',
        'Trabocchetti',
        'Collegamenti normativi',
        'Riepilogo pre-esame'
      ]
    },
    man: {
      total: '392 pagine · 20 capitoli',
      chapters: [
        'Definizioni e ambito di applicazione del GDPR',
        'Principi fondamentali del trattamento',
        'Basi giuridiche del trattamento (liceità)',
        'Il consenso al trattamento',
        'Categorie particolari di dati (dati sensibili)',
        'Dati relativi a condanne penali e reati',
        'Informativa e trasparenza',
        'Diritti dell\'interessato: accesso, rettifica, cancellazione',
        'Diritti dell\'interessato: portabilità, opposizione, profilazione',
        'Il Titolare del trattamento',
        'Il Responsabile del trattamento',
        'Il Responsabile della Protezione dei Dati (DPO)',
        'Registro delle attività di trattamento',
        'Sicurezza del trattamento',
        'Data breach: violazione dei dati personali',
        'Valutazione d\'impatto (DPIA)',
        'Trasferimento dati verso paesi terzi',
        'Il Garante e le autorità di controllo',
        'Sanzioni e tutela dei diritti',
        'D.Lgs. 196/2003: Codice Privacy e normativa nazionale'
      ]
    }
  },
  'beni-culturali': {
    aul: {
      total: '8 episodi · ~4h 20min',
      episodes: [
        { n:1, title:'Il patrimonio della nazione',           duration:'34 min', free:true },
        { n:2, title:'Scoprire e proteggere',                 duration:'33 min' },
        { n:3, title:'Restaurare senza tradire',              duration:'35 min' },
        { n:4, title:'Vietato esportare',                     duration:'34 min' },
        { n:5, title:'Il paesaggio come diritto',             duration:'35 min' },
        { n:6, title:'Il prezzo della distruzione',           duration:'32 min' },
        { n:7, title:'Dal museo alla Costituzione',           duration:'30 min' },
        { n:8, title:'Trenta trabocchetti sui Beni Culturali', duration:'33 min' }
      ]
    },
    rep: {
      total: '11 capitoli · ~90 pagine',
      chapters: [
        'Panoramica generale',
        'Principi generali',
        'Individuazione dichiarazione',
        'Tutela conservazione',
        'Circolazione',
        'Beni paesaggistici',
        'Sanzioni',
        'Trabocchetti',
        'Collegamenti normativi',
        'Riepilogo pre-esame',
        'Ripasso extra'
      ]
    }
  },
  'cad': {
    pod: {
      total: '8 episodi · 2h 43min',
      episodes: [
        { n:1, title:'Trabocchetti CAD', duration:'21:44', free:true, preview:'/preview/cad/pod-ep1.mp3' },
        { n:2, title:'Articolo 1 definizioni', duration:'22:09' },
        { n:3, title:'Documento informatico', duration:'18:08' },
        { n:4, title:'Firme elettroniche', duration:'19:57' },
        { n:5, title:'SPID CIE domicilio', duration:'19:25' },
        { n:6, title:'AgID RTD governance', duration:'13:32' },
        { n:7, title:'Conservazione open data', duration:'21:00' },
        { n:8, title:'Simulazione esame', duration:'27:06' }
      ]
    },
    aul: {
      total: '8 episodi · 5h 8min',
      episodes: [
        { n:1, title:'La PA diventa digitale',                duration:'39 min', free:true, preview:'/preview/cad/aul-ep1.mp3' },
        { n:2, title:'Il documento informatico',              duration:'35 min' },
        { n:3, title:'Quattro firme per un documento',        duration:'40 min' },
        { n:4, title:'Chi sei nel mondo digitale',            duration:'40 min' },
        { n:5, title:'Il direttore d\'orchestra digitale',    duration:'39 min' },
        { n:6, title:'Dal protocollo alla conservazione',     duration:'35 min' },
        { n:7, title:'Il CAD incontra le altre leggi',        duration:'37 min' },
        { n:8, title:'Trenta trabocchetti digitali',          duration:'42 min' }
      ]
    },
    rep: {
      total: '10 capitoli · ~95 pagine',
      chapters: [
        'Panoramica generale',
        'Definizioni art. 1',
        'Documento informatico',
        'Firme elettroniche eIDAS',
        'Identità digitale',
        'AgID governance',
        'Gestione conservazione',
        'Trabocchetti distinzioni',
        'Collegamenti normativi',
        'Riepilogo pre-esame'
      ]
    },
    man: {
      total: '401 pagine · 20 capitoli',
      chapters: [
        'Principi generali e ambito di applicazione del CAD',
        'Definizioni fondamentali: documento informatico e analogico',
        'Copie informatiche, duplicati e dematerializzazione',
        'Firma digitale e firma elettronica',
        'Certificatori e dispositivi di firma',
        'Validità ed efficacia probatoria dei documenti informatici',
        'Domicilio digitale',
        'Posta Elettronica Certificata (PEC)',
        'SPID e identità digitale',
        'Carta d\'identità elettronica e Carta Nazionale dei Servizi',
        'Diritto all\'uso delle tecnologie e partecipazione digitale',
        'AgID: ruolo, compiti e Piano Triennale',
        'Responsabile per la Transizione Digitale e Difensore Civico Digitale',
        'Trasmissione dei documenti informatici tra PA e verso cittadini/imprese',
        'Fascicolo informatico e gestione documentale',
        'Conservazione dei documenti informatici',
        'Dati aperti, formato aperto e interoperabilità',
        'Basi di dati di interesse nazionale e ANPR',
        'Linee guida AgID e regole tecniche',
        'Pagamenti elettronici e servizi digitali della PA'
      ]
    }
  },
  'ordinamento-pa': {
    pod: {
      total: '9 episodi · 3h 37min',
      episodes: [
        { n:1, title:'Chi comanda davvero nei comuni italiani', duration:'25:17', free:true },
        { n:2, title:'Chi comanda davvero nel tuo comune', duration:'24:30' },
        { n:3, title:'Chi comanda tra Stato regioni e comuni', duration:'16:35' },
        { n:4, title:'Chi decide tra Stato regioni e comuni', duration:'31:01' },
        { n:5, title:'Come funziona davvero lo Stato italiano', duration:'18:28' },
        { n:6, title:'I bracci operativi dello Stato', duration:'24:52' },
        { n:7, title:'La pubblica amministrazione oltre la piramide', duration:'28:57' },
        { n:8, title:'Province e città metropolitane esistono ancora', duration:'31:32' },
        { n:9, title:'Quiz e trabocchetti sull\'ordinamento italiano', duration:'16:33' }
      ]
    },
    aul: {
      total: '8 episodi · ~4h 30min',
      episodes: [
        { n:1, title:'L\'architettura dello Stato',           duration:'35 min', free:true, preview:'/preview/ordinamento-pa/aul-ep1.mp3' },
        { n:2, title:'Quindici Ministeri e due modelli',      duration:'33 min' },
        { n:3, title:'Le agenzie che non sono agenzie',       duration:'36 min' },
        { n:4, title:'Il Comune dalla A alla Z',              duration:'39 min' },
        { n:5, title:'Province non abolite e Città Metropolitane', duration:'31 min' },
        { n:6, title:'I guardiani del Comune',                duration:'32 min' },
        { n:7, title:'Chi comanda tra Stato e Regioni',       duration:'33 min' },
        { n:8, title:'Venticinque trabocchetti e simulazione finale', duration:'32 min' }
      ]
    },
    rep: {
      total: '10 capitoli · ~65 pagine',
      chapters: [
        'Panoramica ordinamento',
        'Ministeri',
        'Agenzie',
        'Comune',
        'Province CM',
        'Servizi controlli',
        'Titolo V',
        'Trabocchetti',
        'Titolo V approfondimento',
        'Riepilogo pre-esame'
      ]
    },
    man: {
      total: '128 pagine · 12 capitoli',
      chapters: [
        'Principi generali di organizzazione e dirigenza pubblica',
        'Il Ministero dell\'Interno: struttura e organizzazione',
        'Il Ministero dell\'Istruzione e del Merito',
        'L\'ordinamento scolastico e l\'autonomia delle istituzioni scolastiche',
        'Il Ministero dell\'Università e della Ricerca e l\'ANVUR',
        'Il Ministero dell\'Economia e delle Finanze (MEF)',
        'L\'Agenzia delle Entrate e le Agenzie fiscali',
        'Il Ministero della Giustizia',
        'Il Ministero del Turismo',
        'L\'INPS: organizzazione, organi e strutture',
        'L\'Ispettorato Nazionale del Lavoro',
        'L\'Agenzia per l\'Italia Digitale (AgID) e la trasformazione digitale'
      ]
    }
  },
  'organizzazione-mic': {
    aul: {
      total: '8 episodi · ~4 ore',
      episodes: [
        { n:1, title:'Il Ministero della Cultura',            duration:'30 min', free:true },
        { n:2, title:'Le Direzioni Generali',                 duration:'30 min' },
        { n:3, title:'Dal centro al territorio',              duration:'30 min' },
        { n:4, title:'I gioielli della corona',               duration:'30 min' },
        { n:5, title:'I consiglieri del Ministro',            duration:'30 min' },
        { n:6, title:'Le persone del MIC',                    duration:'30 min' },
        { n:7, title:'Il MIC incontra le altre leggi',        duration:'30 min' },
        { n:8, title:'Venti trabocchetti sul MIC',            duration:'30 min' }
      ]
    },
    rep: {
      total: '10 capitoli · ~65 pagine',
      chapters: [
        'Panoramica generale',
        'Struttura centrale',
        'Direzioni generali',
        'Strutture periferiche',
        'Musei istituti autonomi',
        'Organi consultivi',
        'Personale profili',
        'Trabocchetti',
        'Collegamenti normativi',
        'Riepilogo pre-esame'
      ]
    }
  },
  'diritto-amministrativo': {
    pod: {
      total: '8 episodi · 3h 22min',
      episodes: [
        { n:1, title:'Sconfiggere la burocrazia con la Legge 241', duration:'17:52', free:true, preview:'/preview/diritto-amministrativo/pod-ep1.mp3' },
        { n:2, title:'Come obbligare lo Stato a risponderci',      duration:'21:38' },
        { n:3, title:'Come funzionano SCIA e Conferenza di Servizi', duration:'21:44' },
        { n:4, title:'Come lo Stato straccia i contratti legalmente', duration:'23:43' },
        { n:5, title:'Trenta domande a tranello sulla 241',         duration:'23:57' },
        { n:6, title:'I tuoi diritti con la Legge 241',             duration:'29:47' },
        { n:7, title:'Quanto costa il silenzio della burocrazia',   duration:'31:04' },
        { n:8, title:'Quando il silenzio dello Stato diventa legge', duration:'32:29' }
      ]
    },
    aul: {
      total: '8 episodi · 4h 9min',
      episodes: [
        { n:1, title:'Dallo Stato opaco alla casa di vetro',       duration:'32 min', free:true, preview:'/preview/diritto-amministrativo/aul-ep1.mp3' },
        { n:2, title:'Il cronometro della PA',                     duration:'32 min' },
        { n:3, title:'Il regista invisibile',                      duration:'31 min' },
        { n:4, title:'Quando il silenzio parla',                   duration:'30 min' },
        { n:5, title:'Tutti al tavolo',                            duration:'30 min' },
        { n:6, title:'Vita e morte degli atti',                    duration:'30 min' },
        { n:7, title:'Tre porte per la trasparenza',               duration:'31 min' },
        { n:8, title:'Simulazione d\'esame — 30 domande',          duration:'34 min' }
      ]
    },
    vid: {
      total: '10 episodi · ~2h 30min',
      episodes: [
        { n:1,  title:'Il Procedimento Amministrativo',           duration:'~15 min', free:true },
        { n:2,  title:'Legge 241/1990 — Istruzioni per l\'Uso',    duration:'~18 min' },
        { n:3,  title:'Responsabile del Procedimento',            duration:'~12 min' },
        { n:4,  title:'Il Silenzio della PA',                     duration:'~16 min' },
        { n:5,  title:'SCIA Spiegata — L. 241/1990',              duration:'~14 min' },
        { n:6,  title:'Semplificazione Amministrativa',           duration:'~13 min' },
        { n:7,  title:'Decisioni Viziate',                        duration:'~15 min' },
        { n:8,  title:'La Riforma della PA',                      duration:'~17 min' },
        { n:9,  title:'10 Trappole della Legge 241/1990',         duration:'~19 min' },
        { n:10, title:'Ripasso Finale — L. 241/1990',             duration:'~20 min' }
      ]
    },
    rep: {
      total: '10 capitoli · ~65 pagine',
      chapters: [
        'Panoramica generale',
        'Procedimento e termini',
        'Responsabile del procedimento',
        'Silenzio amministrativo',
        'SCIA e conferenza di servizi',
        'Provvedimento e autotutela',
        'Accesso documenti',
        'Trabocchetti',
        'Collegamenti normativi',
        'Riepilogo pre-esame'
      ]
    },
    man: {
      total: '287 pagine · 16 capitoli',
      chapters: [
        'Principi generali del procedimento (art. 1 L. 241/1990)',
        'Fasi del procedimento: iniziativa, istruttoria, decisione',
        'Il responsabile del procedimento: compiti e responsabilità',
        'Partecipazione al procedimento: avviso, preavviso, motivazione',
        'Silenzio-assenso (art. 20): ambito e tempi',
        'Silenzio-diniego e silenzio-inadempimento',
        'SCIA: presupposti, controlli successivi, regolarizzazione',
        'Conferenza di servizi: semplificata e simultanea',
        'Invalidità dell\'atto: nullità vs annullabilità',
        'Autotutela decisoria: annullamento d\'ufficio (art. 21-nonies)',
        'Autotutela: revoca, convalida, sanatoria, ratifica',
        'Accesso documentale (L. 241/1990, art. 22 ss.)',
        'Accesso civico e civico generalizzato (FOIA)',
        'Termini del procedimento: ordinatori e perentori',
        'FAQ + quiz di autovalutazione per capitolo',
        'Tavole riassuntive e cheat sheet finale'
      ]
    },
    sim: {
      total: '1.000 domande · mix concettuali + specifiche',
      breakdown: [
        { topic:'Procedimento e fasi',             count:80 },
        { topic:'Silenzio della PA',               count:70 },
        { topic:'SCIA e conferenza di servizi',    count:60 },
        { topic:'Autotutela',                      count:50 },
        { topic:'Accesso agli atti',               count:60 },
        { topic:'Responsabile del procedimento',   count:50 },
        { topic:'Partecipazione',                  count:40 },
        { topic:'Invalidità e vizi',               count:50 },
        { topic:'Domande trasversali / trabocchetti', count:40 }
      ]
    }
  },
  'diritto-civile': {
    rep: {
      total: '10 capitoli · ~60 pagine',
      chapters: [
        'Panoramica',
        'Persone fisiche',
        'Persone giuridiche',
        'Obbligazioni',
        'Contratto',
        'Invalidità',
        'Risoluzione',
        'Responsabilità',
        'Prescrizione',
        'Riepilogo'
      ]
    },
    man: {
      total: '385 pagine · 21 capitoli',
      chapters: [
        'Persone fisiche e giuridiche',
        'Famiglia, matrimonio e filiazione',
        'Successioni e donazioni',
        'Beni, proprietà e possesso',
        'Diritti reali di godimento e comunione',
        'Obbligazioni: nozione, fonti e disciplina generale',
        'Adempimento dell\'obbligazione',
        'Inadempimento e mora',
        'Modi di estinzione dell\'obbligazione diversi dall\'adempimento',
        'Cessione del credito e modificazioni soggettive',
        'Obbligazioni con pluralità di soggetti e oggetti',
        'Il contratto: nozione, requisiti, formazione',
        'Causa, oggetto, forma e condizioni del contratto',
        'Interpretazione, effetti del contratto e rappresentanza',
        'Invalidità del contratto: nullità e annullabilità',
        'Rescissione, risoluzione del contratto',
        'Singoli contratti tipici',
        'Promesse unilaterali, gestione di affari, pagamento dell\'indebito, arricchimento senza causa',
        'Responsabilità extracontrattuale (fatti illeciti)',
        'Tutela dei diritti: prove, prescrizione e decadenza',
        'Lavoro, impresa, società e bilancio (Libro V)'
      ]
    }
  },
  'informatica': {
    pod: {
      total: '7 episodi · 2h 31min',
      episodes: [
        { n:1, title:'Hardware cpu memorie', duration:'15:20', free:true, preview:'/preview/informatica/pod-ep1.mp3' },
        { n:2, title:'Sistemi operativi', duration:'18:46' },
        { n:3, title:'Reti internet', duration:'19:23' },
        { n:4, title:'Sicurezza', duration:'32:45' },
        { n:5, title:'PA digitale', duration:'23:50' },
        { n:6, title:'Simulazione esame', duration:'24:09' },
        { n:7, title:'PEC protocolli e trappole della sicurezza informatica', duration:'17:17' }
      ]
    },
    rep: {
      total: '10 capitoli · ~70 pagine',
      chapters: [
        'Hardware architettura',
        'Reti internet',
        'Posta PEC',
        'Sicurezza',
        'Office',
        'PA digitale',
        'Database excel',
        'Ripasso intensivo',
        'Informatica generale',
        'Database excel avanzato'
      ]
    },
    man: {
      total: '330 pagine · 15 capitoli',
      chapters: [
        'Concetti fondamentali e hardware',
        'Software e sistemi operativi',
        'Operazioni comuni in Windows',
        'Microsoft Word',
        'Microsoft Excel',
        'Microsoft PowerPoint',
        'Microsoft Outlook e posta elettronica',
        'Reti informatiche',
        'Internet e il World Wide Web',
        'PEC, firma digitale e identità digitale',
        'Sicurezza informatica',
        'Cloud computing e servizi online',
        'Database e gestione dati',
        'Formati di file e compressione',
        'Programmazione, IA e tecnologie emergenti'
      ]
    }
  },
  'logica': {
    man: {
      total: '250 pagine · 22 capitoli',
      chapters: [
        'Sinonimi e Contrari',
        'Espressioni Idiomatiche, Modi di Dire e Definizioni',
        'Ortografia, Grammatica e Completamento Frasi',
        'Completamento di Parole con Lettere e Sillabe',
        'Gruppi, Intrusi e Termini da Integrare',
        'Analogie e Proporzioni Verbali',
        'Codici, Cifrari e Anagrammi',
        'Stringhe Alfanumeriche e Simmetrie',
        'Sequenze Alfabetiche',
        'Sequenze e Serie Numeriche',
        'Riordini Logici e Sequenze Temporali',
        'Sillogismi e Deduzioni Logiche',
        'Logica Proposizionale: Negazioni e Implicazioni',
        'Ordinamenti, Confronti e Disposizioni',
        'Problemi di Parentela',
        'Ragionamento Critico e Comprensione di Testi',
        'Operazioni Aritmetiche e Calcolo Mentale',
        'Problemi su Insiemi e Diagrammi di Venn',
        'Percentuali, Sconti e Interessi',
        'Frazioni e Proporzioni',
        'Medie, Statistica e Calcolo Combinatorio',
        'Problemi su Velocità, Tempo, Lavoro, Età e Geometria'
      ]
    }
  },
  'sicurezza-lavoro': {
    rep: {
      total: '11 capitoli · ~80 pagine',
      chapters: [
        'Panoramica generale',
        'Obblighi datore deleghe',
        'DVR valutazione rischi',
        'Figure prevenzione',
        'Formazione strategico',
        'Formazione dettaglio',
        'Emergenze primo soccorso',
        'Luoghi attrezzature DPI',
        'Trabocchetti',
        'Collegamenti normativi',
        'Riepilogo pre-esame'
      ]
    },
    man: {
      total: '277 pagine · 19 capitoli',
      chapters: [
        'Disposizioni generali, campo di applicazione e definizioni',
        'Sistema istituzionale: organi di vigilanza, Comitato e Commissione consultiva',
        'Misure generali di tutela e principi di prevenzione',
        'Datore di lavoro: obblighi non delegabili e delega di funzioni',
        'Valutazione dei rischi e DVR',
        'Servizio di Prevenzione e Protezione (SPP) e RSPP',
        'Formazione, informazione e addestramento dei lavoratori',
        'Medico competente e sorveglianza sanitaria',
        'Lavoratori: diritti, obblighi e tutela in caso di pericolo',
        'Rappresentante dei Lavoratori per la Sicurezza (RLS)',
        'Sanzioni e responsabilità (Capo III)',
        'Luoghi di lavoro (Titolo II)',
        'Attrezzature di lavoro e impianti elettrici (Titoli III)',
        'Dispositivi di Protezione Individuale (DPI) - Titolo III, Capo II',
        'Cantieri temporanei o mobili (Titolo IV)',
        'Segnaletica di salute e sicurezza sul lavoro (Titolo V)',
        'Movimentazione manuale dei carichi e videoterminali (Titoli VI-VII)',
        'Agenti fisici, chimici e biologici (Titoli VIII-X)',
        'Gestione delle emergenze, primo soccorso, antincendio'
      ]
    }
  },
  'anticorruzione-trasparenza': {
    man: {
      total: '407 pagine · 22 capitoli',
      chapters: [
        'Trasparenza: principio generale, finalità e quadro costituzionale',
        'L. 190/2012: oggetto, finalità e strategia anticorruzione',
        'Ambito soggettivo, oggettivo e definizioni del D.Lgs. 33/2013',
        'ANAC: ruolo, composizione e funzioni generali',
        'ANAC: poteri di vigilanza, controllo e ordine',
        'Piano Nazionale Anticorruzione (PNA)',
        'PTPCT: adozione, soggetti e termini',
        'PTPCT: contenuto, misure e collegamento con la performance',
        'RPCT: nomina, individuazione e durata dell\'incarico',
        'RPCT: compiti, attività e responsabilità',
        'Altre misure di prevenzione: rotazione, codici, whistleblowing',
        'Accesso civico semplice (Art. 5 c. 1 D.Lgs. 33/2013)',
        'Accesso civico generalizzato (FOIA - Art. 5 c. 2 D.Lgs. 33/2013)',
        'Procedura di accesso civico: termini, controinteressati, riesame, ricorso',
        'Sezione "Amministrazione trasparente" e Allegato A',
        'Caratteristiche della pubblicazione: formato aperto, riutilizzo, qualità',
        'Modalità, tempi e durata della pubblicazione',
        'Pubblicazione su organizzazione e organi di indirizzo politico',
        'Pubblicazione su personale: dirigenti, dipendenti, consulenti, concorsi',
        'Pubblicazione su gare, contratti, sovvenzioni e benefici economici',
        'Pubblicazione su bilancio, pagamenti, patrimonio, provvedimenti, enti vigilati',
        'Limiti, dati personali, OIV e sanzioni per inadempimento'
      ]
    }
  },
  'diritto-processuale-civile': {
    rep: {
      total: '10 capitoli · ~60 pagine',
      chapters: [
        'Principi processo civile',
        'Giurisdizione competenza',
        'Processo cognizione ordinario',
        'Atti processuali rito ordinario',
        'Impugnazioni',
        'Esecuzione forzata',
        'Procedimenti speciali',
        'ADR mediazione negoziazione',
        'Trabocchetti',
        'Ripasso strategico'
      ]
    }
  },
  'inglese-a2': {
    pod: {
      total: '8 episodi · 3h 9min',
      episodes: [
        { n:1, title:'Present simple continuous', duration:'16:24', free:true, preview:'/preview/inglese-a2/pod-ep1.mp3' },
        { n:2, title:'Past simple present perfect', duration:'20:19' },
        { n:3, title:'Articles prepositions', duration:'23:56' },
        { n:4, title:'Modals conditionals', duration:'17:01' },
        { n:5, title:'False friends', duration:'26:41' },
        { n:6, title:'20 errori italiani', duration:'30:21' },
        { n:7, title:'Reading comprehension', duration:'33:21' },
        { n:8, title:'Quick review exam traps', duration:'21:21' }
      ]
    },
    rep: {
      total: '11 capitoli · ~90 pagine',
      chapters: [
        'Present simple continuous',
        'Past simple present perfect',
        'Articles prepositions',
        'Modals conditionals',
        'Modals conditionals 2',
        'Passive relative clauses',
        'Vocabulary office PA',
        'Reading comprehension',
        'False friends',
        '20 errori fatali',
        'Ripasso strategico'
      ]
    }
  },
  'patrimonio-culturale': {
    rep: {
      total: '10 capitoli · ~95 pagine',
      chapters: [
        'Panoramica statistica',
        'Arte pittura',
        'Architettura monumenti',
        'Letteratura',
        'Unesco',
        'Musica cinema teatro',
        'Archeologia',
        'Trabocchetti',
        'Personaggi date',
        'Riepilogo pre-esame'
      ]
    }
  },
  'organizzazione-mic': {
    vid: {
      total: '8 episodi · 4h 48min',
      episodes: [
        { n:1, title:'Il Ministero della Cultura — storia, missione e struttura', duration:'37:00', free:true },
        { n:2, title:'Le Direzioni Generali — chi fa cosa nel MiC', duration:'36:27' },
        { n:3, title:'Dal centro al territorio — soprintendenze e strutture periferiche', duration:'35:36' },
        { n:4, title:'I gioielli della corona — musei e istituti dotati di autonomia', duration:'35:38' },
        { n:5, title:'I consiglieri del Ministro — gli organi consultivi', duration:'34:50' },
        { n:6, title:'Le persone del MiC — profili professionali e concorsi', duration:'35:14' },
        { n:7, title:'Il MiC incontra le altre leggi — i collegamenti normativi', duration:'36:04' },
        { n:8, title:'Venti trabocchetti sull\'organizzazione del MiC e simulazione finale', duration:'37:28' }
      ]
    }
  },
  'marketing-comunicazione': {
    vid: {
      total: '8 episodi · 6h 02min',
      episodes: [
        { n:1, title:'La L. 150/2000 — quadro normativo e le tre attività', duration:'45:25', free:true },
        { n:2, title:'Il portavoce e l\'ufficio stampa', duration:'46:38' },
        { n:3, title:'L\'URP — funzioni, organizzazione e sportelli', duration:'47:21' },
        { n:4, title:'Il piano di comunicazione e la formazione', duration:'45:01' },
        { n:5, title:'Comunicazione digitale e social media nella PA', duration:'41:56' },
        { n:6, title:'Marketing dei servizi pubblici e customer satisfaction', duration:'47:17' },
        { n:7, title:'Comunicazione di crisi e comunicazione intranet', duration:'46:29' },
        { n:8, title:'Trabocchetti e ripasso finale', duration:'41:57' }
      ]
    }
  },
  'ordinamento-difesa': {
    vid: {
      total: '7 episodi · 4h 35min',
      episodes: [
        { n:1, title:'La Patria e il Codice — cornice costituzionale e le otto componenti del Ministero', duration:'38:32', free:true },
        { n:2, title:'Chi decide sopra tutti — il Ministro, il Consiglio supremo di difesa e Palazzo Chigi', duration:'37:22' },
        { n:3, title:'Chi pensa e chi fa — il vertice militare, dallo Stato maggiore al COVI', duration:'36:03' },
        { n:4, title:'Due cariche, non una — Segretario generale, armamenti, uffici centrali e arsenali', duration:'37:21' },
        { n:5, title:'Chi porta la divisa e chi no — Forze armate, Carabinieri, personale civile e disciplina', duration:'41:49' },
        { n:6, title:'Il tuo concorso in cifre — riserve, stratificazione storica e sigle da riconoscere', duration:'38:48' },
        { n:7, title:'Trentacinque trabocchetti sull\'ordinamento della Difesa e simulazione finale', duration:'44:52' }
      ]
    }
  },
}

export const getContenuti = (slug) => CONTENUTI[slug] || null
