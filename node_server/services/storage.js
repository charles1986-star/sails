import path from 'path';
import fs from 'fs';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';

const UPLOADS_ROOT = path.join(process.cwd(), 'public', 'uploads');

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function makeDestination() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const dir = path.join(UPLOADS_ROOT, `${year}`, `${month}`);
  ensureDir(dir);
  return dir;
}

const allowedMime = [
  'image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml',
  'application/pdf',
  'video/mp4', 'video/mpeg', 'audio/mpeg', 'audio/wav',
  'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain'
];

function fileFilter(req, file, cb) {
  if (!allowedMime.includes(file.mimetype)) return cb(new Error('Unsupported file type'), false);
  // prevent executables
  const prohibited = /\.(exe|sh|bat|cmd|scr|js)$/i;
  if (prohibited.test(file.originalname)) return cb(new Error('Executable uploads are not allowed'), false);
  cb(null, true);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    try {
      const dest = makeDestination();
      cb(null, dest);
    } catch (err) {
      cb(err);
    }
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const id = uuidv4();
    const safe = id + ext;
    cb(null, safe);
  }
});

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: (process.env.MEDIA_MAX_BYTES ? parseInt(process.env.MEDIA_MAX_BYTES, 10) : 50 * 1024 * 1024) }
});

export { upload, UPLOADS_ROOT, makeDestination };

export default { upload, UPLOADS_ROOT, makeDestination };
