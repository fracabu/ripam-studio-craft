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
      total: '~220 pagine · 16 capitoli',
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
  }
}

export const getContenuti = (slug) => CONTENUTI[slug] || null
