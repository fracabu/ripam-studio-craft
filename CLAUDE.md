# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Cos'è

Landing page + funnel di **Ripam Studio Craft**: materiali didattici generati con AI (podcast, audio lezioni, video, report, manuali, simulatori) per concorsi pubblici italiani (RIPAM, MIC, MIMIT, ecc.). SPA Vue 3 servita da Vercel con alcune serverless function Node per form contatti e newsletter. Single-author, hobby Vercel plan. Lingua: tutto in italiano.

## Comandi

```bash
npm run dev        # Vite dev server su localhost:5173 (apre il browser)
npm run build      # build di produzione in dist/
npm run preview    # preview della build

node db/apply_schema.mjs                              # applica/migra TUTTI gli schema Neon (newsletter+ordini+candidati+anteprime, idempotente)
node db/apply_schema.mjs schema_ordini.sql           # applica un solo schema
node scripts/send_newsletter.mjs <YYYY-MM-DD> --dry-run   # invio newsletter in locale (vedi sotto)

# Registro acquisti (tabella `ordini` su Neon) — gira a PC acceso, legge .env.local
node scripts/order_add.mjs --email <email> --prodotto "<testo>" [--importo 29.98 --fattura 8/2026 ...]
node scripts/orders_list.mjs                         # vista clienti aggregati (view `clienti`) + fatturato
node scripts/orders_list.mjs --ordini                # tutti gli ordini, riga per riga
node scripts/orders_list.mjs --email <email>         # ordini di un singolo cliente

# Drip anteprime + invio diretto lead — INVIANO mail vere via nodemailer (no bozza). Girano a PC acceso.
node scripts/send_drip.mjs --dry-run                 # consegna "a goccia" nuove materie agli iscritti (anti-doppione su `anteprime_inviate`; salta chi è iscritto da <7 giorni, override con --min-eta-giorni)
node scripts/send_lead.mjs ...                       # invio diretto mail a un lead (guscio DARK + logo inline); bozza composta da lead-draft.mjs / skill auto-risposte-lead
node scripts/anteprima_log.mjs ...                   # registra a mano una consegna nel registro `anteprime_inviate`
node scripts/anteprime_list.mjs                      # elenca chi ha ricevuto quale anteprima
node scripts/check_lead.mjs <email> [--full]         # cosa ha GIÀ ricevuto una persona (invii+anteprime+ordini+newsletter+profilo) → anti-doppione prima di rispondere

# Gruppo Telegram — pubblicazione semiautomatica (mostra, invii solo con --invia)
node scripts/telegram_post.mjs --testo post.txt --foto img.png --topic 26542 --muto --invia
node scripts/telegram_ingest.mjs --materia contratti-pubblici            # elenca, non scrive
node scripts/telegram_ingest.mjs --materia contratti-pubblici --scrivi   # riempie social/telegram/coda/

# Registro invii (tabella `invii_email`) — anti-doppione delle comunicazioni
node scripts/backfill_invii.mjs --dry-run            # ricostruisce lo storico dalla Posta inviata (IMAP), non scrive
node scripts/backfill_invii.mjs --apply              # lo riversa su DB (idempotente, ~4 min su 2.6k messaggi)
node scripts/backfill_invii_newsletter.mjs [<YYYY-MM-DD>] --apply   # riversa le newsletter da newsletter_send_events (fonte DB, non IMAP)
```

Non esistono test automatici né linter configurati. Gli script `scripts/_tmp_*.mjs` sono diagnostiche usa-e-getta (git-ignored).

### Vercel CLI è rotto su Windows
`vercel dev` non funziona qui (Vercel CLI 46 + Vite 6). Conseguenze pratiche:
- Le serverless function **non girano** col solo `npm run dev` (Vite serve solo il frontend).
- Per testare/eseguire la logica newsletter in locale si usa `scripts/send_newsletter.mjs`, che importa l'handler `api/newsletter/send.js` **in-process** caricando `.env.local` a mano e forzando `PUBLIC_BASE_URL` al dominio di produzione (così i link nelle mail puntano al sito live).
- Stesso pattern di env-loading manuale (no `dotenv`) in `db/apply_schema.mjs`.

## Architettura

