// Testi delle pagine legali. Aggiornare qui i contenuti se cambiano.
// Il titolare del trattamento viene letto da LEGAL_HOLDER.

export const LEGAL_HOLDER = {
  nome: 'Francesco Capurso',
  brand: 'Ripam Studio Craft',
  citta: 'Roma',
  piva: '18528431002',
  email: 'ripamstudiocraft@gmail.com',
  ultimoAggiornamento: '2026-05-23'
}

export const PAGES = {
  privacy: {
    slug: 'privacy',
    title: 'Privacy Policy',
    subtitle: 'Come tratto i tuoi dati personali.',
    sections: [
      {
        t: '1. Titolare del trattamento',
        p: `Il Titolare del trattamento dei dati personali è Francesco Capurso, con sede a Roma (P.IVA ${LEGAL_HOLDER.piva}), operante con il brand "Ripam Studio Craft". Per qualsiasi richiesta relativa al trattamento dei tuoi dati puoi scrivere a ${LEGAL_HOLDER.email}.`
      },
      {
        t: '2. Dati raccolti',
        p: 'Attraverso il form di contatto presente sul sito raccolgo i seguenti dati che fornisci volontariamente: nome, indirizzo email, concorso di interesse, prodotto/servizio di interesse, materia (facoltativa), note libere. Se decidi di iscriverti alla newsletter raccolgo inoltre: indirizzo email, nome (facoltativo), data e ora dell\'iscrizione, indirizzo IP e user agent al momento del consenso, testo della casella di consenso così come ti è stato presentato (registro consensi GDPR). Non raccolgo dati tramite cookie di profilazione o strumenti di tracciamento analytics.'
      },
      {
        t: '3. Finalità e base giuridica',
        p: 'I dati raccolti tramite form di contatto sono trattati per rispondere alla tua richiesta di informazioni, fornire eventuali preventivi, gestire l\'eventuale rapporto contrattuale. Base giuridica: (a) tuo consenso esplicito al momento dell\'invio del form; (b) esecuzione di misure precontrattuali su tua richiesta (art. 6.1 lett. b GDPR). I dati raccolti tramite iscrizione alla newsletter sono trattati per inviarti comunicazioni informative su materiali, novità e iniziative di Ripam Studio Craft. Base giuridica: (c) tuo consenso libero, specifico e revocabile in qualsiasi momento (art. 6.1 lett. a GDPR). Il consenso alla newsletter è separato dal consenso al trattamento dei dati del form e non è condizione per ricevere risposta al form di contatto.'
      },
      {
        t: '4. Modalità di trattamento e conservazione',
        p: 'I dati vengono trasmessi tramite protocollo HTTPS cifrato. I dati del form di contatto sono archiviati nella casella email del Titolare (Google Gmail) e conservati per il tempo necessario a rispondere alla richiesta e, in caso di rapporto attivato, per il tempo richiesto dalla legge (documenti fiscali: 10 anni); richieste senza seguito sono cancellate entro 24 mesi. I dati di iscrizione alla newsletter sono archiviati in un database gestito tramite Neon Inc. (PostgreSQL serverless ospitato in UE) e sono conservati fino alla revoca del consenso (disiscrizione) o all\'inattività prolungata della casella (rimozione automatica dopo 24 mesi senza aperture).'
      },
      {
        t: '5. Trasferimenti extra-UE',
        p: 'Il sito è ospitato su Vercel Inc. (USA) e l\'email è gestita da Google LLC (USA). Entrambe le società aderiscono al Data Privacy Framework UE-USA, che garantisce un livello di protezione adeguato ai sensi dell\'art. 45 GDPR.'
      },
      {
        t: '6. Destinatari dei dati',
        p: 'I dati non sono ceduti, venduti o comunicati a terzi per finalità di marketing di terzi. I fornitori tecnologici che trattano i dati come Responsabili esterni sono: Vercel Inc. (hosting sito e funzioni serverless), Google LLC (casella email Gmail e invio email transazionali e newsletter), Neon Inc. (database PostgreSQL per gestione iscritti alla newsletter, server in UE).'
      },
      {
        t: '7. Newsletter / comunicazioni marketing',
        p: 'Se hai prestato consenso specifico, potrai ricevere fino a 2 email al mese con: novità sui materiali di studio, anteprime, bandi pertinenti, occasionali offerte. Ogni email contiene un link di disiscrizione (unsubscribe) attivo con un click: puoi revocare il consenso in qualsiasi momento, gratuitamente, senza dover motivare la scelta. La revoca non pregiudica la liceità dei trattamenti basati sul consenso prestato prima della revoca. Il consenso alla newsletter è raccolto con doppio opt-in: ti iscrivi sul sito, ricevi una mail di conferma, e l\'iscrizione diventa attiva solo dopo il tuo click di conferma.'
      },
      {
        t: '8. Diritti dell\'interessato',
        p: `Ai sensi degli artt. 15-22 GDPR hai diritto di: accedere ai tuoi dati, chiederne rettifica o cancellazione, opporti al trattamento, chiedere la limitazione, ricevere i dati in formato portabile, revocare in qualsiasi momento il consenso prestato. Per esercitare questi diritti scrivi a ${LEGAL_HOLDER.email}. Per la sola newsletter puoi anche disiscriverti con un click dal link presente in ogni email. Hai inoltre diritto di proporre reclamo al Garante per la protezione dei dati personali (www.garanteprivacy.it).`
      },
      {
        t: '9. Cookie',
        p: 'Il sito utilizza unicamente cookie tecnici necessari al funzionamento (sessione, preferenze). Non sono utilizzati cookie di profilazione o di terze parti a fini di marketing. Per dettagli vedi Cookie Policy.'
      },
      {
        t: '10. Aggiornamenti',
        p: `La presente Privacy Policy può essere aggiornata. In caso di modifiche sostanziali verrà data evidenza nella home. Ultimo aggiornamento: ${LEGAL_HOLDER.ultimoAggiornamento}.`
      }
    ]
  },

  'cookie-policy': {
    slug: 'cookie-policy',
    title: 'Cookie Policy',
    subtitle: 'Quali cookie uso e perché.',
    sections: [
      {
        t: '1. Cosa sono i cookie',
        p: 'I cookie sono piccoli file di testo che i siti web salvano sul tuo dispositivo mentre navighi. Servono a far funzionare il sito, memorizzare preferenze o raccogliere statistiche.'
      },
      {
        t: '2. Cookie utilizzati su questo sito',
        p: 'Questo sito utilizza esclusivamente cookie tecnici di sessione (strettamente necessari al funzionamento). Non sono utilizzati cookie di profilazione, di tracciamento pubblicitario, né strumenti di analytics di terze parti (niente Google Analytics, Meta Pixel, TikTok Pixel o simili).'
      },
      {
        t: '3. Cookie tecnici',
        p: 'I cookie tecnici non richiedono consenso preventivo ai sensi del provvedimento del Garante privacy del 10 giugno 2021. Vengono utilizzati solo per garantire il corretto funzionamento delle pagine e del form di contatto.'
      },
      {
        t: '4. Come gestire i cookie',
        p: 'Puoi disabilitare i cookie dalle impostazioni del tuo browser in qualsiasi momento. Disabilitando i cookie tecnici alcune funzioni del sito (es. invio del form contatti) potrebbero non funzionare correttamente.'
      },
      {
        t: '5. Aggiornamenti',
        p: `Se in futuro verranno aggiunti strumenti che richiedono consenso (es. Analytics, Pixel pubblicitari), verrà attivato un banner di consenso esplicito. Ultimo aggiornamento: ${LEGAL_HOLDER.ultimoAggiornamento}.`
      }
    ]
  },

  termini: {
    slug: 'termini',
    title: 'Termini di utilizzo',
    subtitle: 'Cosa offro, cosa non offro, limiti di responsabilità.',
    sections: [
      {
        t: '1. Informazioni sul titolare',
        p: `Questo sito (ripam-studio-craft.vercel.app) è gestito da Francesco Capurso, con sede a Roma (P.IVA ${LEGAL_HOLDER.piva}), operante con il brand "Ripam Studio Craft". Per qualsiasi comunicazione: ${LEGAL_HOLDER.email}.`
      },
      {
        t: '2. Natura dei servizi',
        p: 'Ripam Studio Craft offre servizi di formazione, consulenza e sviluppo di strumenti didattici per la preparazione ai concorsi pubblici italiani. I servizi comprendono: materiali didattici multicanale (podcast, video, report, simulatori), coaching 1:1 su strumenti AI (NotebookLM), sviluppo di web app e tool di studio personalizzati, conversione di contenuti tra formati.'
      },
      {
        t: '3. Disclaimer — garanzia di risultato',
        p: 'Ripam Studio Craft fornisce materiali didattici di qualità costruiti su normativa ufficiale. Garantisce l\'accuratezza, l\'aggiornamento e la revisione manuale dei contenuti prodotti. Non garantisce, né può garantire, il superamento dell\'esame o del concorso: il risultato dipende dalle conoscenze e competenze di partenza del candidato, dall\'impegno nello studio, dal tempo dedicato e da fattori personali ed esterni non controllabili (modalità della prova, criteri della commissione, condizione in sede d\'esame). I materiali forniti sono un supporto alla preparazione, non un sostituto dello studio individuale.'
      },
      {
        t: '4. Processo di acquisto e pagamento',
        p: 'Il sito non è un negozio online: ogni servizio parte da un contatto (form o email) e da una fase di confronto con il cliente. Al termine della fase di definizione del lavoro viene inviato un riepilogo scritto con i dettagli e le istruzioni di pagamento. Metodi di pagamento accettati: Satispay, PayPal, bonifico bancario. Nessun pagamento anticipato è richiesto in fase di semplice contatto informativo.'
      },
      {
        t: '5. Consegna',
        p: 'I materiali vengono consegnati entro 48 ore dalla conferma del pagamento per i formati già in archivio. Per materiali nuovi o molto personalizzati il tempo di consegna viene concordato caso per caso. La consegna avviene tramite Telegram (file di piccole dimensioni) o link Google Drive (file più pesanti come video).'
      },
      {
        t: '6. Diritti di utilizzo dei materiali',
        p: 'I materiali ricevuti sono destinati all\'uso personale di studio del cliente. È vietata la riproduzione, la distribuzione, la condivisione con terzi, la rivendita o la pubblicazione su piattaforme online dei contenuti ricevuti, ai sensi della L. 633/1941 sul diritto d\'autore. In caso di violazioni, il Titolare si riserva di tutelarsi nelle sedi competenti.'
      },
      {
        t: '7. Generazione con intelligenza artificiale e gestione imprecisioni',
        p: 'I contenuti prodotti sono generati con tecniche di AI e RAG (Retrieval-Augmented Generation) a partire da testi normativi ufficiali, con successiva revisione manuale. La generazione AI è dichiarata come parte del processo produttivo ed è considerata un punto di forza del servizio (aggiornamento rapido, distrattori calibrati, costi accessibili). Pur con la revisione umana, i materiali possono contenere imprecisioni, refusi o non riflettere aggiornamenti normativi successivi alla data di consegna indicata sul file. Per questo motivo il cliente è tenuto, prima di utilizzare i contenuti per scelte critiche, a verificarli sulle fonti normative primarie citate nel materiale stesso. I materiali sono un supporto allo studio, non un sostituto della consultazione diretta delle fonti normative ufficiali.'
      },
      {
        t: '8. Politica di correzione errori',
        p: 'Il cliente ha 60 giorni dalla data di consegna per segnalare errori fattuali, imprecisioni normative, refusi gravi o link non funzionanti scrivendo a ' + LEGAL_HOLDER.email + '. Le correzioni verificate vengono pubblicate in una nuova versione del materiale entro 72 ore lavorative dalla segnalazione e rinviate al cliente senza costi aggiuntivi. Trascorsi i 60 giorni, aggiornamenti e correzioni restano possibili ma vengono concordati caso per caso. La garanzia di correzione non copre: preferenze stilistiche del cliente (scelta dei caratteri, sintesi di un paragrafo, ecc.), richieste di nuovi contenuti rispetto allo scope concordato, modifiche dovute ad aggiornamenti normativi intervenuti dopo la consegna (gestibili come nuovo preventivo).'
      },
      {
        t: '9. Limitazione di responsabilità',
        p: 'Il Titolare non risponde di eventuali danni, mancate opportunità o esito negativo di prove concorsuali derivanti dall\'utilizzo dei materiali forniti. In caso di inadempimento o vizio del servizio, ferme restando le garanzie di legge a favore del consumatore (in particolare artt. 128 e seguenti D.Lgs. 206/2005), la responsabilità economica del Titolare è in ogni caso limitata al prezzo effettivamente pagato dal cliente per il singolo materiale oggetto della contestazione, con esclusione di ogni responsabilità per danni indiretti o consequenziali.'
      },
      {
        t: '10. Recesso',
        p: 'Ai sensi del D.Lgs. 206/2005 (Codice del Consumo), il cliente consumatore ha diritto di recedere entro 14 giorni dall\'acquisto. Tuttavia, per contenuti digitali personalizzati consegnati prima della scadenza del termine di recesso, il diritto decade se il cliente ha espressamente acconsentito all\'esecuzione anticipata (e sarà richiesto esplicitamente prima della consegna).'
      },
      {
        t: '11. Foro competente',
        p: 'Per qualsiasi controversia relativa all\'interpretazione o esecuzione dei presenti Termini è competente il Foro di Roma, fatte salve le competenze inderogabili di legge in caso di controversia con cliente consumatore.'
      },
      {
        t: '12. Aggiornamenti',
        p: `I presenti Termini possono essere aggiornati. La versione vigente è quella pubblicata in questa pagina. Ultimo aggiornamento: ${LEGAL_HOLDER.ultimoAggiornamento}.`
      }
    ]
  }
}

export const getLegalPage = (slug) => PAGES[slug]
