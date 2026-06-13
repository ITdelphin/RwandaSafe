import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    const email = 'delphinngarambe@gmail.com';
    const plainPassword = 'RwaSec#2026!Admin';

    const user = await prisma.user.findFirst({
        where: { email }
    });

    if (!user) {
        console.log(`User ${email} not found in DB`);
        return;
    }

    console.log(`User found: ${user.id}`);

    const isMatch = await bcrypt.compare(plainPassword, user.passwordHash || '');
    console.log(`Password match: ${isMatch}`);

    if (!isMatch && user.passwordHash) {
        console.log('Trying original password:');
        const isMatchOld = await bcrypt.compare('RwandaSafe123', user.passwordHash);
        console.log(`Original password match: ${isMatchOld}`);
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
