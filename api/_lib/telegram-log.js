// ============================================================================
// Memoria del bot Telegram — modulo condiviso (vedi db/schema_telegram.sql).
//
// Il webhook riceveva, rispondeva e dimenticava. Qui c'e' il minimo che serve
// perche' "rispondi ad Anna" abbia un senso: sapere chi ha scritto, cosa, e
// quando.
//
// Tutto e' BEST-EFFORT verso il webhook: se il DB e' irraggiungibile il bot
// deve continuare a rispondere ai comandi. Un messaggio non salvato e' una
// memoria piu' corta, un webhook che va in errore e' un bot morto — e Telegram
// ritenta l'update all'infinito.
//
// ⚠️ I messaggi dei membri sono dati personali di 1.814 persone: finestra 7
// giorni, niente media, non escono da qui (.claude/rules/never.md).
// ============================================================================
import { neon } from '@neondatabase/serverless'

function getSql() {
  const url = process.env.DATABASE_URL || process.env.POSTGRES_URL
  if (!url) return null
  return neon(url)
}

// Di un media si annota il TIPO, mai il contenuto: un vocale di un membro non
// si trascrive e una foto non si archivia.
function tipoDi(msg) {
  if (msg.text) return msg.text.startsWith('/') ? 'comando' : 'text'
  if (msg.caption) return 'caption'
  if (msg.voice) return 'voice'
  if (msg.photo) return 'photo'
  if (msg.video || msg.video_note) return 'video'
  if (msg.document) return 'document'
  if (msg.sticker) return 'sticker'
  return 'altro'
}

const nomeDi = (u) => [u?.first_name, u?.last_name].filter(Boolean).join(' ') || null

/**
 * Salva un messaggio del gruppo nel buffer.
 * Idempotente: UNIQUE(chat_id, message_id) + DO NOTHING, perche' Telegram
 * ritenta la consegna finche' non riceve 200 e lo stesso update puo' arrivare
 * piu' volte.
 *
 * @returns {Promise<'salvato'|'gia-presente'|'skip-no-db'|'errore'>}
 */
export async function salvaMessaggio(msg) {
  const sql = getSql()
  if (!sql) return 'skip-no-db'
  try {
    const rows = await sql`
      INSERT INTO telegram_messaggi
        (chat_id, message_id, thread_id, user_id, username, nome, testo, tipo, reply_to, e_bot, inviato_at)
      VALUES (
        ${msg.chat?.id}, ${msg.message_id}, ${msg.message_thread_id || null},
        ${msg.from?.id || null}, ${msg.from?.username || null}, ${nomeDi(msg.from)},
        ${msg.text || msg.caption || null}, ${tipoDi(msg)},
        ${msg.reply_to_message?.message_id || null}, ${!!msg.from?.is_bot},
        ${new Date((msg.date || Math.floor(Date.now() / 1000)) * 1000).toISOString()}
      )
      ON CONFLICT DO NOTHING
      RETURNING id`
    return rows.length ? 'salvato' : 'gia-presente'
  } catch (e) {
    console.error(`[WARN] buffer telegram: salvataggio fallito — ${e.message}`)
    return 'errore'
  }
}

/**
 * Chi puo' essere "Anna"? Restituisce i candidati attivi negli ultimi giorni,
 * dal piu' recente.
 *
 * Non sceglie: restituisce l'elenco. Nel gruppo gli omonimi sono la norma e
 * rispondere alla persona sbagliata, in pubblico, e' peggio che chiedere.
 */
export async function cercaPersona(nome, { giorni = 7 } = {}) {
  const sql = getSql()
  if (!sql || !nome?.trim()) return []
  try {
    const q = `%${nome.trim().toLowerCase()}%`
    return await sql`
      SELECT user_id, nome, username, n_messaggi, ultimo_messaggio_at
      FROM telegram_persone
      WHERE LOWER(nome) LIKE ${q} OR LOWER(COALESCE(username, '')) LIKE ${q}
      ORDER BY ultimo_messaggio_at DESC
      LIMIT 10`
  } catch (e) {
    console.error(`[WARN] ricerca persona: ${e.message}`)
    return []
  }
}

/** Gli ultimi messaggi di una persona: il contesto di cosa aveva chiesto. */
export async function ultimiMessaggi(userId, { limite = 5 } = {}) {
  const sql = getSql()
  if (!sql || !userId) return []
  try {
    return await sql`
      SELECT chat_id, message_id, thread_id, testo, tipo, inviato_at
      FROM telegram_messaggi
      WHERE user_id = ${userId} AND e_bot = false
      ORDER BY inviato_at DESC
      LIMIT ${limite}`
  } catch (e) {
    console.error(`[WARN] ultimi messaggi: ${e.message}`)
    return []
  }
}

