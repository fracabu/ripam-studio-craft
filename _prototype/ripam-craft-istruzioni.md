# Ripam Studio Craft — Istruzioni per la Landing Page

## Cos'è

Landing page catalogo per **Ripam Studio Craft**, il servizio premium di materiali didattici per la preparazione ai concorsi pubblici italiani.

**Non è un e-commerce.** È un catalogo visivo. Il cliente sfoglia, sceglie, poi contatta direttamente il venditore via email o Telegram. Paga e riceve i materiali entro 24-48 ore su Telegram.

---

## Brand e credenziali

- **Nome**: Ripam Studio Craft
- **Collegamento**: dalla stessa piattaforma di Ripam Studio (ripam-studio.vercel.app)
- **Numeri di credibilità da mostrare nella hero**:
  - 625.000 visite in 3 mesi
  - 14.000+ community
  - 20 materie disponibili
  - 4 formati per ogni materia
- **Disclaimer da mostrare in modo positivo** (non difensivo):
  > "Contenuti generati con AI da testi normativi ufficiali, revisionati manualmente. Se trovi un'imprecisione, te la correggiamo subito — gratuitamente."

---

## Struttura della pagina

### 1. NAV
- Logo: "Ripam Studio Craft"
- Link: "Catalogo" | "Come funziona" | "Contatti"
- Fisso in alto, sfondo semi-trasparente con blur

### 2. HERO
- Headline principale: **"Materiali didattici per concorsi pubblici. Fatti sul serio."**
- Sottotitolo: "Podcast, video, report e simulatori costruiti su normativa ufficiale verificata. Per ogni materia, ogni concorso."
- Badge credibilità: "Dalla piattaforma con 625.000 visite in 3 mesi"
- Due CTA: [Sfoglia il catalogo →] [Come funziona]

### 3. FILTRO CONCORSI
- Bottoni filtro orizzontali: **TUTTI / RIPAM / MIC / FUNZ / MIMIT / ISAC / CPI**
- Cliccando un concorso, le card materia si filtrano dinamicamente (JS, no reload)
- Bottone attivo evidenziato in oro

### 4. CATALOGO MATERIE
- Griglia di card, una per materia
- Ogni card mostra:
  - Nome materia
  - Normativa di riferimento (es. "L. 241/1990")
  - Badge concorsi compatibili (es. RIPAM, MIC, FUNZ) — colorati diversamente per concorso
  - 4 icone prodotto disponibili: 🎙️ Podcast · 🎥 Video · 📄 Report · 🎯 Simulatore
  - Prezzo placeholder: "da [PREZZO]€"
  - Bottone: [Scopri →] che espande o apre dettaglio

- **Al click sulla card** si espande una sezione con 4 sotto-card prodotto:

#### Le 4 sotto-card per ogni materia:

**🎙️ Serie Podcast**
- 8 episodi audio, durata totale ~3 ore
- Generati con NotebookLM da testi normativi ufficiali
- Formato: MP3
- Ideale per: studiare in mobilità, in auto, in palestra

**🎥 Serie Video**
- 8 episodi video
- Stessa struttura del podcast, formato video
- Formato: MP4
- Ideale per: studio visivo, ripasso veloce

**📄 Report di Studio**
- PDF strutturato per la preparazione
- Include: sintesi normativa, punti chiave, trabocchetti frequenti, tavole riassuntive
- Aggiornato alle ultime modifiche normative 2026
- Formato: PDF

**🎯 Simulatore**
- 3.000 domande per materia
- File HTML offline: apri nel browser, nessuna installazione
- Include: modalità esame (timer + penalità), modalità studio (spiegazioni), ripasso errori, statistiche sessione
- Domande con distrattori calibrati, spiegazione normativa per ogni risposta
- Formato: HTML (funziona offline su qualsiasi dispositivo)

Ogni sotto-card ha:
- Descrizione breve
- Formato file
- Prezzo placeholder: "[PREZZO]€"
- Bottone: [Richiedi questo →] che porta al form precompilato con materia e prodotto già selezionati

### 5. BUNDLE CONSIGLIATI
- **Bundle Materia Completa**: tutti e 4 i prodotti per una materia — "[PREZZO]€" (risparmio % rispetto ai singoli)
- **Bundle RIPAM Completo**: tutte le materie del concorso RIPAM — "[PREZZO]€"
- **Bundle Tutto**: tutte le 20 materie, tutti i formati — "[PREZZO]€"

### 6. COME FUNZIONA
3 passi semplici:
1. **Sfoglia il catalogo** — trova la materia e il formato che ti serve
2. **Scrivici** — via email o Telegram, ti confermiamo disponibilità e pagamento
3. **Ricevi tutto** — entro 24-48 ore su Telegram, pronti da usare

### 7. COSA RICEVI
Feature principali da comunicare:
- ✅ Normativa ufficiale (non manuali datati)
- ✅ Distrattori calibrati come nelle prove reali
- ✅ Simulatore offline (nessun account, nessuna connessione)
- ✅ Aggiornato 2026 (autonomia differenziata, D.Lgs. 36/2023, ecc.)
- ✅ Revisione umana su ogni contenuto
- ✅ Correzione gratuita se trovi errori

### 8. FORM CONTATTO
Campi:
- Nome (testo)
- Email (email)
- Concorso di interesse (select: RIPAM / MIC / FUNZ / MIMIT / ISAC / CPI / Altro)
- Materia (select con tutte le 20 materie)
- Prodotto (select: Podcast / Video / Report / Simulatore / Bundle materia / Bundle completo)
- Note (textarea, opzionale)
- Bottone: "Invia richiesta"

