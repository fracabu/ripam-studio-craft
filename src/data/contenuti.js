// Indice dettagliato dei contenuti per materia.
// Se una materia manca qui, Materia.vue usa il fallback dai topics.
//
// Struttura:
//   pod: { total, episodes:[{n,title,duration,free?}] }
//   vid: { total, episodes:[{n,title,duration,free?}] }
//   rep: { pages, chapters:[string] }
//   sim: { total, breakdown:[{topic,count}] }

export const CONTENUTI = {
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
      total: '500 domande · mix concettuali + specifiche',
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
