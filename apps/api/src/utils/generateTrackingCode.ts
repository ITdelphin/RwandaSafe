import { prisma } from '../config/database';

export async function generateTrackingCode(): Promise<string> {
  const year = new Date().getFullYear();
  const count = await prisma.incident.count({
    where: {
      createdAt: {
        gte: new Date(`${year}-01-01`),
        lt: new Date(`${year + 1}-01-01`),
      },
    },
  });
  const sequence = String(count + 1).padStart(5, '0');
  return `RW-${year}-${sequence}`;
}
