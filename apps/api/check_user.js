const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function main() {
    const user = await prisma.user.findFirst({
        where: { email: 'delphinngarambe@gmail.com' }
    });
    if (!user) {
        console.log('User NOT found!');
    } else {
        console.log('Hash in DB:', user.passwordHash);
        const valid = await bcrypt.compare('RwaSec#2026!Admin', user.passwordHash);
        console.log('Bcrypt match?', valid);
        console.log('Is Active?', user.isActive);
    }
}

main().finally(() => prisma.$disconnect());
