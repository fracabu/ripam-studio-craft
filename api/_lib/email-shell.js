// Guscio email UNICO per TUTTE le mail Ripam Studio Craft: di sistema e non.
//
// Single source of truth di header (logo brand) + footer legale, con stili
// INLINE email-safe (niente <style>, niente classi: i client mail li spogliano).
//
// UN SOLO ASPETTO (deciso 31/08/2026): header NERO con logo chiaro
// (`logo-dark.png` inline) + corpo crema + footer legale. Prima esistevano
// quattro gusci: questo (allora crema), `darkShell` duplicato in
// scripts/send_lead.mjs E in scripts/send_drip.mjs, più un `lightShell`
// (sfondo bianco) dentro send_lead. I due script riscrivevano a mano anche il
// footer coi dati legali, quindi P.IVA e denominazione vivevano in tre posti:
// cambiarli qui non bastava e le mail partivano disallineate. Ora entrambi gli
// script importano da qui; il flag --light di send_lead è accettato ma ignorato.
//
// Chi lo usa: api/newsletter/subscribe.js (conferma iscrizione),
// api/_lib/anteprima-mail.js (consegna anteprime), api/_lib/lead-mail.js
// (modelli di risposta ai lead), scripts/send_lead.mjs, scripts/send_drip.mjs.
// api/newsletter/confirm.js è una pagina HTML, non una mail: resta com'è.
//
// Se cambia palette, logo o dati legali del titolare → si cambia QUI, e adesso
// è vero per davvero.

import { LOGO_DARK_B64 } from './logo-dark-data.js'

const BASE_URL = 'https://ripam-studio-craft.vercel.app'
const LOGO_URL = `${BASE_URL}/logo.png`
// Content-ID dell'allegato logo INLINE. Il logo viaggia DENTRO la mail (allegato
// inline) invece di essere linkato da URL: così si vede SEMPRE, anche nei client
// che bloccano le immagini remote (Libero, Outlook…). L'<img> lo referenzia con
// `cid:<LOGO_CID>`. Il valore coincide col filename dell'allegato perché il path
// bozze della skill (Gmail API create_draft) genera il Content-ID DAL filename:
// usando lo stesso identico CID, header (nodemailer) e bozze restano uniformi.
// È il logo DARK (chiaro su fondo nero): l'header del guscio unico è nero.
const LOGO_CID = 'logo-dark.png'

// Token brand (speculari a :root in src/assets/main.css e ai dati di legale.js).
export const BRAND = {
  baseUrl: BASE_URL,
  logoUrl: LOGO_URL,
  logoCid: LOGO_CID,
  acid: '#c6f432', // giallo brand
  ink: '#0a0a0a', // nero
  cream: '#f5f0e8', // sfondo mail
  muted: '#6b6458', // testo secondario / footer
  rule: '#e6dfd2', // linee divisorie
  holder: 'Francesco Capurso',
  brandName: 'Ripam Studio Craft',
  email: 'ripamstudiocraft@gmail.com',
  piva: '18528431002',
  city: 'Roma',
}

// Header brand: fascia crema col logo, bordo inferiore 3px nero (brutalist).
// `kicker` opzionale = etichetta contestuale della mail (es. 'CONFERMA
// ISCRIZIONE'), resa come riga monospace sotto il logo.
// NB: ritorna una RIGA <tr> di tabella — va usato SOLO dentro la tabella
//     interna di emailShell (non standalone). Layout table-based per reggere su
//     Outlook/live.it (che spogliano background/margini sui <div>).
export function emailHeader(kicker = '') {
  return `<tr>
    <td bgcolor="${BRAND.ink}" style="background:${BRAND.ink};padding:20px 24px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
        <td align="left" style="vertical-align:middle;">
          <a href="${BRAND.baseUrl}" style="text-decoration:none;border:0;">
            <img src="cid:${BRAND.logoCid}" alt="${BRAND.brandName}" width="180" style="display:block;width:180px;max-width:180px;height:auto;border:0;outline:none;">
          </a>
        </td>
        <td align="right" style="vertical-align:middle;font-family:'Courier New',monospace;font-size:10px;font-weight:700;letter-spacing:.14em;color:${BRAND.acid};text-transform:uppercase;line-height:1.5;white-space:nowrap;">${kicker}</td>
      </tr></table>
    </td>
  </tr>`
}

// Footer legale standard del titolare.
export function emailFooter() {
  return `<hr style="border:none;border-top:1px solid ${BRAND.rule};margin:24px 0">
  <p style="margin:0;font-size:12px;color:${BRAND.muted};line-height:1.55">${BRAND.holder} &middot; ${BRAND.brandName} &middot; ${BRAND.city} &middot; P.IVA ${BRAND.piva}<br>
  ${BRAND.email} &middot; <a href="${BRAND.baseUrl}" style="color:${BRAND.muted}">ripam-studio-craft.vercel.app</a></p>`
}

// Guscio completo: avvolge `innerHtml` (il contenuto specifico della mail)
// nel container brand crema + header logo (+ kicker opzionale) + footer legale.
//
// `innerHtml` è già fidato/sanitizzato dal chiamante (lo costruiamo noi): qui
// non si fa escaping, è una concatenazione di template HTML interni.
export function emailShell(innerHtml, kicker = '') {
  return `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${BRAND.cream}" style="background:${BRAND.cream};margin:0;padding:0;width:100%;">
  <tr>
    <td align="center" style="padding:20px 12px;">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px;max-width:600px;font-family:Arial,Helvetica,sans-serif;color:${BRAND.ink};">
        ${emailHeader(kicker)}
        <tr>
          <td bgcolor="${BRAND.cream}" style="background:${BRAND.cream};padding:28px 28px 8px;font-size:15px;line-height:1.55;color:${BRAND.ink};">
            ${innerHtml}
          </td>
        </tr>
        <tr>
          <td bgcolor="${BRAND.cream}" style="background:${BRAND.cream};padding:8px 28px 28px;">
            ${emailFooter()}
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`
}

// Allegato logo INLINE per nodemailer. Va passato in `attachments` a OGNI
// sendMail che usa emailShell(), altrimenti l'header mostra un'immagine rotta
// (l'<img> punta a `cid:logo.png`, che esiste solo se questo allegato c'è).
// I byte arrivano da logo-data.js (incorporati nel codice): niente file locale,
// niente fetch remoto → funziona ovunque, anche durante un deploy o a sito
// irraggiungibile. `cid` è forzato uguale a LOGO_CID così combacia con l'<img>.
export function logoAttachment() {
  return { filename: LOGO_CID, content: Buffer.from(LOGO_DARK_B64, 'base64'), cid: LOGO_CID, contentType: 'image/png' }
}

// Pulsante CTA brutalist (giallo brand, ombra hard-offset). Helper opzionale
// per uniformare i bottoni delle mail (conferma, download anteprima, ecc.).
export function emailButton(href, label) {
  return `<a href="${href}" style="display:inline-block;background:${BRAND.acid};color:${BRAND.ink};padding:14px 28px;text-decoration:none;font-weight:700;font-size:15px;border:2px solid ${BRAND.ink};box-shadow:4px 4px 0 ${BRAND.ink}">${label}</a>`
}
