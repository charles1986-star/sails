import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';
import sharp from 'sharp';
import db from '../db.js';
import { UPLOADS_ROOT } from '../services/storage.js';

const THUMB_SUFFIX = '_thumb.jpg';

function buildPublicUrl(filePath) {
  // public uploads are served from /uploads
  const rel = path.relative(path.join(process.cwd(), 'public'), filePath).replace(/\\/g, '/');
  return `/${rel}`;
}

async function createThumbnail(filePath, thumbPath) {
  try {
    await sharp(filePath).resize(300, null, { withoutEnlargement: true }).jpeg({ quality: 75 }).toFile(thumbPath);
    return true;
  } catch (err) {
    return false;
  }
}

export async function uploadFiles(req, res) {
  try {
    if (!req.files || req.files.length === 0) return res.status(400).json({ msg: 'No files uploaded', type: 'error' });

    const results = [];
    for (const f of req.files) {
      const id = uuidv4();
      const file_path = f.path;
      const public_url = buildPublicUrl(file_path);
      const mime_type = f.mimetype;
      const file_size = f.size;
      const ext = path.extname(f.originalname).toLowerCase();
      const file_type = mime_type.startsWith('image/') ? 'image' : mime_type === 'application/pdf' ? 'pdf' : mime_type.startsWith('video/') ? 'video' : 'document';

      let width = null, height = null, duration = null;
      if (file_type === 'image') {
        try {
          const meta = await sharp(file_path).metadata();
          width = meta.width || null; height = meta.height || null;
        } catch (e) {
          // ignore
        }
      }

      // create thumbnail for images
      let thumb_url = null;
      if (file_type === 'image') {
        const thumbName = path.basename(f.filename, ext) + THUMB_SUFFIX;
        const thumbPath = path.join(path.dirname(file_path), thumbName);
        const ok = await createThumbnail(file_path, thumbPath);
        if (ok) thumb_url = buildPublicUrl(thumbPath);
      }

      const insertQuery = `INSERT INTO media_files (id, original_name, filename, file_path, public_url, file_type, mime_type, file_size, width, height, duration, category_id, alt_text, description, tags, uploaded_by, is_public, usage_count, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, NOW(), NOW())`;

      await db.query(insertQuery, [
        id,
        f.originalname,
        f.filename,
        file_path,
        public_url,
        file_type,
        mime_type,
        file_size,
        width,
        height,
        duration,
        req.body.category_id || null,
        req.body.alt_text || null,
        req.body.description || null,
        req.body.tags ? JSON.stringify(req.body.tags) : null,
        req.userId || null,
        req.body.is_public === '0' ? 0 : 1
      ]);

      results.push({ id, original_name: f.originalname, public_url, thumb_url });
    }

    res.status(201).json({ data: results, msg: 'Files uploaded', type: 'success' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Upload failed', type: 'error' });
  }
}

export async function listMedia(req, res) {
  try {
    const page = parseInt(req.query.page || '1', 10);
    const perPage = parseInt(req.query.perPage || '20', 10);
    const offset = (page - 1) * perPage;
    const filters = [];
    const params = [];

    if (req.query.search) {
      filters.push('(original_name LIKE ? OR filename LIKE ?)');
      params.push(`%${req.query.search}%`, `%${req.query.search}%`);
    }
    if (req.query.category_id) {
      filters.push('category_id = ?'); params.push(req.query.category_id);
    }
    if (req.query.file_type) {
      filters.push('file_type = ?'); params.push(req.query.file_type);
    }
    filters.push('is_deleted = 0');

    const where = filters.length ? `WHERE ${filters.join(' AND ')}` : '';
    const allowedSort = ['created_at', 'file_size', 'original_name', 'filename', 'usage_count'];
    const sortBy = allowedSort.includes(req.query.sortBy) ? req.query.sortBy : 'created_at';
    const sortDir = (req.query.sortDir || 'DESC').toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const q = `SELECT SQL_CALC_FOUND_ROWS * FROM media_files ${where} ORDER BY ${sortBy} ${sortDir} LIMIT ? OFFSET ?`;
    const [rows] = await db.query(q, [...params, perPage, offset]);
    const [[{ 'FOUND_ROWS()': total = 0 }]] = await db.query('SELECT FOUND_ROWS()');

    res.json({ data: rows, meta: { page, perPage, total }, msg: 'Media list', type: 'success' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Failed to list media', type: 'error' });
  }
}

export async function getMedia(req, res) {
  try {
    const { id } = req.params;
    const [rows] = await db.query('SELECT * FROM media_files WHERE id = ? AND is_deleted = 0', [id]);
    if (rows.length === 0) return res.status(404).json({ msg: 'Media not found', type: 'error' });
    res.json({ data: rows[0], msg: 'Media retrieved', type: 'success' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Failed to get media', type: 'error' });
  }
}

export async function updateMedia(req, res) {
  try {
    const { id } = req.params;
    const { original_name, alt_text, description, category_id, tags, is_public } = req.body;
    const tagsJson = tags ? JSON.stringify(tags) : null;
    const [result] = await db.query(
      'UPDATE media_files SET original_name = ?, alt_text = ?, description = ?, category_id = ?, tags = ?, is_public = ?, updated_at = NOW() WHERE id = ?',
      [original_name || null, alt_text || null, description || null, category_id || null, tagsJson, is_public === '0' ? 0 : 1, id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ msg: 'Media not found', type: 'error' });
    res.json({ msg: 'Media updated', type: 'success' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Failed to update media', type: 'error' });
  }
}

export async function deleteMedia(req, res) {
  try {
    const { id } = req.params;
    // check usage
    const [usage] = await db.query('SELECT COUNT(*) as cnt FROM media_usage WHERE media_id = ?', [id]);
    if (usage[0].cnt > 0) {
      // soft delete
      await db.query('UPDATE media_files SET is_deleted = 1, is_public = 0 WHERE id = ?', [id]);
      return res.json({ msg: 'Media is in use; soft-deleted instead', type: 'success' });
    }

    // hard delete file record and unlink files
    const [rows] = await db.query('SELECT file_path FROM media_files WHERE id = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ msg: 'Media not found', type: 'error' });
    const filePath = rows[0].file_path;
    if (filePath && fs.existsSync(filePath)) fs.unlinkSync(filePath);
    // remove thumbnail if exists
    const thumb = path.join(path.dirname(filePath), path.basename(filePath, path.extname(filePath)) + THUMB_SUFFIX);
    if (fs.existsSync(thumb)) fs.unlinkSync(thumb);

    await db.query('DELETE FROM media_files WHERE id = ?', [id]);
    res.json({ msg: 'Media deleted', type: 'success' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Failed to delete media', type: 'error' });
  }
}

export async function attachMedia(moduleName, recordId, mediaId) {
  try {
    await db.query('INSERT INTO media_usage (media_id, module_name, record_id) VALUES (?, ?, ?)', [mediaId, moduleName, String(recordId)]);
    await db.query('UPDATE media_files SET usage_count = usage_count + 1 WHERE id = ?', [mediaId]);
    return true;
  } catch (err) {
    console.error('attachMedia error', err);
    return false;
  }
}

export async function detachMedia(moduleName, recordId, mediaId) {
  try {
    await db.query('DELETE FROM media_usage WHERE media_id = ? AND module_name = ? AND record_id = ? LIMIT 1', [mediaId, moduleName, String(recordId)]);
    await db.query('UPDATE media_files SET usage_count = GREATEST(0, usage_count - 1) WHERE id = ?', [mediaId]);
    return true;
  } catch (err) {
    console.error('detachMedia error', err);
    return false;
  }
}

export default { uploadFiles, listMedia, getMedia, updateMedia, deleteMedia, attachMedia, detachMedia };
