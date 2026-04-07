
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
    async getDetailedHealth() { return this.monitoring.checkDetailedHealth(); }
    async getSignupPreflight() { return this.monitoring.checkSignupPreflight(); }
    async getRealtimeUsage() { return this.monitoring.getRealtimeUsage(); }
    async getTickets(params?: TicketsQueryInput) { return this.monitoring.getTickets(params); }
    async getTicketsSummary() { return this.monitoring.getTicketsSummary(); }

    async getSettings() { return this.management.getSettings(); }
    async getSeoSettings() { return this.management.getSeoSettings(); }
    async updateSettings(updates: UpdateSystemSettingsInput) { return this.management.updateSettings(updates); }
    async getBranding() { return this.management.getBranding(); }
    async getSystemFeatures() { return this.management.getSystemFeatures(); }
    async createFeature(input: CreateFeatureInput) { return this.management.createFeature(input); }
    async updateFeature(id: string, input: UpdateFeatureInput) { return this.management.updateFeature(id, input); }
    async deleteFeature(id: string) { return this.management.deleteFeature(id); }

    async getAgencyData(agencyId: string) { return this.agency.getAgencyData(agencyId); }
    async getAgencyPages(agencyId: string) { return this.agency.getAgencyPages(agencyId); }
}
