import { prisma } from '../../config/database';
import { adminService } from '../admin/admin.service';

export const opendataService = {
  async exportData(from: Date, to: Date, format: 'csv' | 'json') {
    return adminService.exportOpenData(from, to, format);
  },

  async getPublicSummary() {
    return adminService.getOpenDataSummary();
  },
};
