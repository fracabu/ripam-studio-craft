// ============================================================================
// Il token OAuth di Google Drive: dove sta, come si rinnova.
//
// Sta in un modulo suo (e non dentro drive_auth.mjs) per un motivo pratico:
// drive_auth.mjs, appena importato, aprirebbe il flusso di consenso. Chi vuole
// solo chiamare l'API deve poter prendere il token senza far partire un login.
// ============================================================================
import { readFileSync, writeFileSync } from 'node:fs'

export const CLIENT_DEFAULT = 'C:/Users/utente/yt-canale/credentials/client_secret.json'
export const TOKEN_FILE = new URL('../.drive-token.json', import.meta.url)
export const SCOPE = 'https://www.googleapis.com/auth/drive'

export function client(path = CLIENT_DEFAULT) {
  const { installed } = JSON.parse(readFileSync(path, 'utf8'))
  return installed
}

// Restituisce un access token valido, rinnovandolo col refresh_token se serve.
export async function accessToken() {
  let t
  try { t = JSON.parse(readFileSync(TOKEN_FILE, 'utf8')) }
  catch { throw new Error('nessun token Drive: lancia prima `node scripts/drive_auth.mjs`') }

  if (t.expiry_date && Date.now() < t.expiry_date - 60_000) return t.access_token

  const c = client()
  const r = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: c.client_id, client_secret: c.client_secret,
      refresh_token: t.refresh_token, grant_type: 'refresh_token',
    }),
  })
  const j = await r.json()
  if (!j.access_token) throw new Error(`refresh del token Drive fallito: ${JSON.stringify(j)}`)
  writeFileSync(TOKEN_FILE, JSON.stringify({ ...t, access_token: j.access_token, expiry_date: Date.now() + j.expires_in * 1000 }, null, 2))
  return j.access_token
}