/**
 * Un messaggio dal suo message_id, per rispondergli.
 *
 * Serve al passo finale di "rispondi a <nome>": il comando di conferma porta
 * con se' solo il message_id (il webhook e' stateless, non c'e' una sessione
 * dove tenere la persona scelta), e da li' bisogna risalire a chat_id e
 * thread_id per agganciare la reply al punto giusto della conversazione.
 */
export async function messaggioPerId(messageId, { chatId = null } = {}) {
  const sql = getSql()
  if (!sql || !messageId) return null
  try {
    const righe = chatId
      ? await sql`
          SELECT chat_id, message_id, thread_id, user_id, nome, testo, inviato_at
          FROM telegram_messaggi
          WHERE message_id = ${messageId} AND chat_id = ${chatId} LIMIT 1`
      : await sql`
          SELECT chat_id, message_id, thread_id, user_id, nome, testo, inviato_at
          FROM telegram_messaggi
          WHERE message_id = ${messageId}
          ORDER BY inviato_at DESC LIMIT 1`
    return righe[0] || null
  } catch (e) {
    console.error(`[WARN] messaggio per id: ${e.message}`)
    return null
  }
}

/** Una scheda dal suo slug, per pubblicarla su conferma esplicita. */
export async function templatePerSlug(slug) {
  const sql = getSql()
  if (!sql || !slug?.trim()) return null
  try {
    const righe = await sql`
      SELECT slug, titolo, categoria, testo, auto, attivo, bando
      FROM telegram_template WHERE slug = ${slug.trim().toLowerCase()} LIMIT 1`
    return righe[0] || null
  } catch (e) {
    console.error(`[WARN] template per slug: ${e.message}`)
    return null
  }
}

/**
 * Cancella i messaggi oltre la finestra di conservazione.
 * Va chiamata da uno script periodico: la retention dichiarata nello schema
 * senza qualcuno che la esegue e' solo un commento.
 */
export async function purga({ giorni = 7 } = {}) {
  const sql = getSql()
  if (!sql) return 0
  const rows = await sql`
    DELETE FROM telegram_messaggi
    WHERE inviato_at < now() - (${giorni} * INTERVAL '1 day')
    RETURNING id`
  return rows.length
}

/**
 * Cerca il template che risponde a un testo, per innesco.
 * Il match e' volutamente semplice e leggibile (contiene la frase-innesco):
 * la parte difficile non e' l'algoritmo, sono gli inneschi, che vanno scritti
 * con le parole dei membri e non con quelle del bando.
 */
export async function trovaTemplate(testo) {
  const sql = getSql()
  if (!sql || !testo?.trim()) return null
  const t = testo.toLowerCase()
  try {
    const righe = await sql`
      SELECT slug, titolo, categoria, inneschi, testo, auto, bando
      FROM telegram_template
      WHERE attivo = true`
    let migliore = null, punti = 0
    for (const r of righe) {
      for (const innesco of r.inneschi || []) {
        const i = innesco.toLowerCase().trim()
        // L'innesco piu' lungo che compare nel messaggio vince: "come faccio ad
        // acquistare" deve battere "acquist", altrimenti la scheda generica
        // copre sempre quella specifica.
        if (i && t.includes(i) && i.length > punti) { punti = i.length; migliore = r }
      }
    }
    return migliore
  } catch (e) {
    console.error(`[WARN] ricerca template: ${e.message}`)
    return null
  }
}

/** Registra cosa il bot ha risposto: senza questo, non e' mai successo. */
export async function logRisposta({
  templateSlug = null, chatId, inRispostaA = null, messageId = null,
  userId = null, nome = null, modo = 'auto',
}) {
  const sql = getSql()
  if (!sql) return 'skip-no-db'
  try {
    await sql`
      INSERT INTO telegram_risposte (template_slug, chat_id, in_risposta_a, message_id, user_id, nome, modo)
      VALUES (${templateSlug}, ${chatId}, ${inRispostaA}, ${messageId}, ${userId}, ${nome}, ${modo})`
    if (templateSlug) {
      await sql`
        UPDATE telegram_template
        SET usi = usi + 1, ultimo_uso_at = now()
        WHERE slug = ${templateSlug}`
    }
    return 'registrata'
  } catch (e) {
    console.error(`[WARN] registro risposte: ${e.message}`)
    return 'errore'
  }
}
