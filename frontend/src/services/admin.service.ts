import api from '../lib/api';

export interface AuditLog {
    id: string;
    userId: string;
    action: string;
    details: string;
    ipAddress: string;
    userAgent: string;
    createdAt: string;
    user?: {
        email: string;
        role: string;
    }
}

export interface SystemStats {
    patients: number;
    doctors: number;
    appointments: number;
    auditLogs: number;
}

export const adminService = {
    getStats: async () => {
        const response = await api.get('/admin/stats');
        return response.data.data;
    },

    getAuditLogs: async (limit: number = 50, offset: number = 0) => {
        const response = await api.get(`/audit?limit=${limit}&offset=${offset}`);
        return response.data;
    },
    
    getDoctors: async () => {
        const response = await api.get('/admin/doctors');
        return response.data.data;
    },

    getPatients: async () => {
        const response = await api.get('/admin/patients');
        return response.data.data;
    }
};
