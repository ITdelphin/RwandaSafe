import { Router } from 'express';
import { mediaController } from './media.controller';
import { requireAuth } from '../../middleware/auth';

export const deleteMediaRouter = Router();

deleteMediaRouter.use(requireAuth);
// DELETE /v1/media/:mediaId
deleteMediaRouter.delete('/:mediaId', mediaController.remove);
