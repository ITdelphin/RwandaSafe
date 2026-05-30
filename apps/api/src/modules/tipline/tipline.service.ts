import { prisma } from '../../config/database';

export const tiplineService = {
  // Submit a tip — NEVER log IP address per privacy policy
  async submitTip(data: {
    content: string;
    investigationId?: string;
    submitterPhone?: string;
    isAnonymous?: boolean;
  }) {
    // IMPORTANT: We deliberately do NOT log, store, or transmit the caller's IP address.
    // This protects tipster safety and encourages community reporting.
    return prisma.tip.create({
      data: {
        content: data.content,
        investigationId: data.investigationId,
        submitterPhone: data.isAnonymous ? undefined : data.submitterPhone,
        isAnonymous: data.isAnonymous ?? true,
        isReviewed: false,
      },
    });
  },

  // Get unreviewed tips (RIB only)
  async getUnreviewedTips(filters: { page?: number; limit?: number; investigationId?: string } = {}) {
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: any = { isReviewed: false };
    if (filters.investigationId) where.investigationId = filters.investigationId;

    const [tips, total] = await prisma.$transaction([
      prisma.tip.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.tip.count({ where }),
    ]);

    return { tips, total, page, limit, totalPages: Math.ceil(total / limit) };
  },

  // Review a tip (mark as reviewed, set credibility)
  async reviewTip(
    tipId: string,
    reviewedById: string,
    isCredible: boolean,
    reviewNotes?: string,
  ) {
    const tip = await prisma.tip.findUnique({ where: { id: tipId } });
    if (!tip) throw Object.assign(new Error('Tip not found'), { statusCode: 404 });

    return prisma.tip.update({
      where: { id: tipId },
      data: {
        isReviewed: true,
        isCredible,
        reviewedById,
        reviewNotes,
      },
    });
  },
};
