/**
 * Normalize a phone value for https://wa.me/<number>
 * WhatsApp needs digits only, with country code (no + or leading 0).
 */
export function toWhatsAppNumber(raw, defaultCountryCode = '250') {
  if (!raw) return '';

  let digits = String(raw).replace(/\D/g, '');
  if (!digits) return '';

  if (digits.startsWith(defaultCountryCode)) {
    return digits;
  }

  if (digits.startsWith('0')) {
    return `${defaultCountryCode}${digits.slice(1)}`;
  }

  // Bare local mobile without leading 0 (e.g. 788988268)
  if (digits.length <= 9) {
    return `${defaultCountryCode}${digits}`;
  }

  return digits;
}

export function getWhatsAppUrl({ whatsapp, phone, name, message } = {}) {
  const number = toWhatsAppNumber(whatsapp || phone);
  if (!number) return null;

  const text =
    message ||
    `Hello ${name || 'there'}! I would like to discuss a project with you.`;

  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
}
