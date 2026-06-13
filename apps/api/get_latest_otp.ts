import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function getLatestOtp() {
    const otp = await prisma.otpCode.findFirst({
        where: { isUsed: false },
        orderBy: { createdAt: 'desc' },
        include: { user: true }
    });

    if (otp) {
        console.log(`LATEST_OTP:${otp.code}`);
        console.log(`PHONE:${otp.user.phone}`);
    } else {
        console.log('NO_OTP_FOUND');
    }
}

getLatestOtp().catch(console.error).finally(() => prisma.$disconnect());
