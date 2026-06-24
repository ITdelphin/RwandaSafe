const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const email = 'nkurizadelphin@gmail.com';

    let user = await prisma.user.findFirst({
        where: { email }
    });

    if (!user) {
        console.log(`User ${email} not found. Registering...`);
        // I don't know the hashed password so if they don't exist they should register first on the frontend.
        return;
    }

    console.log('Promoting user to SUPER_ADMIN...');
    await prisma.user.update({
        where: { id: user.id },
        data: { role: 'SUPER_ADMIN' }
    });

    const dashboards = ['POLICE', 'HOSPITAL', 'FIRE', 'RIB', 'ADMIN'];
    for (const dashboard of dashboards) {
        // Check if it exists
        const existing = await prisma.dashboardAccess.findFirst({
            where: { userId: user.id, dashboard }
        });

        if (existing) {
            await prisma.dashboardAccess.update({
                where: { id: existing.id },
                data: { isActive: true }
            });
        } else {
            await prisma.dashboardAccess.create({
                data: {
                    userId: user.id,
                    dashboard,
                    grantedById: user.id
                }
            });
        }
    }

    console.log(`Success! ${email} is now a SUPER_ADMIN with access to all dashboards.`);
}

main().finally(() => prisma.$disconnect());
