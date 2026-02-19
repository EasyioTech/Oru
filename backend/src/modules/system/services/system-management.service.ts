
import { db } from '../../../infrastructure/database/index.js';
import { systemSettings, systemFeatures } from '../../../infrastructure/database/schema.js';
import { eq } from 'drizzle-orm';
import { FastifyInstance } from 'fastify';
import { AppError, NotFoundError } from '../../../utils/errors.js';
import { UpdateSystemSettingsInput, CreateFeatureInput, UpdateFeatureInput } from '../schemas.js';

export class SystemManagementService {
    constructor(private readonly app: FastifyInstance) { }

    async getSettings() {
        await db.insert(systemSettings).values({ systemName: 'BuildFlow ERP' }).onConflictDoNothing();
        const [settings] = await db.select().from(systemSettings).limit(1);
        if (!settings) throw new AppError('Failed to initialize system settings');
        const socialLinks = (settings.socialLinks as Record<string, string>) || {};
        return { ...settings, facebookUrl: socialLinks.facebook, youtubeUrl: socialLinks.youtube };
    }

    async updateSettings(updates: UpdateSystemSettingsInput) {
        let currentSettings = await db.select().from(systemSettings).limit(1).then(res => res[0]);
        const [updatedSettings] = await db.update(systemSettings).set({ ...updates, updatedAt: new Date() }).where(eq(systemSettings.id, currentSettings.id)).returning();
        return updatedSettings;
    }

    async getSystemFeatures() {
        const featuresList = await db.select().from(systemFeatures).where(eq(systemFeatures.isActive, true));
        return { features: featuresList, enabledModules: ['agencies', 'users', 'catalog'] };
    }

    async createFeature(input: CreateFeatureInput) {
        const [feature] = await db.insert(systemFeatures).values({ ...input }).returning();
        return feature;
    }
}
