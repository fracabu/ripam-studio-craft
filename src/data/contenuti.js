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
    aul: {
      total: '8 episodi · 3h 55min',
      episodes: [
        { n:1, title:'Dal suddito al contratto',              duration:'30 min', free:true },
        { n:2, title:'Il potere dei dirigenti',               duration:'29 min' },
        { n:3, title:'Entrare nello Stato',                   duration:'29 min' },
        { n:4, title:'Il contratto che governa',              duration:'29 min' },
        { n:5, title:'Il codice del dipendente',              duration:'29 min' },
        { n:6, title:'I confini del dipendente',              duration:'28 min' },
        { n:7, title:'Il quadro completo',                    duration:'29 min' },
        { n:8, title:'Simulazione d\'esame — 30 domande',     duration:'33 min' }
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
    aul: {
      total: '8 episodi · 4h 33min',
      episodes: [
        { n:1, title:'Il fondamento di tutto',                duration:'30 min', free:true },
        { n:2, title:'Il nuovo ciclo di bilancio',            duration:'30 min' },
        { n:3, title:'La mappa del tesoro',                   duration:'29 min' },
        { n:4, title:'Le regole d\'oro',                      duration:'28 min' },
        { n:5, title:'Il viaggio del denaro pubblico',        duration:'35 min' },
        { n:6, title:'Il muro della copertura',               duration:'37 min' },
        { n:7, title:'I guardiani dei conti',                 duration:'39 min' },
        { n:8, title:'Simulazione d\'esame — 30 domande',     duration:'45 min' }
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
    aul: {
      total: '8 episodi · 3h 59min',
      episodes: [
        { n:1, title:'Un nuovo codice per gli appalti',       duration:'29 min', free:true },
        { n:2, title:'Dall\'idea al bando',                   duration:'29 min' },
        { n:3, title:'Le regole del gioco',                   duration:'28 min' },
        { n:4, title:'Chi vince e perché',                    duration:'28 min' },
        { n:5, title:'La porta d\'ingresso',                  duration:'30 min' },
        { n:6, title:'Dopo l\'aggiudicazione',                duration:'29 min' },
        { n:7, title:'Soglie, numeri e collegamenti',         duration:'31 min' },
        { n:8, title:'Simulazione d\'esame — 30 domande',     duration:'34 min' }
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
        { n:1, title:'La nascita della Repubblica',           duration:'29 min', free:true },
        { n:2, title:'I diritti inviolabili',                 duration:'27 min' },
        { n:3, title:'Dal cittadino alla società',            duration:'27 min' },
        { n:4, title:'La fabbrica delle leggi',               duration:'29 min' },
        { n:5, title:'Il garante della Costituzione',         duration:'28 min' },
        { n:6, title:'Chi governa e chi giudica',             duration:'28 min' },
        { n:7, title:'Dal centro alla periferia',             duration:'27 min' },
        { n:8, title:'Simulazione d\'esame — 30 domande',     duration:'37 min' }
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
    aul: {
      total: '8 episodi · 4h 54min',
      episodes: [
        { n:1, title:'L\'Europa che non ti aspetti',          duration:'38 min', free:true },
        { n:2, title:'Sette giganti al tavolo',               duration:'39 min' },
        { n:3, title:'Il DNA giuridico dell\'Europa',         duration:'39 min' },
        { n:4, title:'Chi può fare cosa',                     duration:'34 min' },
        { n:5, title:'Come nasce una legge europea',          duration:'35 min' },
        { n:6, title:'Il guardiano dei trattati',             duration:'34 min' },
        { n:7, title:'Cinquantaquattro articoli per i tuoi diritti', duration:'39 min' },
        { n:8, title:'Trenta trabocchetti d\'esame',          duration:'36 min' }
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
    aul: {
      total: '8 episodi · 5h 5min',
      episodes: [
        { n:1, title:'Il codice dei colletti bianchi',        duration:'35 min', free:true },
        { n:2, title:'Mani nella cassa',                      duration:'38 min' },
        { n:3, title:'Il ricatto del potere',                 duration:'40 min' },
        { n:4, title:'Il mercato del potere',                 duration:'39 min' },
        { n:5, title:'Il reato fantasma',                     duration:'36 min' },
        { n:6, title:'Le conseguenze invisibili',             duration:'39 min' },
        { n:7, title:'Tre riforme in dieci anni',             duration:'38 min' },
        { n:8, title:'Trenta trabocchetti d\'esame',          duration:'42 min' }
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
    aul: {
      total: '8 episodi · 5h 6min',
      episodes: [
        { n:1, title:'La rivoluzione silenziosa',             duration:'39 min', free:true },
        { n:2, title:'Sette principi e sei basi giuridiche',  duration:'39 min' },
        { n:3, title:'I tuoi dati, i tuoi diritti',           duration:'40 min' },
        { n:4, title:'Chi custodisce i tuoi dati',            duration:'39 min' },
        { n:5, title:'Settantadue ore per reagire',           duration:'38 min' },
        { n:6, title:'La dogana digitale',                    duration:'36 min' },
        { n:7, title:'Multe milionarie e rischi penali',      duration:'35 min' },
        { n:8, title:'Trenta trabocchetti GDPR',              duration:'40 min' }
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
    }
  },
  'cad': {
    aul: {
      total: '8 episodi · 5h 8min',
      episodes: [
        { n:1, title:'La PA diventa digitale',                duration:'39 min', free:true },
        { n:2, title:'Il documento informatico',              duration:'35 min' },
        { n:3, title:'Quattro firme per un documento',        duration:'40 min' },
        { n:4, title:'Chi sei nel mondo digitale',            duration:'40 min' },
        { n:5, title:'Il direttore d\'orchestra digitale',    duration:'39 min' },
        { n:6, title:'Dal protocollo alla conservazione',     duration:'35 min' },
        { n:7, title:'Il CAD incontra le altre leggi',        duration:'37 min' },
        { n:8, title:'Trenta trabocchetti digitali',          duration:'42 min' }
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
    aul: {
      total: '8 episodi · ~4h 30min',
      episodes: [
        { n:1, title:'L\'architettura dello Stato',           duration:'35 min', free:true },
        { n:2, title:'Quindici Ministeri e due modelli',      duration:'33 min' },
        { n:3, title:'Le agenzie che non sono agenzie',       duration:'36 min' },
        { n:4, title:'Il Comune dalla A alla Z',              duration:'39 min' },
        { n:5, title:'Province non abolite e Città Metropolitane', duration:'31 min' },
        { n:6, title:'I guardiani del Comune',                duration:'32 min' },
        { n:7, title:'Chi comanda tra Stato e Regioni',       duration:'33 min' },
        { n:8, title:'Venticinque trabocchetti e simulazione finale', duration:'32 min' }
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
    }
  },
  'diritto-amministrativo': {
    pod: {
      total: '8 episodi · 3h 22min',
      episodes: [
        { n:1, title:'Sconfiggere la burocrazia con la Legge 241', duration:'17:52', free:true },
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
        { n:1, title:'Dallo Stato opaco alla casa di vetro',       duration:'32 min', free:true },
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
      total: '~25 pagine',
      chapters: [
        'Sintesi del procedimento amministrativo',
        'Silenzio, SCIA, conferenza di servizi — cheat sheet',
        'Autotutela e invalidità — mappa concettuale',
        'Accesso documentale / civico / FOIA',
        'I 30 trabocchetti ricorrenti nei quiz',
        'Tavole riassuntive: termini, competenze, rimedi'
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
  }
}

export const getContenuti = (slug) => CONTENUTI[slug] || null
