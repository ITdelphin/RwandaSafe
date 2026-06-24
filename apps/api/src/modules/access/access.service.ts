import { prisma } from '../../config/database';
import { DashboardType, Role } from '@prisma/client';
// import { socketEmit } from '../../socket/socket'; // Omitted if not present or replace with actual
// import { notificationsService } from '../notifications/notifications.service'; // Omitted or simplified

export const accessService = {

    /**
     * Returns the list of dashboards a user currently has active access to.
     */
    async getUserDashboardAccess(userId: string): Promise<DashboardType[]> {
        const access = await prisma.dashboardAccess.findMany({
            where: { userId, isActive: true },
            select: { dashboard: true },
        });
        return access.map(a => a.dashboard);
    },

    /**
     * Grants a user access to a specific dashboard.
     * Only callable by SUPER_ADMIN.
     */
    async grantAccess(userId: string, dashboard: DashboardType, grantedById: string) {
        const existing = await prisma.dashboardAccess.findUnique({
            where: { userId_dashboard: { userId, dashboard } },
        });

        let access;
        if (existing) {
            access = await prisma.dashboardAccess.update({
                where: { id: existing.id },
                data: { isActive: true, grantedById, grantedAt: new Date(), revokedAt: null },
            });
        } else {
            access = await prisma.dashboardAccess.create({
                data: { userId, dashboard, grantedById },
            });
        }

        // Try to send notification, safely ignore if service not imported
        return access;
    },

    /**
     * Revokes a user's access to a specific dashboard.
     */
    async revokeAccess(userId: string, dashboard: DashboardType, revokedById: string) {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (user?.role === 'SUPER_ADMIN' && dashboard === 'ADMIN' && userId === revokedById) {
            throw new Error('Cannot revoke your own admin access');
        }

        await prisma.dashboardAccess.updateMany({
            where: { userId, dashboard },
            data: { isActive: false, revokedAt: new Date() },
        });
    },

    /**
     * Returns all users and their current dashboard access — for the admin access management screen.
     */
    async listAllAccess(filters: { dashboard?: DashboardType; role?: Role }) {
        return prisma.user.findMany({
            where: {
                role: { not: 'CITIZEN' },
                ...(filters.role && { role: filters.role }),
            },
            select: {
                id: true,
                name: true,
                phone: true,
                email: true,
                role: true,
                isActive: true,
                dashboardAccess: {
                    where: { isActive: true },
                    select: { dashboard: true, grantedAt: true },
                },
            },
        });
    },

    /**
     * Bulk grant — give a user access to multiple dashboards at once.
     */
    async grantMultipleAccess(userId: string, dashboards: DashboardType[], grantedById: string) {
        const results = [];
        for (const dashboard of dashboards) {
            results.push(await this.grantAccess(userId, dashboard, grantedById));
        }
        return results;
    },

    /**
     * Lists ALL users including citizens — so super admin can see who registered.
     */
    async listAllUsers(search?: string) {
        return prisma.user.findMany({
            where: search ? {
                OR: [
                    { name: { contains: search, mode: 'insensitive' } },
                    { email: { contains: search, mode: 'insensitive' } },
                ]
            } : undefined,
            select: {
                id: true,
                name: true,
                phone: true,
                email: true,
                role: true,
                isActive: true,
                isVerified: true,
                createdAt: true,
                dashboardAccess: {
                    where: { isActive: true },
                    select: { dashboard: true, grantedAt: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    },

    /**
     * Promote a CITIZEN to a staff role and immediately grant them access
     * to a specific department dashboard. This is the one-click flow the
     * Super Admin uses after a citizen creates an account.
     */
    async promoteAndGrant(
        userId: string,
        dashboard: DashboardType,
        grantedById: string
    ) {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) throw Object.assign(new Error('User not found'), { statusCode: 404 });

        // Map dashboard → role
        const dashboardRoleMap: Record<string, Role> = {
            POLICE: Role.POLICE_OFFICER,
            HOSPITAL: Role.MEDICAL_RESPONDER,
            FIRE: Role.FIRE_OFFICER,
            RIB: Role.RIB_INVESTIGATOR,
            ADMIN: Role.SUPER_ADMIN,
        };
        const newRole = dashboardRoleMap[dashboard] ?? Role.POLICE_OFFICER;

        // Only promote if still a citizen
        if (user.role === 'CITIZEN') {
            await prisma.user.update({
                where: { id: userId },
                data: { role: newRole, isVerified: true, isActive: true },
            });
        }

        // Grant dashboard access
        await this.grantAccess(userId, dashboard, grantedById);

        return { userId, dashboard, newRole };
    },
};
