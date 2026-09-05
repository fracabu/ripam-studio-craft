// ============================================================================
// Il GLOSSARIO in omaggio: un solo posto dove vivono link, numeri e allegato.
//
// Perché esiste (05/09/2026): il glossario va a chi si iscrive alla newsletter,
// e ci arriva per DUE strade diverse — la welcome standard (welcome-newsletter.js)
// e la mail fusa anteprima+benvenuto (anteprima-mail.js). Scrivere il blocco due
// volte significa che al primo aggiornamento uno dei due resta indietro: e' lo
// stesso errore dei quattro gusci mail di agosto. Qui sta una volta sola.
//
// Il PDF viaggia come ALLEGATO oltre che come link: fra gli iscritti ci sono
// Libero, Tiscali, Virgilio e Alice, dove i link Drive spesso non si aprono, e
// gli account non-Google non possono nemmeno essere invitati a una cartella
// condivisa (Drive risponde 403 cannotInviteNonGoogleUser). L'allegato arriva
// sempre, a chiunque.
//
// Quando esce una versione nuova del glossario:
//   1. copia il PDF in messaggi-clienti/newsletter/allegati/glossario-concorsi.pdf
//   2. node scripts/drive_sostituisci.mjs --id <FILE_ID> --file <pdf> --sostituisci
//   3. aggiorna VOCI / PAGINE / MATERIE qui sotto
// Il link resta lo stesso: chi ce l'ha gia' vede la versione nuova.
// ============================================================================
import { existsSync } from 'node:fs'
import { join } from 'node:path'

export const GLOSSARIO = {
  fileId: '1ZzyZ-2O69KXlKKq-VkLtvVkBfNCmgEWI',
  voci: 937,
  materie: 21,
  pagine: 71,
  nomeVisibile: 'Glossario generale per concorsi - Ripam Studio Craft.pdf',
  // relativo a process.cwd(): su Vercel messaggi-clienti/newsletter/** e' nel bundle
  pathRelativo: join('messaggi-clienti', 'newsletter', 'allegati', 'glossario-concorsi.pdf'),
}

export const glossarioUrl = () => `https://drive.google.com/file/d/${GLOSSARIO.fileId}/view`

// Allegato per nodemailer, o null se il file non c'e' (mai bloccare l'invio per
// un allegato mancante: la mail con il solo link vale comunque).
export function glossarioAttachment() {
  const path = join(process.cwd(), GLOSSARIO.pathRelativo)
  if (!existsSync(path)) {
    console.error('glossario: PDF non trovato nel bundle', path)
    return null
  }
  return { filename: GLOSSARIO.nomeVisibile, path }
}

// Il blocco da infilare nelle mail di benvenuto (entrambe le strade).
export function glossarioBlock() {
  const { voci, materie, pagine } = GLOSSARIO
  const url = glossarioUrl()
  const html = `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:26px 0 18px">
    <tr><td style="border:2px solid #0a0a0a;padding:18px 20px;">
      <div style="font-family:'Courier New',monospace;font-size:11px;font-weight:700;letter-spacing:.12em;color:#6b6458;margin-bottom:8px">IL TUO REGALO DI BENVENUTO</div>
      <p style="margin:0 0 12px;font-size:15px"><strong>Il Glossario generale per concorsi</strong>: ${voci} voci da ${materie} materie, dalla A alla Z, ognuna con la materia di provenienza. Lo trovi <strong>allegato a questa mail</strong>.</p>
      <p style="margin:0 0 12px;font-size:15px">Serve mentre fai i quiz, non prima: meta' degli errori nasce dal confondere due termini vicini, e li' hai definizione e norma in venti secondi.</p>
      <a href="${url}" style="display:inline-block;background:#0a0a0a;color:#f5f0e8;text-decoration:none;font-weight:700;font-size:13px;padding:10px 16px;margin:0 6px 0 0;">GLOSSARIO PDF &#x2913;</a>
      <p style="margin:12px 0 0;font-size:13px;color:#6b6458">E' uno strumento vivo: cresce e si corregge. Il link apre sempre l'ultima versione.</p>
    </td></tr>
  </table>`
  const text = [
    '',
    `IL TUO REGALO DI BENVENUTO — il Glossario generale per concorsi:`,
    `${voci} voci da ${materie} materie (${pagine} pagine), dalla A alla Z.`,
    'Lo trovi allegato a questa mail. Serve mentre fai i quiz: meta\' degli errori',
    'nasce dal confondere due termini vicini.',
    `  Glossario PDF -> ${url}`,
    "E' uno strumento vivo: cresce e si corregge, e il link apre sempre l'ultima versione.",
  ].join('\n')
  return { html, text }
}
