
import { FastifyInstance } from 'fastify';
import { SystemMonitoringService } from './services/system-monitoring.service.js';
import { SystemManagementService } from './services/system-management.service.js';
import { SystemAgencyService } from './services/system-agency.service.js';
import { UpdateSystemSettingsInput, TicketsQueryInput, CreateFeatureInput, UpdateFeatureInput } from './schemas.js';

export class SystemService {
    private monitoring: SystemMonitoringService;
    private management: SystemManagementService;
    private agency: SystemAgencyService;

    constructor(private readonly app: FastifyInstance) {
        this.monitoring = new SystemMonitoringService(app);
        this.management = new SystemManagementService(app);
        this.agency = new SystemAgencyService(app);
    }

    // Delegate methods
    async getMetrics() { return this.monitoring.getMetrics(); }
    async getRealtimeUsage() { return this.monitoring.getRealtimeUsage(); }
    async getTickets(params?: TicketsQueryInput) { return this.monitoring.getTickets(params); }
    async getTicketsSummary() { return this.monitoring.getMetrics(); } // simplified

    async getSettings() { return this.management.getSettings(); }
    async updateSettings(updates: UpdateSystemSettingsInput) { return this.management.updateSettings(updates); }
    async getMaintenanceStatus() { return this.management.getSettings(); } // simplified
    async getBranding() { return this.management.getSettings(); } // simplified
    async getSystemFeatures() { return this.management.getSystemFeatures(); }
    async createFeature(input: CreateFeatureInput) { return this.management.createFeature(input); }
    async updateFeature(id: string, input: UpdateFeatureInput) { return this.management.getSystemFeatures(); } // placeholder

    async getAgencyData(agencyId: string) { return this.agency.getAgencyData(agencyId); }
    async getAgencyPages(agencyId: string) { return this.agency.getAgencyPages(agencyId); }
}
