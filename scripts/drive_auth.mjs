#!/usr/bin/env node
// ============================================================================
// Login una-tantum a Google Drive per l'account ripamstudiocraft.
//
// Perche' esiste: il connettore Drive di Claude e' in SOLA LETTURA, e le altre
// credenziali sul PC hanno scope che non c'entrano (gmail.modify per la posta,
// youtube.upload per il canale). Per caricare i materiali nelle cartelle di
// consegna serviva un token con accesso in scrittura al Drive: questo lo crea.
//
//   node scripts/drive_auth.mjs              # apre il consenso e salva il token
//   node scripts/drive_auth.mjs --stato      # dice se il token c'e' e per chi
//
// Il token finisce in .drive-token.json (git-ignored: sono credenziali vere).
// Il client OAuth riusato e' quello gia' creato per il canale YouTube; l'API
// Drive va abilitata su QUEL progetto Google Cloud, se non lo e' gia' — il
// primo comando che fallisce lo dice con il link giusto per abilitarla.
// ============================================================================
import { writeFileSync, existsSync, readFileSync } from 'node:fs'
import { createServer } from 'node:http'
import { spawn } from 'node:child_process'
import { accessToken, client, CLIENT_DEFAULT, TOKEN_FILE, SCOPE } from './drive_token.mjs'

const CLIENT = process.argv.includes('--client')
  ? process.argv[process.argv.indexOf('--client') + 1]
  : CLIENT_DEFAULT

const chiE = async (tok) => {
  const r = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: { authorization: `Bearer ${tok}` },
  })
  return r.json().catch(() => ({}))
}

// --- stato -------------------------------------------------------------------
if (process.argv.includes('--stato')) {
  if (!existsSync(TOKEN_FILE)) { console.log('[no] nessun token: lancia `node scripts/drive_auth.mjs`'); process.exit(1) }
  const u = await chiE(await accessToken())
  const t = JSON.parse(readFileSync(TOKEN_FILE, 'utf8'))
  console.log(`[ok] token presente${u.email ? ` — account ${u.email}` : ''}`)
  console.log(`     scope: ${t.scope}`)
  process.exit(0)
}

// --- consenso ----------------------------------------------------------------
if (!existsSync(CLIENT)) { console.error(`[FAIL] client OAuth non trovato: ${CLIENT}`); process.exit(1) }
const c = client(CLIENT)

// Loopback su porta effimera: e' il flusso previsto per le "installed app".
const server = createServer()
await new Promise(r => server.listen(0, '127.0.0.1', r))
const REDIRECT = `http://127.0.0.1:${server.address().port}`

const url = 'https://accounts.google.com/o/oauth2/v2/auth?' + new URLSearchParams({
  client_id: c.client_id, redirect_uri: REDIRECT, response_type: 'code',
  scope: SCOPE, access_type: 'offline', prompt: 'consent',
})

console.log('\nApri questo indirizzo e autorizza CON L\'ACCOUNT ripamstudiocraft@gmail.com:\n')
console.log(url + '\n')
console.log(`(resto in ascolto su ${REDIRECT} — la pagina si chiude da sola)\n`)
// ⚠️ NON usare `cmd /c start <url>`: cmd tratta le & dell'URL come separatori di
// comando, il link arriva al browser troncato dopo client_id e Google risponde
// "Required parameter is missing: response_type". rundll32 non fa parsing.
try { spawn('rundll32', ['url.dll,FileProtocolHandler', url], { detached: true, stdio: 'ignore' }).unref() } catch { /* si apre a mano */ }

const code = await new Promise((resolve) => {
  server.on('request', (req, res) => {
    const u = new URL(req.url, REDIRECT)
    const got = u.searchParams.get('code')
    res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' })
    res.end(got
      ? '<h2 style="font-family:system-ui">Fatto.</h2><p style="font-family:system-ui">Puoi chiudere questa scheda e tornare al terminale.</p>'
      : `<h2 style="font-family:system-ui">Autorizzazione negata</h2><p>${u.searchParams.get('error') || ''}</p>`)
    if (got) resolve(got)
  })
})
server.close()

const r = await fetch('https://oauth2.googleapis.com/token', {
  method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded' },
  body: new URLSearchParams({
    code, client_id: c.client_id, client_secret: c.client_secret,
    redirect_uri: REDIRECT, grant_type: 'authorization_code',
  }),
})
const j = await r.json()
if (!j.access_token) { console.error('[FAIL] scambio token:', JSON.stringify(j, null, 2)); process.exit(1) }

writeFileSync(TOKEN_FILE, JSON.stringify({ ...j, expiry_date: Date.now() + j.expires_in * 1000 }, null, 2))

const who = await chiE(j.access_token)
console.log(`[ok] token salvato in .drive-token.json${who.email ? ` — account ${who.email}` : ''}`)
if (who.email && who.email !== 'ripamstudiocraft@gmail.com') {
  console.log(`\n⚠️  ATTENZIONE: hai autorizzato ${who.email}, non ripamstudiocraft@gmail.com.`)
  console.log('    Le cartelle di consegna stanno sul Drive di craft: rilancia e cambia account.')
}