### Frontend — SPA data-driven
- Entry `src/main.js` → `App.vue` + `vue-router` (history mode). Rotte in `src/router/index.js`. `vercel.json` fa il rewrite SPA verso `index.html` per ogni path non-`/api` e senza estensione.
- **I contenuti del sito vivono nei file `src/data/`, non nei componenti.** Per cambiare cosa il sito mostra, modifica i dati, non il markup:
  - `materie.js` — `MATERIE[]`: catalogo materie con `slug` (stabile, non cambiare senza redirect), normativa, concorsi (`c`), e `avail` (disponibilità per formato: `ready`/`soon`/`custom`).
  - `formati.js` — `FORMATI[]`: i formati prodotto (pod/aul/vid/rep/man/sim) con prezzi.
  - `contenuti.js` — `CONTENUTI{}`: indice dettagliato per materia (episodi, capitoli, breakdown). Se una materia manca qui, `Materia.vue` fa fallback sui `topics` di `materie.js`. I campi `preview:` puntano a file audio in `public/preview/<slug>/`.
  - `legale.js` — `LEGAL_HOLDER` + `PAGES`: testi privacy/cookie/termini renderizzati da `Legale.vue`. **Unica fonte** dei dati del titolare (P.IVA, email).
- `views/` = pagine instradate, `components/` = sezioni componibili (la Home assembla Hero, Catalogo, Newsletter, ecc.). `composables/useReveal.js` registra la directive globale `v-reveal` (scroll reveal).
- Rotte chiave in `src/router/index.js`: oltre a `/materia/:slug` ci sono `/anteprime/:slug` (landing "cerca per materia → ricevi anteprima"), `/newsletter` (landing iscrizione), `/scrivimi` (form contatti) e `/quiz-pro` (riusa `Scrivimi` con `meta.tipo`). `/privacy`, `/cookie-policy`, `/termini` riusano `Legale.vue` via prop `slug`.
- Design system **brutalist** in `src/assets/main.css`: token CSS in `:root` (`--acid:#c6f432` è il giallo brand, `--ink:#0a0a0a`, ombre `--shadow*` hard-offset). Le mail HTML inline negli endpoint replicano a mano questi colori — se cambi la palette aggiorna anche gli HTML in `api/`.

### Backend — serverless function (`api/`)
Niente framework: ogni file esporta un `handler(req, res)` Vercel. Nessun servizio email terzo — si usa **Gmail SMTP via nodemailer** ovunque.

- `api/contact.js` — `POST` dal form contatti → invia mail a `ripamstudiocraft@gmail.com`. Honeypot `hp`, limiti di lunghezza, sanitizzazione tag.
- `api/newsletter/` — flusso **doppio opt-in** su DB Neon Postgres:
  - `subscribe.js` — crea/riusa subscriber in stato `pending`, genera `confirm_token`, manda mail di conferma. Rate-limit in-memory per IP. Caso speciale `source='anteprima'`: se l'email è **già confermata**, consegna subito il PDF anteprima (con dedup 5 min) invece di rifare l'opt-in.
  - `confirm.js` — `GET ?t=<token>`: conferma l'iscrizione, risponde con **pagina HTML statica** (non SPA), e dopo la conferma manda la mail di benvenuto. **Una mail sola, mai due** (dal 23/07/2026): se c'è `requested_materia`, il contenuto della welcome viene *fuso* nella mail dell'anteprima (blocco "in più, perché sei iscritto" con i link Drive di `meta.drive_file_ids_oggi`) e la welcome viene solo **registrata** come consegnata via `registerWelcomeDelivery` — send_events + registro anteprime restano identici, così il drip continua a sapere cosa ha già ricevuto. Senza `requested_materia` parte la welcome normale; se la mail fusa fallisce, la welcome standard fa da rete di sicurezza. Motivo: due mail nello stesso minuto erano la causa delle disiscrizioni immediate.
  - `unsubscribe.js` — disiscrizione one-click via `unsubscribe_token`.
  - `send.js` — `POST` protetto da header `X-Admin-Secret == ADMIN_SECRET`: spedisce una newsletter draft a tutti i confermati. **Idempotente** via `newsletter_send_events UNIQUE(subscriber_id, newsletter_id)` (anti-join filtra chi ha già ricevuto). Batch con `limit`/`rate_ms` per stare sotto il timeout serverless (10s hobby) e i limiti Gmail (~50 mail/min). Rieseguire l'endpoint per liste lunghe. Scrive in **due registri**: `newsletter_send_events` (idempotenza interna, governa chi riceve la prossima chiamata) e `invii_email` via `logInvio` (registro trasversale che i blast futuri interrogano con `giaRicevuto`), con campagna `newsletter-<basename>` — override con `meta.campagna`. La response riporta `registro_invii_ko`: se non è 0, quelle mail sono partite ma non risultano a registro → vanno loggate a mano o il prossimo blast le ricontatta.
