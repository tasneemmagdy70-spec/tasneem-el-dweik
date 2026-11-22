/** One place for every way to reach Tasneem. */

export const EMAIL = "tasneemmagdy70@gmail.com";
export const EMAIL_URL = `mailto:${EMAIL}`;

// international format, digits only
export const WHATSAPP_NUMBER = "201142706220";
export const WHATSAPP_DISPLAY = "+20 114 270 6220";

const WHATSAPP_MESSAGE = "Hi Tasneem! I saw your portfolio and I'd love to talk.";

export const WHATSAPP_URL = WHATSAPP_NUMBER
  ? `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`
  : "#contact";

export const LINKEDIN_URL = "https://www.linkedin.com/in/tasneem-el-dweik/";

export const BEHANCE_URL = "https://www.behance.net/Tasneem_Eldweik";

// built from cv/cv.html — edit there, then `npm run cv`
export const CV_URL = "/Tasneem-El-Dweik-CV.pdf";

export const AVAILABILITY = "Open to full-time · part-time · freelance";

/** External links and the CV open in a new tab; placeholders (#…) stay on the page. */
export const ext = (href: string) =>
  href.startsWith("http") || href.endsWith(".pdf") ? { target: "_blank", rel: "noopener noreferrer" } : {};
