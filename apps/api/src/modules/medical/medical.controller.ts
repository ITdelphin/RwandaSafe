import { Request, Response } from 'express';
import { medicalService } from './medical.service';
import { sendSuccess, sendError } from '../../utils/response';
import { socketEmit } from '../../socket/socket';
import { TriageLevel, BloodType, AmbulanceStatus, Prisma } from '@prisma/client';

export const medicalController = {
  async setTriage(req: Request, res: Response) {
    try {
      const { incidentId } = req.params;
      const { triageLevel, symptoms, age, gender, bloodType, isConscious, isBreathing, vitalSigns } = req.body;
      if (!triageLevel) return sendError(res, 'triageLevel is required', 400);

      const result = await medicalService.setTriageLevel(
        incidentId,
        triageLevel as TriageLevel,
        { symptoms, age, gender, bloodType: bloodType as BloodType, isConscious, isBreathing, vitalSigns: vitalSigns as Prisma.InputJsonValue | undefined },
        req.user!.id,
      );
      return sendSuccess(res, result);
    } catch (err: any) {
      return sendError(res, err.message || 'Internal server error', err.statusCode || 500);
    }
  },

  async dispatchAmbulance(req: Request, res: Response) {
    try {
      const { incidentId } = req.params;
      const { ambulanceId } = req.body;
      if (!ambulanceId) return sendError(res, 'ambulanceId is required', 400);

      const result = await medicalService.dispatchAmbulance(incidentId, ambulanceId, req.user!.id);
      socketEmit.ambulanceDispatched(incidentId, result.ambulance);
      return sendSuccess(res, result);
    } catch (err: any) {
      return sendError(res, err.message || 'Internal server error', err.statusCode || 500);
    }
  },

  async updateAmbulanceStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status, lat, lng } = req.body;
      if (!status) return sendError(res, 'status is required', 400);

      const result = await medicalService.updateAmbulanceStatus(
        id,
        status as AmbulanceStatus,
        lat,
        lng,
      );
      socketEmit.ambulanceUpdated(result);
      return sendSuccess(res, result);
    } catch (err: any) {
      return sendError(res, err.message || 'Internal server error', err.statusCode || 500);
    }
  },

  async recommendHospital(req: Request, res: Response) {
    try {
      const { incidentId } = req.params;
      const { lat, lng, triageLevel, bloodType } = req.query;
      if (!lat || !lng || !triageLevel) {
        return sendError(res, 'lat, lng, and triageLevel are required', 400);
      }

      const result = await medicalService.recommendHospital(
        parseFloat(lat as string),
        parseFloat(lng as string),
        triageLevel as TriageLevel,
        bloodType as BloodType | undefined,
      );
      return sendSuccess(res, result);
    } catch (err: any) {
      return sendError(res, err.message || 'Internal server error', err.statusCode || 500);
    }
  },

  async assignHospital(req: Request, res: Response) {
    try {
      const { incidentId } = req.params;
      const { hospitalId } = req.body;
      if (!hospitalId) return sendError(res, 'hospitalId is required', 400);

      const result = await medicalService.assignReceivingHospital(incidentId, hospitalId, req.user!.id);
      return sendSuccess(res, result);
    } catch (err: any) {
      return sendError(res, err.message || 'Internal server error', err.statusCode || 500);
    }
  },

  async activateMassCasualty(req: Request, res: Response) {
    try {
      const { title, description, location, lat, lng, estimatedCount } = req.body;
      if (!title || !location || lat == null || lng == null) {
        return sendError(res, 'title, location, lat, and lng are required', 400);
      }

      const result = await medicalService.activateMassCasualtyMode(
        { title, description, location, lat, lng, estimatedCount: estimatedCount ?? 0 },
        req.user!.id,
      );
      socketEmit.massCasualtyActivated(result);
      return sendSuccess(res, result, 201);
    } catch (err: any) {
      return sendError(res, err.message || 'Internal server error', err.statusCode || 500);
    }
  },

  async createTelemedicine(req: Request, res: Response) {
    try {
      const { incidentId } = req.params;
      const { citizenUserId, doctorId } = req.body;
      if (!citizenUserId) return sendError(res, 'citizenUserId is required', 400);

      const session = await medicalService.createTelemedicineSession(incidentId, citizenUserId, doctorId);
      if (session.sessionUrl) {
        socketEmit.telemedicineReady(citizenUserId, session.sessionUrl);
      }
      return sendSuccess(res, session, 201);
    } catch (err: any) {
      return sendError(res, err.message || 'Internal server error', err.statusCode || 500);
    }
  },

  async getBloodBank(req: Request, res: Response) {
    try {
      const result = await medicalService.getBloodBankStatus();
      return sendSuccess(res, result);
    } catch (err: any) {
      return sendError(res, err.message || 'Internal server error', err.statusCode || 500);
    }
  },

  async getAmbulances(req: Request, res: Response) {
    try {
      const agencyId = (req as any).agency?.id;
      if (!agencyId) return sendError(res, 'Agency not found', 400);
      const result = await medicalService.getAmbulances(agencyId);
      return sendSuccess(res, result);
    } catch (err: any) {
      return sendError(res, err.message || 'Internal server error', err.statusCode || 500);
    }
  },

  async getAvailableAmbulances(req: Request, res: Response) {
    try {
      const agencyId = (req as any).agency?.id;
      if (!agencyId) return sendError(res, 'Agency not found', 400);
      const result = await medicalService.getAvailableAmbulances(agencyId);
      return sendSuccess(res, result);
    } catch (err: any) {
      return sendError(res, err.message || 'Internal server error', err.statusCode || 500);
    }
  },

  async updateAmbulanceLocation(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { lat, lng } = req.body;
      if (lat == null || lng == null) return sendError(res, 'lat and lng are required', 400);
      const result = await medicalService.updateAmbulanceLocation(id, lat, lng);
      return sendSuccess(res, result);
    } catch (err: any) {
      return sendError(res, err.message || 'Internal server error', err.statusCode || 500);
    }
  },
};
