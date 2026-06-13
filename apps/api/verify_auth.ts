import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log('--- DB Check ---');
    const user = await prisma.user.findFirst({
        where: { email: 'delphinngarambe@gmail.com' }
    });

    if (!user) {
        console.log('User NOT FOUND in database!');
        const users = await prisma.user.findMany({ select: { email: true, role: true } });
        console.log('All users in DB:', users);
        return;
    }

    console.log('User Found:');
    console.log('  ID:', user.id);
    console.log('  Email:', user.email);
    console.log('  Role:', user.role);
    console.log('  Verified:', user.isVerified);
    console.log('  Has Password Hash:', !!user.passwordHash);

    if (user.passwordHash) {
        const isMatch = await bcrypt.compare('RwaSec#2026!Admin', user.passwordHash);
        console.log('Password "RwaSec#2026!Admin" Match:', isMatch);

        if (!isMatch) {
            const isMatchOld = await bcrypt.compare('RwandaSafe123', user.passwordHash);
            console.log('Password "RwandaSafe123" Match:', isMatchOld);
        }
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
