# TODO — Ripam Studio Craft

## GDPR / Privacy

- [ ] **Adeguamento Privacy per uso promozionale email (2026-05-21)**
  Quando il volume di richieste credenziali Quiz Pro lo giustificherà, attivare l'uso dell'email anche per comunicazioni informative su materiali e novità. Per essere GDPR-clean serve:
  1. Aggiornare `src/data/legale.js` — sez. 3 "Finalità e base giuridica": aggiungere finalità secondaria (consenso separato art. 6.1 lett. a GDPR), aggiornare `ultimoAggiornamento`.
  2. Aggiungere su `src/views/Scrivimi.vue` una **seconda checkbox facoltativa** (sotto quella privacy esistente) per il consenso marketing: *"Acconsento a ricevere occasionalmente novità sui materiali di studio di Ripam Studio Craft via email."*
  3. Far passare il nuovo campo `newsletter: true/false` a `api/contact.js` e includerlo nel corpo della mail di notifica.
  4. Quando si inizieranno a inviare le promo: footer obbligatorio con istruzioni unsubscribe (es. *"Per non ricevere più queste email, rispondi con CANCELLAMI"*).

  **Stato attuale**: rimandato — si raccolgono prima un po' di richieste per capire i volumi reali.
