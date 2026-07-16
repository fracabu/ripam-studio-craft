// ============================================================================
// Logging del registro anteprime (`anteprime_inviate`) — modulo condiviso.
//
// PERCHÉ ESISTE (2026-07-16): il registro serve al DRIP come anti-doppione, ma
// fino a oggi NESSUN endpoint ci scriveva: le uniche righe 'welcome' erano 14,
// inserite a mano, contro 146 nuovi iscritti in 30 giorni. Risultato: il drip
// non sapeva cosa la welcome aveva già consegnato e poteva rimandare la stessa
// anteprima a chi l'aveva appena ricevuta.
//
// Stesso principio del registro invii (api/_lib/invii-log.js): chi consegna,
// logga. Best-effort — se il log fallisce la mail è già partita, quindi si
// segnala e si prosegue: mai far fallire una consegna per colpa del registro.
// ============================================================================
import { neon } from '@neondatabase/serverless'

function getSql() {
  const url = process.env.DATABASE_URL || process.env.POSTGRES_URL
  if (!url) return null
  return neon(url)
}

/**
 * Registra la consegna di un'anteprima.
 * Idempotente: UNIQUE(LOWER(email), materia, formato) + DO NOTHING.
 *
 * @param {object} p
 * @param {string} p.email
 * @param {string} [p.nome]
 * @param {string} p.materia   slug come in src/data/materie.js (es. 'diritto-amministrativo')
 * @param {string} [p.formato] completa-avm | audio | video | manuale | report | kit | altro
 * @param {string} [p.canale]  welcome | drip | lead | blast | manuale
 * @param {string} [p.invioId] id del pacchetto (es. newsletter_id) per ricostruire l'invio
 * @returns {Promise<'inserita'|'gia-presente'|'skip-no-db'|'errore'>}
 */
export async function logAnteprima({
  email, nome = null, materia, formato = 'completa-avm',
  canale = 'manuale', invioId = null, note = null,
}) {
  if (!email || !materia) throw new Error('logAnteprima: email e materia sono obbligatorie')
  const sql = getSql()
  if (!sql) return 'skip-no-db'
  try {
    const rows = await sql`
      INSERT INTO anteprime_inviate (email, nome, materia, formato, canale, invio_id, note)
      VALUES (${String(email).toLowerCase().trim()}, ${nome}, ${materia}, ${formato}, ${canale}, ${invioId}, ${note})
      ON CONFLICT DO NOTHING
      RETURNING id`
    return rows.length ? 'inserita' : 'gia-presente'
  } catch (e) {
    console.error(`[WARN] registro anteprime: log fallito per ${email}/${materia} — ${e.message}`)
    return 'errore'
  }
}
