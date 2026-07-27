import { systemSettings, systemFeatures } from '../../../infrastructure/database/schema.js';
import { eq } from 'drizzle-orm';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { AppError, NotFoundError } from '../../../utils/errors.js';
import { UpdateSystemSettingsInput, CreateFeatureInput, UpdateFeatureInput } from '../schemas.js';
import { encrypt, decrypt } from '../../../utils/encryption.js';

export class SystemManagementService {
    constructor(private db: NodePgDatabase<any>) { }

    private maskSecret(encryptedValue?: string | null): string | undefined {
        return encryptedValue ? '***' : undefined;
    }

    async getSettings() {
        await this.db.insert(systemSettings).values({ systemName: 'Oru Erp' }).onConflictDoNothing();
        const [settings] = await this.db.select().from(systemSettings).limit(1);
        if (!settings) throw new AppError('Failed to initialize system settings');

        const socialLinks = (settings.socialLinks as Record<string, string>) || {};
        const legalLinks = (settings.legalLinks as Record<string, string>) || {};

        return {
            ...settings,
            facebookUrl: socialLinks.facebook || null,
            twitterUrl: socialLinks.twitter || null,
            linkedinUrl: socialLinks.linkedin || null,
            instagramUrl: socialLinks.instagram || null,
            youtubeUrl: socialLinks.youtube || null,
            termsOfServiceUrl: legalLinks.terms_of_service || null,
            privacyPolicyUrl: legalLinks.privacy_policy || null,
            cookiePolicyUrl: legalLinks.cookie_policy || null,
            supportAddress: typeof settings.supportAddress === 'string' ? settings.supportAddress : (settings.supportAddress as any)?.address || '',
            // Secrets (masked)
            smtpPassword: this.maskSecret(settings.smtpPasswordEncrypted),
            sendgridApiKey: this.maskSecret(settings.sendgridApiKeyEncrypted),
        };
    }

    async updateSettings(updates: UpdateSystemSettingsInput) {
        let currentSettings = await this.db.select().from(systemSettings).limit(1).then(res => res[0]);
        if (!currentSettings) throw new AppError('System settings not initialized');

        // Extract social fields
        const socialLinks = (currentSettings.socialLinks as Record<string, string>) || {};
        if (updates.facebookUrl !== undefined) socialLinks.facebook = updates.facebookUrl || '';
        if (updates.twitterUrl !== undefined) socialLinks.twitter = updates.twitterUrl || '';
        if (updates.linkedinUrl !== undefined) socialLinks.linkedin = updates.linkedinUrl || '';
        if (updates.instagramUrl !== undefined) socialLinks.instagram = updates.instagramUrl || '';
        if (updates.youtubeUrl !== undefined) socialLinks.youtube = updates.youtubeUrl || '';

        // Extract legal fields
        const legalLinks = (currentSettings.legalLinks as Record<string, string>) || {};
        if (updates.termsOfServiceUrl !== undefined) legalLinks.terms_of_service = updates.termsOfServiceUrl || '';
        if (updates.privacyPolicyUrl !== undefined) legalLinks.privacy_policy = updates.privacyPolicyUrl || '';
        if (updates.cookiePolicyUrl !== undefined) legalLinks.cookie_policy = updates.cookiePolicyUrl || '';

        // Clean updates object before sending to DB
        const dbUpdates: any = { ...updates };

        // Handle secrets encryption
        const secretFields: Record<string, string> = {
            smtpPassword: 'smtpPasswordEncrypted',
            sendgridApiKey: 'sendgridApiKeyEncrypted',
        };

        for (const [virtual, real] of Object.entries(secretFields)) {
            if (updates[virtual as keyof UpdateSystemSettingsInput] !== undefined) {
                const value = updates[virtual as keyof UpdateSystemSettingsInput];
                if (value === '***') {
                    // Do nothing, skip overwriting
                } else if (!value) {
                    dbUpdates[real] = null;
                } else {
                    dbUpdates[real] = encrypt(String(value));
                }
                delete dbUpdates[virtual];
            }
        }

        // Remove virtual fields that aren't columns
        const virtualFields = [
            'facebookUrl', 'twitterUrl', 'linkedinUrl', 'instagramUrl', 'youtubeUrl',
            'termsOfServiceUrl', 'privacyPolicyUrl', 'cookiePolicyUrl'
        ];
        virtualFields.forEach(field => delete dbUpdates[field]);

        // Add packed JSONB fields
        dbUpdates.socialLinks = socialLinks;
        dbUpdates.legalLinks = legalLinks;

        await this.db.update(systemSettings)
            .set({ ...dbUpdates, updatedAt: new Date() })
            .where(eq(systemSettings.id, currentSettings.id));

        return this.getSettings(); // Return re-mapped settings
    }

    async getSystemFeatures() {
        const featuresList = await this.db.select().from(systemFeatures).where(eq(systemFeatures.isActive, true));
        return { features: featuresList, enabledModules: ['agencies', 'users', 'crm', 'hr', 'finance', 'projects', 'procurement', 'reports', 'inventory'] };
    }

    async createFeature(input: CreateFeatureInput) {
        const [feature] = await this.db.insert(systemFeatures).values({ ...input }).returning();
        return feature;
    }

    async getBranding() {
        const settings = await this.getSettings();
        return {
            systemName: settings.systemName,
            systemTagline: settings.systemTagline,
            systemDescription: settings.systemDescription,
            logoUrl: settings.logoUrl,
            faviconUrl: settings.faviconUrl,
            // Contact
            supportEmail: settings.supportEmail,
            supportPhone: settings.supportPhone,
            supportAddress: settings.supportAddress,
            // Social
            facebookUrl: settings.facebookUrl,
            twitterUrl: settings.twitterUrl,
            linkedinUrl: settings.linkedinUrl,
            instagramUrl: settings.instagramUrl,
            youtubeUrl: settings.youtubeUrl,
            // Legal
            termsOfServiceUrl: settings.termsOfServiceUrl,
            privacyPolicyUrl: settings.privacyPolicyUrl,
            cookiePolicyUrl: settings.cookiePolicyUrl,
        };
    }

    async getSeoSettings() {
        const settings = await this.getSettings();
        return {
            facebook_url: settings.facebookUrl,
            twitter_url: settings.twitterUrl,
            linkedin_url: settings.linkedinUrl,
            instagram_url: settings.instagramUrl,
            youtube_url: settings.youtubeUrl,
        };
    }

    async updateFeature(featureId: string, updates: UpdateFeatureInput) {
        const [updatedFeature] = await this.db.update(systemFeatures)
            .set({ ...updates, updatedAt: new Date() })
            .where(eq(systemFeatures.id, featureId))
            .returning();

        if (!updatedFeature) {
            throw new NotFoundError(`Feature with ID ${featureId} not found.`);
        }
        return updatedFeature;
    }

    async deleteFeature(featureId: string) {
        const [deletedFeature] = await this.db.delete(systemFeatures)
            .where(eq(systemFeatures.id, featureId))
            .returning();

        if (!deletedFeature) {
            throw new NotFoundError(`Feature with ID ${featureId} not found.`);
        }
        return deletedFeature;
    }
}
