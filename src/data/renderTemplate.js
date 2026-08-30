// renderTemplate.js
// Génère le SVG d'un certificat pour un style donné + un contenu donné.
// Utilisé côté navigateur (aperçu live) ET côté serveur (génération PDF finale),
// pour garantir que l'aperçu = le rendu téléchargé.

function escapeXml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatDate(isoDate) {
  if (!isoDate) return "";
  const d = new Date(isoDate);
  if (Number.isNaN(d.getTime())) return isoDate;
  return d.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
}

// Chaque renderer reçoit { title, firstname, date, phrase } et retourne un <svg>...</svg> complet en A4 (viewBox 420x594).
const RENDERERS = {
  parchemin: ({ title, firstname, date, phrase }) => `
<svg viewBox="0 0 420 594" xmlns="http://www.w3.org/2000/svg" role="img">
<title>${escapeXml(title)}</title>
<rect x="0" y="0" width="420" height="594" fill="#FAEEDA" stroke="#BA7517" stroke-width="2"/>
<rect x="14" y="14" width="392" height="566" fill="none" stroke="#BA7517" stroke-width="1.5"/>
<rect x="20" y="20" width="380" height="554" fill="none" stroke="#EF9F27" stroke-width="0.75"/>
<circle cx="40" cy="40" r="6" fill="#EF9F27"/><circle cx="380" cy="40" r="6" fill="#EF9F27"/>
<circle cx="40" cy="554" r="6" fill="#EF9F27"/><circle cx="380" cy="554" r="6" fill="#EF9F27"/>
<text x="210" y="95" text-anchor="middle" font-family="Georgia, serif" font-size="14" letter-spacing="4" fill="#854F0B">CERTIFICAT OFFICIEL</text>
<text x="210" y="145" text-anchor="middle" font-family="Georgia, serif" font-size="26" font-weight="500" fill="#412402">${escapeXml(title)}</text>
<line x1="150" y1="165" x2="270" y2="165" stroke="#EF9F27" stroke-width="1"/>
<text x="210" y="210" text-anchor="middle" font-family="Georgia, serif" font-size="13" fill="#5F5E5A">Ce certificat est fièrement décerné à</text>
<text x="210" y="260" text-anchor="middle" font-family="Georgia, serif" font-style="italic" font-size="34" font-weight="500" fill="#4A1B0C">${escapeXml(firstname)}</text>
<line x1="90" y1="278" x2="330" y2="278" stroke="#D3D1C7" stroke-width="1"/>
<text x="210" y="330" text-anchor="middle" font-family="Georgia, serif" font-size="15" fill="#412402">« ${escapeXml(phrase)} »</text>
<text x="210" y="400" text-anchor="middle" font-family="Georgia, serif" font-size="12" fill="#888780">Décerné le</text>
<text x="210" y="420" text-anchor="middle" font-family="Georgia, serif" font-size="15" fill="#2C2C2A">${escapeXml(formatDate(date))}</text>
<circle cx="210" cy="490" r="42" fill="#FAC775" stroke="#854F0B" stroke-width="2"/>
<circle cx="210" cy="490" r="34" fill="none" stroke="#854F0B" stroke-width="1"/>
<text x="210" y="486" text-anchor="middle" font-family="Georgia, serif" font-size="10" letter-spacing="1" fill="#412402">CRAZY</text>
<text x="210" y="500" text-anchor="middle" font-family="Georgia, serif" font-size="10" letter-spacing="1" fill="#412402">CERTIF</text>
<text x="210" y="560" text-anchor="middle" font-family="Georgia, serif" font-size="10" fill="#888780">crazycertif.com</text>
</svg>`,

  neon: ({ title, firstname, date, phrase }) => `
<svg viewBox="0 0 420 594" xmlns="http://www.w3.org/2000/svg" role="img">
<title>${escapeXml(title)}</title>
<rect x="0" y="0" width="420" height="594" fill="#1a1a1a"/>
<rect x="16" y="16" width="388" height="562" fill="none" stroke="#ED93B1" stroke-width="3"/>
<rect x="26" y="26" width="368" height="542" fill="none" stroke="#85B7EB" stroke-width="1.5"/>
<line x1="16" y1="16" x2="60" y2="16" stroke="#D4537E" stroke-width="6"/>
<line x1="16" y1="16" x2="16" y2="60" stroke="#D4537E" stroke-width="6"/>
<line x1="404" y1="578" x2="360" y2="578" stroke="#378ADD" stroke-width="6"/>
<line x1="404" y1="578" x2="404" y2="534" stroke="#378ADD" stroke-width="6"/>
<text x="210" y="100" text-anchor="middle" font-family="Arial, sans-serif" font-size="13" letter-spacing="5" fill="#85B7EB">CERTIFICAT OFFICIEL</text>
<text x="210" y="150" text-anchor="middle" font-family="Arial, sans-serif" font-size="24" font-weight="700" fill="#ED93B1">${escapeXml(title.toUpperCase())}</text>
<text x="210" y="220" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" letter-spacing="1" fill="#B4B2A9">CE CERTIFICAT EST DÉCERNÉ À</text>
<text x="210" y="280" text-anchor="middle" font-family="Arial, sans-serif" font-size="34" font-weight="700" fill="#F4C0D1">${escapeXml(firstname.toUpperCase())}</text>
<line x1="90" y1="298" x2="330" y2="298" stroke="#378ADD" stroke-width="2"/>
<text x="210" y="345" text-anchor="middle" font-family="Arial, sans-serif" font-size="13" fill="#B5D4F4">« ${escapeXml(phrase.toUpperCase())} »</text>
<text x="210" y="410" text-anchor="middle" font-family="Arial, sans-serif" font-size="11" letter-spacing="1" fill="#888780">DÉCERNÉ LE</text>
<text x="210" y="432" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" font-weight="700" fill="#F1EFE8">${escapeXml(formatDate(date))}</text>
<rect x="150" y="480" width="120" height="40" fill="none" stroke="#ED93B1" stroke-width="2"/>
<text x="210" y="505" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" font-weight="700" letter-spacing="2" fill="#ED93B1">CRAZYCERTIF</text>
<text x="210" y="565" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" letter-spacing="1" fill="#5F5E5A">CRAZYCERTIF.COM</text>
</svg>`,

  comic: ({ title, firstname, date, phrase }) => `
<svg viewBox="0 0 420 594" xmlns="http://www.w3.org/2000/svg" role="img">
<title>${escapeXml(title)}</title>
<defs><pattern id="dots" width="10" height="10" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1.4" fill="#F09595"/></pattern></defs>
<rect x="0" y="0" width="420" height="594" fill="#ffffff"/>
<rect x="0" y="0" width="420" height="90" fill="url(#dots)"/>
<rect x="0" y="504" width="420" height="90" fill="url(#dots)"/>
<rect x="12" y="12" width="396" height="570" fill="none" stroke="#0b0b0b" stroke-width="6"/>
<polygon points="210,50 235,90 195,90" fill="#EF9F27" stroke="#0b0b0b" stroke-width="3"/>
<text x="210" y="145" text-anchor="middle" font-family="Arial, sans-serif" font-size="14" font-weight="700" letter-spacing="3" fill="#0b0b0b">*** CERTIFICAT OFFICIEL ***</text>
<text x="210" y="195" text-anchor="middle" font-family="Arial, sans-serif" font-size="26" font-weight="700" fill="#D85A30">${escapeXml(title.toUpperCase())}</text>
<text x="210" y="240" text-anchor="middle" font-family="Arial, sans-serif" font-size="13" font-weight="500" fill="#5F5E5A">CE CERTIFICAT EST DÉCERNÉ À</text>
<rect x="90" y="255" width="240" height="55" fill="#FAC775" stroke="#0b0b0b" stroke-width="3" transform="rotate(-2 210 282)"/>
<text x="210" y="292" text-anchor="middle" font-family="Arial, sans-serif" font-size="28" font-weight="700" fill="#0b0b0b" transform="rotate(-2 210 282)">${escapeXml(firstname.toUpperCase())}</text>
<text x="210" y="360" text-anchor="middle" font-family="Arial, sans-serif" font-size="14" font-weight="500" fill="#0b0b0b">« ${escapeXml(phrase.toUpperCase())} »</text>
<text x="210" y="420" text-anchor="middle" font-family="Arial, sans-serif" font-size="11" fill="#888780">DÉCERNÉ LE</text>
<text x="210" y="442" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" font-weight="700" fill="#0b0b0b">${escapeXml(formatDate(date))}</text>
<text x="210" y="565" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" font-weight="700" letter-spacing="1" fill="#0b0b0b">CRAZYCERTIF.COM</text>
</svg>`,

  minimal: ({ title, firstname, date, phrase }) => `
<svg viewBox="0 0 420 594" xmlns="http://www.w3.org/2000/svg" role="img">
<title>${escapeXml(title)}</title>
<rect x="0" y="0" width="420" height="594" fill="#ffffff"/>
<line x1="60" y1="60" x2="360" y2="60" stroke="#1D9E75" stroke-width="1"/>
<text x="210" y="140" text-anchor="middle" font-family="Arial, sans-serif" font-size="11" letter-spacing="6" fill="#888780">CERTIFICAT OFFICIEL</text>
<text x="210" y="195" text-anchor="middle" font-family="Georgia, serif" font-size="28" font-weight="400" fill="#2C2C2A">${escapeXml(title)}</text>
<text x="210" y="270" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" letter-spacing="2" fill="#B4B2A9">DÉCERNÉ À</text>
<text x="210" y="320" text-anchor="middle" font-family="Georgia, serif" font-size="30" fill="#1D9E75">${escapeXml(firstname)}</text>
<text x="210" y="380" text-anchor="middle" font-family="Arial, sans-serif" font-size="13" fill="#5F5E5A">${escapeXml(phrase)}</text>
<text x="210" y="460" text-anchor="middle" font-family="Arial, sans-serif" font-size="11" letter-spacing="1" fill="#B4B2A9">${escapeXml(formatDate(date).toUpperCase())}</text>
<line x1="60" y1="534" x2="360" y2="534" stroke="#1D9E75" stroke-width="1"/>
<text x="210" y="560" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" letter-spacing="2" fill="#B4B2A9">CRAZYCERTIF.COM</text>
</svg>`,

  grunge: ({ title, firstname, date, phrase }) => `
<svg viewBox="0 0 420 594" xmlns="http://www.w3.org/2000/svg" role="img">
<title>${escapeXml(title)}</title>
<rect x="0" y="0" width="420" height="594" fill="#FAEEDA"/>
<rect x="18" y="18" width="384" height="558" fill="none" stroke="#993C1D" stroke-width="2" stroke-dasharray="2 3"/>
<text x="210" y="110" text-anchor="middle" font-family="Courier New, monospace" font-size="13" letter-spacing="3" fill="#712B13">*** CERTIFICAT OFFICIEL ***</text>
<text x="210" y="160" text-anchor="middle" font-family="Courier New, monospace" font-size="22" font-weight="700" fill="#4A1B0C">${escapeXml(title.toUpperCase())}</text>
<text x="210" y="220" text-anchor="middle" font-family="Courier New, monospace" font-size="12" fill="#5F5E5A">DECERNE A :</text>
<text x="210" y="270" text-anchor="middle" font-family="Courier New, monospace" font-size="28" font-weight="700" fill="#712B13">${escapeXml(firstname.toUpperCase())}</text>
<line x1="90" y1="285" x2="330" y2="285" stroke="#993C1D" stroke-width="1" stroke-dasharray="1 4"/>
<text x="210" y="335" text-anchor="middle" font-family="Courier New, monospace" font-size="13" fill="#4A1B0C">"${escapeXml(phrase.toUpperCase())}"</text>
<text x="210" y="400" text-anchor="middle" font-family="Courier New, monospace" font-size="11" fill="#888780">LE ${escapeXml(formatDate(date).toUpperCase())}</text>
<g transform="translate(210,485) rotate(-12)">
<circle cx="0" cy="0" r="45" fill="none" stroke="#D85A30" stroke-width="3"/>
<circle cx="0" cy="0" r="37" fill="none" stroke="#D85A30" stroke-width="1"/>
<text x="0" y="-6" text-anchor="middle" font-family="Courier New, monospace" font-size="11" font-weight="700" fill="#D85A30">CRAZY</text>
<text x="0" y="10" text-anchor="middle" font-family="Courier New, monospace" font-size="11" font-weight="700" fill="#D85A30">CERTIF</text>
</g>
<text x="210" y="562" text-anchor="middle" font-family="Courier New, monospace" font-size="10" fill="#888780">crazycertif.com</text>
</svg>`,

  pastel: ({ title, firstname, date, phrase }) => `
<svg viewBox="0 0 420 594" xmlns="http://www.w3.org/2000/svg" role="img">
<title>${escapeXml(title)}</title>
<rect x="0" y="0" width="420" height="594" fill="#FBEAF0"/>
<rect x="16" y="16" width="388" height="562" rx="24" fill="#ffffff" stroke="#ED93B1" stroke-width="2"/>
<path d="M45 55 l3 7 l7 1 l-5 5 l1 7 l-6 -3 l-6 3 l1 -7 l-5 -5 l7 -1 z" fill="#EF9F27"/>
<path d="M375 60 l3 7 l7 1 l-5 5 l1 7 l-6 -3 l-6 3 l1 -7 l-5 -5 l7 -1 z" fill="#D4537E"/>
<circle cx="55" cy="530" r="5" fill="#85B7EB"/><circle cx="370" cy="525" r="4" fill="#97C459"/><circle cx="385" cy="545" r="3" fill="#EF9F27"/>
<text x="210" y="120" text-anchor="middle" font-family="Georgia, serif" font-size="13" letter-spacing="3" fill="#993556">certificat officiel</text>
<text x="210" y="170" text-anchor="middle" font-family="Georgia, serif" font-size="26" font-weight="500" fill="#72243E">${escapeXml(title)}</text>
<text x="210" y="230" text-anchor="middle" font-family="Georgia, serif" font-size="13" fill="#5F5E5A">décerné avec amour à</text>
<text x="210" y="285" text-anchor="middle" font-family="Georgia, serif" font-style="italic" font-size="32" font-weight="500" fill="#D4537E">${escapeXml(firstname)}</text>
<text x="210" y="345" text-anchor="middle" font-family="Georgia, serif" font-size="14" fill="#72243E">${escapeXml(phrase)}</text>
<text x="210" y="420" text-anchor="middle" font-family="Georgia, serif" font-size="12" fill="#B4B2A9">${escapeXml(formatDate(date))}</text>
<circle cx="210" cy="490" r="36" fill="#F4C0D1"/>
<text x="210" y="486" text-anchor="middle" font-family="Georgia, serif" font-size="10" fill="#72243E">crazy</text>
<text x="210" y="500" text-anchor="middle" font-family="Georgia, serif" font-size="10" fill="#72243E">certif</text>
<text x="210" y="560" text-anchor="middle" font-family="Georgia, serif" font-size="10" fill="#B4B2A9">crazycertif.com</text>
</svg>`,
};

/**
 * Génère le SVG complet d'un certificat.
 * @param {string} styleId - id du style (parchemin, neon, comic, minimal, grunge, pastel)
 * @param {{title:string, firstname:string, date:string, phrase:string}} content
 * @returns {string} SVG complet, viewBox 420x594 (proportions A4)
 */
export function renderCertificate(styleId, content) {
  const renderer = RENDERERS[styleId];
  if (!renderer) throw new Error(`Style inconnu : ${styleId}`);
  const safe = {
    title: content.title || "",
    firstname: content.firstname || "Votre prénom",
    date: content.date || "",
    phrase: content.phrase || "",
  };
  return renderer(safe).trim();
}

export const AVAILABLE_STYLE_IDS = Object.keys(RENDERERS);
