// Guscio email unico per TUTTE le mail di sistema Ripam Studio Craft.
//
// Single source of truth di header (logo brand) + footer legale, con stili
// INLINE email-safe (niente <style>, niente classi: i client mail li spogliano).
// Sostituisce lo "stamp" testuale (fascia nera + JetBrains Mono) finora
// duplicato a mano in:
//   - api/newsletter/subscribe.js   (mail conferma iscrizione)
//   - api/_lib/anteprima-mail.js     (consegna / "in arrivo" anteprima manuale)
//   - api/newsletter/confirm.js      (pagina HTML, non mail — resta com'è)
//
// Pensato anche per la futura skill "auto-risposte lead" (Fase 2): le bozze
// di risposta riusano emailShell() così ogni mail esce uniforme col logo.
//
// Se cambia palette, logo o dati legali del titolare → si cambia QUI.

const BASE_URL = 'https://ripam-studio-craft.vercel.app'
const LOGO_URL = `${BASE_URL}/logo.png`
// Content-ID dell'allegato logo INLINE. Il logo viaggia DENTRO la mail (allegato
// inline) invece di essere linkato da URL: così si vede SEMPRE, anche nei client
// che bloccano le immagini remote (Libero, Outlook…). L'<img> lo referenzia con
// `cid:<LOGO_CID>`. Il valore coincide col filename dell'allegato perché il path
// bozze della skill (Gmail API create_draft) genera il Content-ID DAL filename:
// usando lo stesso identico CID, header (nodemailer) e bozze restano uniformi.
const LOGO_CID = 'logo.png'

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
  const kickerHtml = kicker
    ? `<div style="margin:10px 0 0;font-family:'Courier New',monospace;font-size:11px;letter-spacing:.12em;font-weight:700;color:${BRAND.muted};">${kicker}</div>`
    : ''
  return `<tr>
    <td bgcolor="${BRAND.cream}" style="background:${BRAND.cream};padding:18px 24px;border-bottom:3px solid ${BRAND.ink};">
      <a href="${BRAND.baseUrl}" style="text-decoration:none;border:0;">
        <img src="cid:${BRAND.logoCid}" alt="${BRAND.brandName}" width="190" style="display:block;width:190px;max-width:190px;height:auto;border:0;outline:none;">
      </a>${kickerHtml}
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
      <table role="presentation" width="560" cellpadding="0" cellspacing="0" border="0" style="width:560px;max-width:560px;font-family:Arial,Helvetica,sans-serif;color:${BRAND.ink};">
        ${emailHeader(kicker)}
        <tr>
          <td bgcolor="${BRAND.cream}" style="background:${BRAND.cream};padding:24px;font-size:15px;line-height:1.55;color:${BRAND.ink};">
            ${innerHtml}
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
// nodemailer scarica il file da `path` (URL di produzione) e lo incorpora come
// MIME part inline → il destinatario lo vede senza caricare nulla da remoto.
// `cid` è forzato uguale a LOGO_CID così combacia con l'<img> del guscio.
export function logoAttachment() {
  return { filename: 'logo.png', path: LOGO_URL, cid: LOGO_CID, contentType: 'image/png' }
}

// Pulsante CTA brutalist (giallo brand, ombra hard-offset). Helper opzionale
// per uniformare i bottoni delle mail (conferma, download anteprima, ecc.).
export function emailButton(href, label) {
  return `<a href="${href}" style="display:inline-block;background:${BRAND.acid};color:${BRAND.ink};padding:14px 28px;text-decoration:none;font-weight:700;font-size:15px;border:2px solid ${BRAND.ink};box-shadow:4px 4px 0 ${BRAND.ink}">${label}</a>`
}
