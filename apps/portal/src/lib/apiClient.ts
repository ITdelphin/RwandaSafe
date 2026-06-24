import axios from 'axios';

export const apiClient = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/v1',
    withCredentials: true,
});

export const DASHBOARD_URLS: Record<string, string> = {
    ADMIN: process.env.NEXT_PUBLIC_ADMIN_URL || 'http://localhost:3005',
    POLICE: process.env.NEXT_PUBLIC_POLICE_URL || 'http://localhost:3001',
    HOSPITAL: process.env.NEXT_PUBLIC_HOSPITAL_URL || 'http://localhost:3002',
    FIRE: process.env.NEXT_PUBLIC_FIRE_URL || 'http://localhost:3003',
    RIB: process.env.NEXT_PUBLIC_RIB_URL || 'http://localhost:3004',
};
