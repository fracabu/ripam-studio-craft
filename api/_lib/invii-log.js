// ============================================================================
// Logging del registro invii (`invii_email`) — modulo condiviso.
//
// REGOLA DEL REGISTRO: ogni script che manda una mail scrive qui la sua riga.
// Chi non logga, per il sistema non è partito → la campagna successiva lo
// ricontatta e la persona riceve un doppione.
//
// Perché esiste (2026-07-16): prima di questo modulo la verità sugli invii stava
// solo nella Posta inviata di Gmail, e i filtri anti-doppione erano proxy sul DB.
// Il proxy sbagliava: su 99 destinatari diceva "0 già invitati", la posta inviata
// ne aveva 38. Vedi db/schema_invii.sql.
//
// Best-effort per costruzione: se il log fallisce, la mail è già partita e non
// si può "disinviare" — quindi si logga l'errore e si va avanti, MA il chiamante
// deve stampare il warning: una riga mancante qui è un doppione domani.
// ============================================================================
import { neon } from '@neondatabase/serverless'

function getSql() {
  const url = process.env.DATABASE_URL || process.env.POSTGRES_URL
  if (!url) return null
  return neon(url)
}

/**
 * Registra un invio. Idempotente: UNIQUE(LOWER(email), campagna) + DO NOTHING,
 * quindi rilanciare un blast interrotto non duplica le righe.
 *
 * @returns {Promise<'inserita'|'gia-presente'|'skip-no-db'|'errore'>}
 */
export async function logInvio({
  email, nome = null, campagna, oggetto = null,
  tipo = 'altro', canale = 'manuale', messageId = null,
  esito = 'sent', errore = null, inviataAt = null,
}) {
  if (!email || !campagna) throw new Error('logInvio: email e campagna sono obbligatorie')
  const sql = getSql()
  if (!sql) return 'skip-no-db'
  try {
    const rows = await sql`
      INSERT INTO invii_email (email, nome, campagna, oggetto, tipo, canale, message_id, esito, errore, inviata_at)
      VALUES (${String(email).toLowerCase().trim()}, ${nome}, ${campagna}, ${oggetto}, ${tipo}, ${canale},
              ${messageId}, ${esito}, ${errore}, ${inviataAt || new Date().toISOString()})
      ON CONFLICT DO NOTHING
      RETURNING id`
    return rows.length ? 'inserita' : 'gia-presente'
  } catch (e) {
    console.error(`[WARN] registro invii: log fallito per ${email} — ${e.message}`)
    return 'errore'
  }
}

/**
 * Chi, tra questi indirizzi, ha già ricevuto qualcosa? Sostituisce i proxy DB
 * ("è in candidati da prima del blast?") con la verità registrata.
 *
 * @param {string[]} emails
 * @param {{campagne?: string[], tipi?: string[]}} filtro
 *   campagne: esclude chi ha ricevuto una di QUESTE campagne (match esatto)
 *   tipi:     esclude chi ha ricevuto un invio di uno di QUESTI tipi (es. ['invito'])
 * @returns {Promise<Set<string>>} email (lowercase) già raggiunte
 */
export async function giaRicevuto(emails, { campagne = null, tipi = null } = {}) {
  const sql = getSql()
  if (!sql || !emails?.length) return new Set()
  const lower = emails.map(e => String(e).toLowerCase().trim())
  let rows
  if (campagne?.length) {
    rows = await sql`
      SELECT DISTINCT LOWER(email) AS email FROM invii_email
      WHERE LOWER(email) = ANY(${lower}) AND campagna = ANY(${campagne}) AND esito = 'sent'`
  } else if (tipi?.length) {
    rows = await sql`
      SELECT DISTINCT LOWER(email) AS email FROM invii_email
      WHERE LOWER(email) = ANY(${lower}) AND tipo = ANY(${tipi}) AND esito = 'sent'`
  } else {
    rows = await sql`
      SELECT DISTINCT LOWER(email) AS email FROM invii_email
      WHERE LOWER(email) = ANY(${lower}) AND esito = 'sent'`
  }
  return new Set(rows.map(r => r.email))
}
