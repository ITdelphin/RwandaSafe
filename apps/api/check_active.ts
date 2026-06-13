import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const user = await prisma.user.findFirst({
        where: { email: 'delphinngarambe@gmail.com' }
    });

    if (!user) {
        console.log('User NOT FOUND');
        return;
    }

    console.log('User Email:', user.email);
    console.log('User Role:', user.role);
    console.log('User isActive:', user.isActive);
    console.log('User isVerified:', user.isVerified);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
