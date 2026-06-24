import { Request, Response, NextFunction } from 'express';
import { accessService } from './access.service';
import { sendSuccess } from '../../utils/response';

export const accessController = {
    async getMyAccess(req: Request, res: Response, next: NextFunction) {
        try {
            const access = await accessService.getUserDashboardAccess(req.user!.id);
            return sendSuccess(res, access);
        } catch (err) { next(err); }
    },

    async listAllAccess(req: Request, res: Response, next: NextFunction) {
        try {
            const filters = { dashboard: req.query.dashboard as any, role: req.query.role as any };
            const users = await accessService.listAllAccess(filters);
            return sendSuccess(res, users);
        } catch (err) { next(err); }
    },

    async listAllUsers(req: Request, res: Response, next: NextFunction) {
        try {
            const search = req.query.search as string | undefined;
            const users = await accessService.listAllUsers(search);
            return sendSuccess(res, users);
        } catch (err) { next(err); }
    },

    async grantAccess(req: Request, res: Response, next: NextFunction) {
        try {
            const { userId, dashboard } = req.body;
            const access = await accessService.grantAccess(userId, dashboard, req.user!.id);
            return sendSuccess(res, access);
        } catch (err) { next(err); }
    },

    async grantMultipleAccess(req: Request, res: Response, next: NextFunction) {
        try {
            const { userId, dashboards } = req.body;
            const access = await accessService.grantMultipleAccess(userId, dashboards, req.user!.id);
            return sendSuccess(res, access);
        } catch (err) { next(err); }
    },

    async revokeAccess(req: Request, res: Response, next: NextFunction) {
        try {
            const { userId, dashboard } = req.body;
            await accessService.revokeAccess(userId, dashboard, req.user!.id);
            return sendSuccess(res, { message: `Access to ${dashboard} revoked` });
        } catch (err) { next(err); }
    },

    async promoteAndGrant(req: Request, res: Response, next: NextFunction) {
        try {
            const { userId, dashboard } = req.body;
            const result = await accessService.promoteAndGrant(userId, dashboard, req.user!.id);
            return sendSuccess(res, result);
        } catch (err) { next(err); }
    },
};