- `api/_lib/` — moduli condivisi (non sono endpoint):
  - `email-shell.js` — guscio email **unico** (header logo brand + footer legale, stili INLINE email-safe) riusato da tutte le mail di sistema. Il logo viaggia come allegato inline `cid:logo.png` (importato da `logo-data.js`/`logo-dark-data.js` come base64) così è sempre visibile anche nei client che bloccano le immagini remote (Libero, Outlook). Se cambia palette/logo/dati legali → si cambia **qui**.
  - `anteprime-manifest.js` — `ANTEPRIME_MANIFEST` mappa `slug → fileId Google Drive` del PDF anteprima manuale (15 pp). `null` = non ancora caricato. **Single source of truth**, importato da `subscribe.js`/`confirm.js` e dalla skill `deliver-anteprima-manuale`.
  - `report-custom-manifest.js` — `REPORT_CUSTOM_MANIFEST` mappa `concorso/profilo → bundle di report custom` (più PDF) su Drive. Chiave = concorso (non slug materia) → resta **fuori** dal matching automatico delle skill. Consegna solo semi-manuale su richiesta (categoria RC di `lead-draft.mjs`), mai flusso automatico. Prezzo passato esplicitamente (vedi listino custom).
  - `anteprima-mail.js`, `welcome-newsletter.js`, `lead-mail.js` — compongono e inviano le rispettive mail.

### Dati newsletter
- Schema in `db/schema_newsletter.sql` (Neon Postgres, regione UE). Due tabelle: `newsletter_subscribers` (include **registro consensi GDPR**: `consent_text`/`consent_ip`/`consent_user_agent`/`consent_at`) e `newsletter_send_events` (audit + idempotenza). View `newsletter_active`. `apply_schema.mjs` la applica.
- Le **bozze** newsletter vivono in `messaggi-clienti/newsletter/<YYYY-MM-DD>.{html,txt,meta.json}` — i 3 file con lo stesso basename sono la "newsletter" che `send.js` legge a runtime (il `file:` nel body è il basename). Generabili con la skill `newsletter-draft`.

### Dati ordini / clienti
- Schema in `db/schema_ordini.sql` (stesso DB Neon della newsletter). Tabella `ordini` = **fonte unica degli acquisti** (chi ha comprato cosa, quando, a quanto), pensata per sostituire la ricerca a mano delle fatture in Gmail. Solo DDL nel file: i dati reali si inseriscono a runtime. View `clienti` = una riga per cliente con aggregati (n. ordini, totale speso, ultimo ordine), filtra `stato='pagato'`.
- Anti-doppione **morbido**: unique index parziale su `(LOWER(email), numero_fattura) WHERE numero_fattura IS NOT NULL` → `order_add.mjs` fa `ON CONFLICT DO NOTHING`, quindi rilanciare il backfill non duplica; ordini **senza** numero fattura vengono sempre inseriti.
- Gli script CLI (`order_add.mjs`, `orders_list.mjs`) usano l'**API HTTP** `neon()` (template tag), mentre `apply_schema.mjs` usa il `Client` TCP/WebSocket perché il DDL non passa dall'API HTTP. Tutti caricano `.env.local` a mano (stesso pattern no-`dotenv`).

### Dati candidati / profili lead
- Schema in `db/schema_candidati.sql` (stesso DB Neon). Tabella `candidati` = **fonte unica del profilo della persona** (chi è, che concorso fa, quali materie/formati le interessano), una riga per persona con chiave `email` (lowercase). Separata dagli acquisti: `candidati` = cosa vuole, `ordini` = cosa ha pagato. Colonne array `concorsi`/`materie_interesse`/`formati_interesse` **accumulate in dedup** a ogni richiesta (merge `ARRAY(SELECT DISTINCT … unnest(vecchio || nuovo))` nell'`ON CONFLICT`). View **`candidato_completo`** = profilo + aggregati acquisti (LEFT JOIN su `clienti`) → quadro 360° per proposte su misura; va applicata **dopo** `schema_ordini.sql` (dipende da `clienti`).
- L'**upsert è in `api/contact.js`** (best-effort dopo l'invio mail, non blocca la submit; skip silenzioso se manca `DATABASE_URL`). Il form invia solo `nome/email/concorso/note`: materie e formati **non sono campi strutturati**, vengono dedotti dal testo (`extractMaterie` matcha i nomi/slug di `materie.js`, `extractFormati` parole chiave, `extractConcorsi` sigle note + campo concorso). Migliorare l'estrazione = ritoccare quegli helper.