**Al submit**: apre mailto:[EMAIL-PLACEHOLDER] con oggetto e corpo precompilati con i dati del form.

Nota sotto il form:
> "Nessun pagamento anticipato. Ti rispondiamo entro poche ore con le istruzioni."

Contatto alternativo:
> "Preferisci Telegram? Scrivici su t.me/ripam3997studio"

### 9. FAQ
1. **Perché non posso comprare direttamente?** — Gestiamo ogni ordine personalmente per garantire la qualità. Ti rispondiamo entro poche ore.
2. **Come ricevo i materiali?** — Via Telegram entro 24-48 ore dalla conferma del pagamento.
3. **I contenuti sono aggiornati?** — Sì, generati da normativa ufficiale aggiornata al 2026.
4. **Sono generati con AI?** — Sì, con AI da testi normativi ufficiali e revisionati manualmente. Se trovi errori li correggiamo gratis.
5. **Posso comprare solo una materia?** — Sì, ogni prodotto è acquistabile singolarmente.

### 10. FOOTER
- Logo Ripam Studio Craft
- Link: ripam-studio.vercel.app (piattaforma gratuita)
- Link: t.me/ripam3997studio
- Note legale: "Contenuti per uso personale di studio. P.IVA [PLACEHOLDER]"

---

## Le 20 materie disponibili

Organizzate per concorso di riferimento:

### Materie RIPAM principali
1. **Diritto Amministrativo** — L. 241/1990 — RIPAM MIC FUNZ MIMIT
2. **Pubblico Impiego** — D.Lgs. 165/2001 — RIPAM MIC FUNZ MIMIT ISAC
3. **Contratti Pubblici** — D.Lgs. 36/2023 — RIPAM MIC MIMIT ISAC
4. **Ordinamento PA** — D.Lgs. 300/1999 — RIPAM MIC FUNZ MIMIT
5. **Diritto Penale PA** — RIPAM MIC FUNZ MIMIT ISAC
6. **CAD** — D.Lgs. 82/2005 — RIPAM MIC FUNZ MIMIT ISAC
7. **Diritto Costituzionale** — Costituzione — FUNZ MIMIT CPI
8. **Diritto UE** — Trattati e Istituzioni — RIPAM MIC MIMIT
9. **GDPR** — Reg. UE 2016/679 — RIPAM FUNZ MIMIT
10. **Informatica** — RIPAM MIC FUNZ MIMIT ISAC
11. **Inglese A2** — RIPAM MIC ISAC
12. **Logica** — Ragionamento logico — RIPAM MIC FUNZ MIMIT
13. **Sicurezza Lavoro** — D.Lgs. 81/2008 — MIC ISAC

### Materie MIC
14. **Patrimonio Culturale** — Diritto — MIC
15. **Beni Culturali** — MIC
16. **Archeologia Arte Musei** — MIC
17. **Scavo e Ricerca Archeologica** — MIC
18. **Marketing e Comunicazione** — MIC
19. **Organizzazione MIC** — MIC

### Altre materie
20. **Diritto Civile** — Codice Civile — FUNZ MIMIT

---

## Colori badge per concorso
- RIPAM → blu (#1a3a6b)
- MIC → verde scuro (#1a4a2a)
- FUNZ → viola (#3a1a6b)
- MIMIT → arancio scuro (#6b3a1a)
- ISAC → rosso scuro (#6b1a1a)
- CPI → teal (#1a4a4a)

---

## Stile visivo

- **Tema**: dark elegante, professionale
- **Font titoli**: Playfair Display (Google Fonts)
- **Font corpo**: DM Sans (Google Fonts)
- **Palette**:
  - Sfondo: `#080c18` (blu notte profondo)
  - Sfondo card: `#0f1420`
  - Oro: `#c9a84c`
  - Oro chiaro: `#e8d5a3`
  - Testo: `#f5f2eb`
  - Testo secondario: `rgba(245,242,235,0.6)`
  - Bordi: `rgba(245,242,235,0.08)`
- **Effetti**:
  - Card con bordo oro sottile al hover
  - Animazioni fade-up all'entrata (IntersectionObserver)
  - Filtro concorsi con transizione smooth
  - Espansione card con animazione
- **Mobile first**, completamente responsive
- **Zero framework CSS esterni** — solo Google Fonts
- Texture noise sottile sull'sfondo

---

## Note tecniche

- File singolo HTML (tutto inline: CSS + JS + HTML)
- Nessun backend, nessuna API
- Il form apre `mailto:` con dati precompilati
- Il filtro concorsi usa JS puro (data attributes sulle card)
- Le card espandibili usano CSS + JS puro
- I prezzi sono tutti placeholder `[PREZZO]€` — verranno definiti separatamente
- L'email di contatto è placeholder `[EMAIL]`
- La P.IVA è placeholder `[PIVA]`
- Compatibile con tutti i browser moderni
- Ottimizzato per mobile (la maggior parte degli utenti arriva da Facebook mobile)

---

## Tono e voce

- **Autorevole ma umano** — non freddo, non troppo marketing
- **Concreto** — niente promesse vaghe, solo fatti (625k visite, 3.000 domande, 8 episodi)
- **Onesto sull'AI** — dichiarato come punto di forza, non nascosto
- **Diretto** — il cliente sa subito cosa c'è, quanto costa (approssimativamente), come acquistare
- **Italiano corretto** — niente anglicismi inutili

---

## Cosa NON fare

- Non mettere prezzi definitivi (sono placeholder)
- Non simulare un checkout o carrello
- Non promettere cose non ancora disponibili
- Non nascondere che i contenuti sono generati con AI
- Non usare layout generici da template — deve sembrare fatto su misura
