import { Router } from 'express';
import { opendataController } from './opendata.controller';

export const opendataRouter = Router();

opendataRouter.get('/export', opendataController.exportData);
opendataRouter.get('/summary', opendataController.getPublicSummary);
