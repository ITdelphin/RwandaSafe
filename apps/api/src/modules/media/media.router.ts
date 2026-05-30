import { Router } from 'express';
import multer from 'multer';
import { mediaController } from './media.controller';
import { requireAuth } from '../../middleware/auth';

export const mediaRouter = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter(_req, file, cb) {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'audio/mpeg', 'audio/webm'];
    cb(null, allowed.includes(file.mimetype));
  },
});

mediaRouter.use(requireAuth);

// POST   /v1/incidents/:id/media   — mounted at /v1/incidents
mediaRouter.post('/:id/media', upload.single('file'), mediaController.upload);
// GET    /v1/incidents/:id/media
mediaRouter.get('/:id/media', mediaController.list);