### Dati anteprime inviate (registro drip)
- Schema in `db/schema_anteprime.sql` (stesso DB Neon). Tabella `anteprime_inviate` = **fonte unica di "chi ha ricevuto quale anteprima, quando, con che canale"** (`materia` slug, `formato`, `canale` welcome/drip/lead/blast/manuale, `invio_id`). Solo DDL nel file; le righe si scrivono a runtime con `scripts/anteprima_log.mjs` e dal drip.
- Serve come **anti-doppione** al drip: `send_drip.mjs` sceglie alcune materie, e a ogni iscritto manda solo quelle non ancora ricevute (check sul registro), poi logga l'invio. Evita di rimandare a un iscritto ciò che ha già avuto da welcome/lead/blast/drip precedente.
- **Quarantena nuovi iscritti** (dal 23/07/2026): il drip salta chi è iscritto da meno di 7 giorni (`--min-eta-giorni`, `0` per disattivarla). Chi è appena entrato sta ancora ricevendo la sequenza di benvenuto; il drip sopra a quella satura l'ingresso. Su 3 disiscrizioni vere della lista, due sono avvenute così — una a 2 minuti dal drip ricevuto il giorno dopo l'iscrizione, l'altra dopo un drip arrivato 2h49 dopo. Il drip riempie i vuoti, non fa da benvenuto.

### Dati invii email (registro anti-doppione)
- Schema in `db/schema_invii.sql` (stesso DB Neon). Tabella `invii_email` = **fonte unica di "a chi ho mandato cosa, quando"**, gemella di `anteprime_inviate` ma per le *comunicazioni* (inviti, campagne, risposte lead) invece che per i materiali. Viste `invii_per_persona` (cosa ha già visto questa persona) e `invii_per_campagna` (cosa è partito e a quanti).
- **Perché esiste** (16/07/2026): prima la verità sugli invii stava solo nella Posta inviata di Gmail, e i blast usa-e-getta non lasciavano traccia → il filtro "chi ha già ricevuto?" era un *proxy* (presenza in `candidati` prima della data del blast). Il proxy mentiva: su 99 destinatari diceva "0 già invitati", la posta inviata ne conteneva **38**. Lo storico Gmail è stato riversato a DB con `scripts/backfill_invii.mjs` (1.970 righe, 429 persone).
- **Regola**: ogni script che manda mail **logga qui** via `api/_lib/invii-log.js` (`logInvio`). Chi non logga, per il sistema non è partito → la campagna dopo ricontatta la stessa persona. Il filtro anti-doppione si fa con `giaRicevuto(emails, {tipi|campagne})`, **mai** con proxy su altre tabelle.
- `campagna` = slug parlante e stabile (es. `invito-newsletter-quizpro-2026-07-16`): è la chiave dell'unique `(LOWER(email), campagna)` e quella con cui i blast futuri filtrano. Per invii ricorrenti (drip, newsletter) **la data va nello slug**, altrimenti l'unique collassa più invii in una riga sola.
- ⚠️ Gli oggetti letti da IMAP sono MIME encoded-word (`=?UTF-8?Q?…`) e "folded" su più righe: vanno **unfoldati e decodificati** prima di qualunque match, altrimenti il filtro è cieco (è l'errore che aveva prodotto il falso "0 già invitati").

### Variabili d'ambiente (`.env.local`, mai committato)
`DATABASE_URL`/`POSTGRES_URL` (Neon), `GMAIL_USER`, `GMAIL_APP_PASSWORD` (App Password Gmail), `ADMIN_SECRET` (auth di `send.js`), `PUBLIC_BASE_URL`. Su Vercel sono iniettate; in locale si fanno `npx vercel env pull .env.local`.

## Convenzioni e vincoli importanti

- **Privacy / git-ignore**: `messaggi-clienti/*` è ignorato (contiene IBAN, prezzi, dati personali dei clienti) **tranne** `messaggi-clienti/newsletter/**`, che deve arrivare in produzione perché `send.js` lo legge. Le anteprime PDF dei manuali (`public/preview/**/manuale-anteprima.pdf`) sono git-ignored: si consegnano solo via link Drive a chi le richiede, non si pubblicano dal sito.
- **Push = deploy**: Vercel fa auto-deploy da `main`. Non pushare senza chiedere all'utente (decide lui la tempistica). Lavorare su `main`.
- **Slug stabili**: gli slug in `materie.js` sono URL pubblici (`/materia/:slug`) e chiavi del manifest anteprime — cambiarli rompe link e consegne.
- **GDPR**: vedi `TODO.md` per l'adeguamento privacy pendente (consenso marketing separato). Il consenso newsletter è doppio opt-in con registro consensi completo.

## Strumenti esterni collegati (fuori da questo repo)

Esiste un ecosistema di tool Python in cartelle sorelle (`ripam-tools/`, `ripam-team-agent/`) che generano i materiali (brandizzazione PDF, estrazione manuali → `contenuti.js`, ecc.) e diverse skill Claude (`newsletter-draft`, `deliver-anteprima-manuale`, `quiz-pro-onboard`, ecc.). Non vivono in questo repo ma alimentano i suoi dati e le sue consegne.
