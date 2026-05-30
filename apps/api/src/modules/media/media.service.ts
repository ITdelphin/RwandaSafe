import { v2 as cloudinary } from 'cloudinary';
import { prisma } from '../../config/database';
import { env } from '../../config/env';
import { MediaType } from '@prisma/client';

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
});

const ALLOWED_MIME_TYPES: Record<string, MediaType> = {
  'image/jpeg': MediaType.PHOTO,
  'image/png':  MediaType.PHOTO,
  'image/webp': MediaType.PHOTO,
  'video/mp4':  MediaType.VIDEO,
  'audio/mpeg': MediaType.AUDIO,
  'audio/webm': MediaType.AUDIO,
};

const MAX_FILES_PER_INCIDENT = 5;

export const mediaService = {
  async uploadMedia(incidentId: string, file: Express.Multer.File, uploadedById: string) {
    const mediaType = ALLOWED_MIME_TYPES[file.mimetype];
    if (!mediaType) throw Object.assign(new Error('File type not allowed'), { statusCode: 400 });

    const existing = await prisma.incidentMedia.count({ where: { incidentId } });
    if (existing >= MAX_FILES_PER_INCIDENT) {
      throw Object.assign(new Error(`Maximum ${MAX_FILES_PER_INCIDENT} files per incident`), { statusCode: 400 });
    }

    const resourceType = mediaType === MediaType.VIDEO ? 'video' : mediaType === MediaType.AUDIO ? 'video' : 'image';

    const result = await new Promise<any>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: `rwanda-safe/incidents/${incidentId}`,
          resource_type: resourceType,
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(file.buffer);
    });

    return prisma.incidentMedia.create({
      data: {
        incidentId,
        url: result.secure_url,
        publicId: result.public_id,
        type: mediaType,
        filename: file.originalname,
        sizeBytes: file.size,
        uploadedById,
      },
    });
  },

  async deleteMedia(mediaId: string, requesterId: string) {
    const media = await prisma.incidentMedia.findUnique({ where: { id: mediaId } });
    if (!media) throw Object.assign(new Error('Media not found'), { statusCode: 404 });

    const user = await prisma.user.findUnique({ where: { id: requesterId }, select: { role: true } });
    if (media.uploadedById !== requesterId && user?.role !== 'SUPER_ADMIN') {
      throw Object.assign(new Error('Forbidden'), { statusCode: 403 });
    }

    if (media.publicId) {
      try {
        await cloudinary.uploader.destroy(media.publicId);
      } catch {
        // best-effort; still delete DB record
      }
    }

    await prisma.incidentMedia.delete({ where: { id: mediaId } });
  },

  async getIncidentMedia(incidentId: string) {
    return prisma.incidentMedia.findMany({ where: { incidentId }, orderBy: { createdAt: 'asc' } });
  },
};
