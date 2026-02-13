import express from 'express';
import { verifyToken, verifyAdmin } from '../middleware/auth.js';
import { upload } from '../services/storage.js';
import * as controller from '../controllers/mediaCmsController.js';

const router = express.Router();

// POST /api/admin/media-cms/upload (multipart/form-data field name 'files')
router.post('/media-cms/upload', verifyToken, verifyAdmin, upload.array('files', 20), controller.uploadFiles);

// GET /api/admin/media-cms
router.get('/media-cms', verifyToken, verifyAdmin, controller.listMedia);

// GET single
router.get('/media-cms/:id', verifyToken, verifyAdmin, controller.getMedia);

// PUT metadata
router.put('/media-cms/:id', verifyToken, verifyAdmin, controller.updateMedia);

// DELETE
router.delete('/media-cms/:id', verifyToken, verifyAdmin, controller.deleteMedia);

// helper endpoints for attach/detach (internal/admin use)
router.post('/media-cms/attach', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { moduleName, recordId, mediaId } = req.body;
    if (!moduleName || !recordId || !mediaId) return res.status(400).json({ msg: 'moduleName, recordId and mediaId required', type: 'error' });
    const ok = await controller.attachMedia(moduleName, recordId, mediaId);
    if (!ok) return res.status(500).json({ msg: 'Attach failed', type: 'error' });
    res.json({ msg: 'Attached', type: 'success' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error', type: 'error' });
  }
});

router.post('/media-cms/detach', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { moduleName, recordId, mediaId } = req.body;
    if (!moduleName || !recordId || !mediaId) return res.status(400).json({ msg: 'moduleName, recordId and mediaId required', type: 'error' });
    const ok = await controller.detachMedia(moduleName, recordId, mediaId);
    if (!ok) return res.status(500).json({ msg: 'Detach failed', type: 'error' });
    res.json({ msg: 'Detached', type: 'success' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error', type: 'error' });
  }
});

export default router;
