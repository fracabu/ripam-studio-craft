# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Cos'è

Landing page + funnel di **Ripam Studio Craft**: materiali didattici generati con AI (podcast, audio lezioni, video, report, manuali, simulatori) per concorsi pubblici italiani (RIPAM, MIC, MIMIT, ecc.). SPA Vue 3 servita da Vercel con alcune serverless function Node per form contatti e newsletter. Single-author, hobby Vercel plan. Lingua: tutto in italiano.

## Comandi

```bash
npm run dev        # Vite dev server su localhost:5173 (apre il browser)
npm run build      # build di produzione in dist/
npm run preview    # preview della build

node db/apply_schema.mjs                              # applica/migra TUTTI gli schema Neon (newsletter + ordini, idempotente)
node db/apply_schema.mjs schema_ordini.sql           # applica un solo schema
node scripts/send_newsletter.mjs <YYYY-MM-DD> --dry-run   # invio newsletter in locale (vedi sotto)

# Registro acquisti (tabella `ordini` su Neon) — gira a PC acceso, legge .env.local
node scripts/order_add.mjs --email <email> --prodotto "<testo>" [--importo 29.98 --fattura 8/2026 ...]
node scripts/orders_list.mjs                         # vista clienti aggregati (view `clienti`) + fatturato
node scripts/orders_list.mjs --ordini                # tutti gli ordini, riga per riga
node scripts/orders_list.mjs --email <email>         # ordini di un singolo cliente
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
- Design system **brutalist** in `src/assets/main.css`: token CSS in `:root` (`--acid:#c6f432` è il giallo brand, `--ink:#0a0a0a`, ombre `--shadow*` hard-offset). Le mail HTML inline negli endpoint replicano a mano questi colori — se cambi la palette aggiorna anche gli HTML in `api/`.

### Backend — serverless function (`api/`)
Niente framework: ogni file esporta un `handler(req, res)` Vercel. Nessun servizio email terzo — si usa **Gmail SMTP via nodemailer** ovunque.

- `api/contact.js` — `POST` dal form contatti → invia mail a `ripamstudiocraft@gmail.com`. Honeypot `hp`, limiti di lunghezza, sanitizzazione tag.
- `api/newsletter/` — flusso **doppio opt-in** su DB Neon Postgres:
  - `subscribe.js` — crea/riusa subscriber in stato `pending`, genera `confirm_token`, manda mail di conferma. Rate-limit in-memory per IP. Caso speciale `source='anteprima'`: se l'email è **già confermata**, consegna subito il PDF anteprima (con dedup 5 min) invece di rifare l'opt-in.
  - `confirm.js` — `GET ?t=<token>`: conferma l'iscrizione, risponde con **pagina HTML statica** (non SPA), e dopo la conferma manda welcome + eventuale anteprima.
  - `unsubscribe.js` — disiscrizione one-click via `unsubscribe_token`.
  - `send.js` — `POST` protetto da header `X-Admin-Secret == ADMIN_SECRET`: spedisce una newsletter draft a tutti i confermati. **Idempotente** via `newsletter_send_events UNIQUE(subscriber_id, newsletter_id)` (anti-join filtra chi ha già ricevuto). Batch con `limit`/`rate_ms` per stare sotto il timeout serverless (10s hobby) e i limiti Gmail (~50 mail/min). Rieseguire l'endpoint per liste lunghe.
- `api/_lib/` — moduli condivisi (non sono endpoint):
  - `anteprime-manifest.js` — `ANTEPRIME_MANIFEST` mappa `slug → fileId Google Drive` del PDF anteprima manuale (15 pp). `null` = non ancora caricato. **Single source of truth**, importato da `subscribe.js`/`confirm.js` e dalla skill `deliver-anteprima-manuale`.
  - `anteprima-mail.js`, `welcome-newsletter.js` — compongono e inviano le rispettive mail.

### Dati newsletter
- Schema in `db/schema_newsletter.sql` (Neon Postgres, regione UE). Due tabelle: `newsletter_subscribers` (include **registro consensi GDPR**: `consent_text`/`consent_ip`/`consent_user_agent`/`consent_at`) e `newsletter_send_events` (audit + idempotenza). View `newsletter_active`. `apply_schema.mjs` la applica.
- Le **bozze** newsletter vivono in `messaggi-clienti/newsletter/<YYYY-MM-DD>.{html,txt,meta.json}` — i 3 file con lo stesso basename sono la "newsletter" che `send.js` legge a runtime (il `file:` nel body è il basename). Generabili con la skill `newsletter-draft`.

### Dati ordini / clienti
- Schema in `db/schema_ordini.sql` (stesso DB Neon della newsletter). Tabella `ordini` = **fonte unica degli acquisti** (chi ha comprato cosa, quando, a quanto), pensata per sostituire la ricerca a mano delle fatture in Gmail. Solo DDL nel file: i dati reali si inseriscono a runtime. View `clienti` = una riga per cliente con aggregati (n. ordini, totale speso, ultimo ordine), filtra `stato='pagato'`.
- Anti-doppione **morbido**: unique index parziale su `(LOWER(email), numero_fattura) WHERE numero_fattura IS NOT NULL` → `order_add.mjs` fa `ON CONFLICT DO NOTHING`, quindi rilanciare il backfill non duplica; ordini **senza** numero fattura vengono sempre inseriti.
- Gli script CLI (`order_add.mjs`, `orders_list.mjs`) usano l'**API HTTP** `neon()` (template tag), mentre `apply_schema.mjs` usa il `Client` TCP/WebSocket perché il DDL non passa dall'API HTTP. Tutti caricano `.env.local` a mano (stesso pattern no-`dotenv`).

### Variabili d'ambiente (`.env.local`, mai committato)
`DATABASE_URL`/`POSTGRES_URL` (Neon), `GMAIL_USER`, `GMAIL_APP_PASSWORD` (App Password Gmail), `ADMIN_SECRET` (auth di `send.js`), `PUBLIC_BASE_URL`. Su Vercel sono iniettate; in locale si fanno `npx vercel env pull .env.local`.

## Convenzioni e vincoli importanti

- **Privacy / git-ignore**: `messaggi-clienti/*` è ignorato (contiene IBAN, prezzi, dati personali dei clienti) **tranne** `messaggi-clienti/newsletter/**`, che deve arrivare in produzione perché `send.js` lo legge. Le anteprime PDF dei manuali (`public/preview/**/manuale-anteprima.pdf`) sono git-ignored: si consegnano solo via link Drive a chi le richiede, non si pubblicano dal sito.
- **Push = deploy**: Vercel fa auto-deploy da `main`. Non pushare senza chiedere all'utente (decide lui la tempistica). Lavorare su `main`.
- **Slug stabili**: gli slug in `materie.js` sono URL pubblici (`/materia/:slug`) e chiavi del manifest anteprime — cambiarli rompe link e consegne.
- **GDPR**: vedi `TODO.md` per l'adeguamento privacy pendente (consenso marketing separato). Il consenso newsletter è doppio opt-in con registro consensi completo.

## Strumenti esterni collegati (fuori da questo repo)

Esiste un ecosistema di tool Python in cartelle sorelle (`ripam-tools/`, `ripam-team-agent/`) che generano i materiali (brandizzazione PDF, estrazione manuali → `contenuti.js`, ecc.) e diverse skill Claude (`newsletter-draft`, `deliver-anteprima-manuale`, `quiz-pro-onboard`, ecc.). Non vivono in questo repo ma alimentano i suoi dati e le sue consegne.
