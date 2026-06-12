# TODO — Ripam Studio Craft

## GDPR / Privacy

- [ ] **Adeguamento Privacy per uso promozionale email (2026-05-21)**
  Quando il volume di richieste credenziali Quiz Pro lo giustificherà, attivare l'uso dell'email anche per comunicazioni informative su materiali e novità. Per essere GDPR-clean serve:
  1. Aggiornare `src/data/legale.js` — sez. 3 "Finalità e base giuridica": aggiungere finalità secondaria (consenso separato art. 6.1 lett. a GDPR), aggiornare `ultimoAggiornamento`.
  2. Aggiungere su `src/views/Scrivimi.vue` una **seconda checkbox facoltativa** (sotto quella privacy esistente) per il consenso marketing: *"Acconsento a ricevere occasionalmente novità sui materiali di studio di Ripam Studio Craft via email."*
  3. Far passare il nuovo campo `newsletter: true/false` a `api/contact.js` e includerlo nel corpo della mail di notifica.
  4. Quando si inizieranno a inviare le promo: footer obbligatorio con istruzioni unsubscribe (es. *"Per non ricevere più queste email, rispondi con CANCELLAMI"*).

  **Stato attuale**: rimandato — si raccolgono prima un po' di richieste per capire i volumi reali.

## Lavori clienti

- [ ] **Stefania (CPI Sicilia – SAC): 2 report nuovi su misura (2026-06-11)**
  Annunciati nella mail dell'11/06: due report a sé per chiudere la voce del bando *"diritto costituzionale (fonti + istituzioni UE) e regionale (Titolo V)"*. **Si generano SOLO se Stefania conferma.**
  1. **Costituzionale / Titolo V** — riparto competenze Stato-Regioni (art. 117 Cost.), raccordo con lo Statuto siciliano, rapporti Stato-Regione (wiki `ordinamento-pa-regioni-llm-wiki`).
  2. **Diritto UE** — istituzioni dell'Unione + riparto competenze TFUE (wiki `diritto-europeo-llm-wiki`).

  Prezzo concordato: **19,99 €/cad = 39,98 €**, fattura dedicata (vecchio cliente, non al nuovo listino 25 €). Tempi comodi: T-0 concorso = **2 luglio 2026**. Metodo: wiki→report (fonti già pronte). Dettaglio completo nel memory `project_ordine_stefania_cpi` (trigger "Riprendi Stefania").
