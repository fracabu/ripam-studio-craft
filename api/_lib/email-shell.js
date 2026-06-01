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

// Token brand (speculari a :root in src/assets/main.css e ai dati di legale.js).
export const BRAND = {
  baseUrl: BASE_URL,
  logoUrl: LOGO_URL,
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
// NB: i margini negativi presuppongono che il container abbia padding:24px
//     (come emailShell). Usare standalone solo dentro un container equivalente.
export function emailHeader(kicker = '') {
  const kickerHtml = kicker
    ? `<div style="margin:10px 0 0;font-family:'JetBrains Mono',ui-monospace,monospace;font-size:11px;letter-spacing:.12em;font-weight:700;color:${BRAND.muted}">${kicker}</div>`
    : ''
  return `<div style="background:${BRAND.cream};padding:18px 24px;margin:-24px -24px 24px;border-bottom:3px solid ${BRAND.ink};text-align:left">
    <a href="${BRAND.baseUrl}" style="text-decoration:none;border:0">
      <img src="${BRAND.logoUrl}" alt="${BRAND.brandName}" width="190" style="display:block;width:190px;max-width:190px;height:auto;border:0">
    </a>${kickerHtml}
  </div>`
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
<div style="font-family:system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:${BRAND.ink};line-height:1.55;background:${BRAND.cream}">
  ${emailHeader(kicker)}
  ${innerHtml}
  ${emailFooter()}
</div>`
}

// Pulsante CTA brutalist (giallo brand, ombra hard-offset). Helper opzionale
// per uniformare i bottoni delle mail (conferma, download anteprima, ecc.).
export function emailButton(href, label) {
  return `<a href="${href}" style="display:inline-block;background:${BRAND.acid};color:${BRAND.ink};padding:14px 28px;text-decoration:none;font-weight:700;font-size:15px;border:2px solid ${BRAND.ink};box-shadow:4px 4px 0 ${BRAND.ink}">${label}</a>`
}
