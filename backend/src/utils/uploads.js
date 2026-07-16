import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const UPLOADS_DIR = path.join(__dirname, '../../uploads');

const ALLOWED_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg']);
const MAX_BYTES = 5 * 1024 * 1024;

export async function saveUploadedImage({ data, filename }) {
  if (!data || !filename) {
    const error = new Error('Missing file data');
    error.status = 400;
    throw error;
  }

  const ext = path.extname(filename).toLowerCase();
  if (!ALLOWED_EXTENSIONS.has(ext)) {
    const error = new Error('Invalid file type. Use JPG, PNG, WebP, GIF, or SVG.');
    error.status = 400;
    throw error;
  }

  const buffer = Buffer.from(data, 'base64');
  if (buffer.length > MAX_BYTES) {
    const error = new Error('File too large (max 5MB)');
    error.status = 400;
    throw error;
  }

  const safeName = `${Date.now()}-${filename.replace(/[^a-zA-Z0-9._-]/g, '')}`;
  await fs.mkdir(UPLOADS_DIR, { recursive: true });
  await fs.writeFile(path.join(UPLOADS_DIR, safeName), buffer);

  return { url: `/uploads/${safeName}` };
}
