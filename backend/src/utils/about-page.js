import { seedData } from '../data/seed-data.js';

export function parseSettingValue(value) {
  if (value == null) return null;

  let current = value;
  while (typeof current === 'string') {
    try {
      current = JSON.parse(current);
    } catch {
      return null;
    }
  }

  return current;
}

export function normalizeAboutPage(page = {}) {
  const parsed = parseSettingValue(page) || page || {};

  return {
    ...seedData.aboutPage,
    ...parsed,
    home: {
      ...seedData.aboutPage.home,
      ...(parsed.home || {}),
    },
  };
}

export async function loadAboutPageConfig(pool) {
  const [rows] = await pool.query(
    "SELECT setting_value FROM site_settings WHERE setting_key = 'about_page' LIMIT 1"
  );

  if (!rows.length) {
    return normalizeAboutPage(seedData.aboutPage);
  }

  return normalizeAboutPage(rows[0].setting_value);
}

export async function saveAboutPageConfig(pool, page) {
  const normalized = normalizeAboutPage(page);

  await pool.query(
    `INSERT INTO site_settings (setting_key, setting_value) VALUES ('about_page', ?)
     ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)`,
    [JSON.stringify(normalized)]
  );

  return normalized;
}

export function mergeAboutHomeImage(page, { image, imageLarge, imageAlt } = {}) {
  const current = normalizeAboutPage(page);

  return normalizeAboutPage({
    ...current,
    home: {
      ...current.home,
      ...(image !== undefined ? { image } : {}),
      ...(imageLarge !== undefined ? { imageLarge } : {}),
      ...(imageAlt !== undefined ? { imageAlt } : {}),
    },
  });
}
