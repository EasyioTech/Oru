
import { db } from '../../infrastructure/database/index.js';
import { systemSettings, agencies, users, systemHealthMetrics, profiles, tickets, systemFeatures, userRoles } from '../../infrastructure/database/schema.js';
import { eq, sql, desc, count, isNotNull, and } from 'drizzle-orm';
import { FastifyInstance } from 'fastify';
import { AppError, NotFoundError } from '../../utils/errors.js';

export class SystemService {
    constructor(private readonly app: FastifyInstance) { }

    async getMetrics() {
        // Agencies Counts
        const [totalAgenciesResult] = await db.select({ count: count() }).from(agencies);
        const [activeAgenciesResult] = await db.select({ count: count() }).from(agencies).where(eq(agencies.isActive, true));

        // Users Counts
        const [totalUsersResult] = await db.select({ count: count() }).from(users);
        const [activeUsersResult] = await db.select({ count: count() }).from(users).where(eq(users.status, 'active'));

        // Subscription Plans Breakdown
        const plansResult = await db
            .select({
                plan: agencies.subscriptionPlan,
                count: count(),
            })
            .from(agencies)
            .groupBy(agencies.subscriptionPlan);

        const subscriptionPlans: Record<string, number> = {
            basic: 0,
            pro: 0,
            enterprise: 0,
        };

        plansResult.forEach(row => {
            if (row.plan) subscriptionPlans[row.plan] = row.count;
        });

        // System Health (Latest)
        const [latestHealth] = await db
            .select()
            .from(systemHealthMetrics)
            .orderBy(desc(systemHealthMetrics.timestamp))
            .limit(1);

        // Fetch Agencies for the list
        const agenciesList = await db.select().from(agencies).orderBy(desc(agencies.createdAt)).limit(50);

        // Counts users per agency from central profiles table
        const usersPerAgency = await db
            .select({
                agencyId: profiles.agencyId,
                count: count(),
            })
            .from(profiles)
            .where(isNotNull(profiles.agencyId))
            .groupBy(profiles.agencyId);

        const agencyUserMap = new Map(usersPerAgency.map(row => [row.agencyId as string, row.count]));

        // Map to shape expected by schema input
        const formattedAgencies = agenciesList.map(agency => ({
            ...agency,
            userCount: agencyUserMap.get(agency.id) || 0,
            projectCount: 0,
            invoiceCount: 0,
        }));

        // Mock revenue/usage
        const revenueMetrics = {
            mrr: 0,
            arr: 0,
        };

        const usageStats = {
            totalProjects: 0,
            totalInvoices: 0,
            totalClients: 0,
            totalAttendanceRecords: 0,
        };

        return {
            metrics: {
                totalAgencies: totalAgenciesResult.count,
                activeAgencies: activeAgenciesResult.count,
                totalUsers: totalUsersResult.count,
                activeUsers: activeUsersResult.count,
                subscriptionPlans,
                revenueMetrics,
                usageStats,
                systemHealth: {
                    uptime: `${latestHealth?.systemUptimeSeconds || 0}s`,
                    responseTime: latestHealth?.apiResponseTimeAvgMs || 0,
                    errorRate: Number(latestHealth?.apiErrorRatePercent || 0),
                },
            },
            agencies: formattedAgencies,
        };
    }

    async getSettings() {
        let [settings] = await db.select().from(systemSettings).limit(1);

        if (!settings) {
            const [newSettings] = await db.insert(systemSettings).values({
                systemName: 'BuildFlow ERP',
            }).returning();
            settings = newSettings;
        }

        // Unpack JSONB fields for frontend
        const socialLinks = settings.socialLinks as Record<string, string> || {};
        const legalLinks = settings.legalLinks as Record<string, string> || {};
        const supportAddress = settings.supportAddress as Record<string, string> || {};

        // Mask sensitive fields for frontend
        const maskedSettings = {
            ...settings,
            smtpPassword: settings.smtpPasswordEncrypted ? '***' : '',
            sendgridApiKey: settings.sendgridApiKeyEncrypted ? '***' : '',
            mailgunApiKey: settings.mailgunApiKeyEncrypted ? '***' : '',
            awsSesAccessKey: settings.awsSesAccessKeyEncrypted ? '***' : '',
            awsSesSecretKey: settings.awsSesSecretKeyEncrypted ? '***' : '',
            resendApiKey: settings.resendApiKeyEncrypted ? '***' : '',
            postmarkApiKey: settings.postmarkApiKeyEncrypted ? '***' : '',
            captchaSecretKey: settings.captchaSecretKeyEncrypted ? '***' : '',
            awsS3AccessKey: settings.awsS3AccessKeyEncrypted ? '***' : '',
            awsS3SecretKey: settings.awsS3SecretKeyEncrypted ? '***' : '',
            sentryDsn: settings.sentryDsnEncrypted ? '***' : '',

            // Unpack Social Links
            facebookUrl: socialLinks.facebook,
            twitterUrl: socialLinks.twitter,
            linkedinUrl: socialLinks.linkedin,
            instagramUrl: socialLinks.instagram,
            youtubeUrl: socialLinks.youtube,

            // Unpack Legal Links
            termsOfServiceUrl: legalLinks.termsOfService,
            privacyPolicyUrl: legalLinks.privacyPolicy,
            cookiePolicyUrl: legalLinks.cookiePolicy,

            // Unpack Support Address
            supportAddress: supportAddress.text || '',
        };

        return maskedSettings;
    }

    async updateSettings(updates: any) {
        try {
            // Validate that updates is an object
            if (!updates || typeof updates !== 'object') {
                throw new Error('Invalid settings data');
            }

            // Remove any undefined or null values
            const cleanUpdates = Object.entries(updates).reduce((acc, [key, value]) => {
                if (value !== undefined && value !== null) {
                    acc[key] = value;
                }
                return acc;
            }, {} as any);

            // If no valid updates, return current settings
            if (Object.keys(cleanUpdates).length === 0) {
                return await this.getSettings();
            }

            // Encrypt sensitive fields
            const sensitiveFields = {
                smtpPassword: 'smtpPasswordEncrypted',
                sendgridApiKey: 'sendgridApiKeyEncrypted',
                mailgunApiKey: 'mailgunApiKeyEncrypted',
                awsSesAccessKey: 'awsSesAccessKeyEncrypted',
                awsSesSecretKey: 'awsSesSecretKeyEncrypted',
                resendApiKey: 'resendApiKeyEncrypted',
                postmarkApiKey: 'postmarkApiKeyEncrypted',
                captchaSecretKey: 'captchaSecretKeyEncrypted',
                awsS3AccessKey: 'awsS3AccessKeyEncrypted',
                awsS3SecretKey: 'awsS3SecretKeyEncrypted',
                sentryDsn: 'sentryDsnEncrypted',
            };

            for (const [field, dbField] of Object.entries(sensitiveFields)) {
                if (cleanUpdates[field]) {
                    // Only update if value is provided and not the masked placeholder
                    if (cleanUpdates[field] !== '***') {
                        const { encrypt } = await import('../../utils/encryption.js');
                        cleanUpdates[dbField] = encrypt(cleanUpdates[field]);
                    }
                    // Always remove the virtual field so it doesn't try to save to DB
                    delete cleanUpdates[field];
                }
            }

            // --- Map Flat Fields to JSONB Columns ---

            // Get current settings to merge with existing JSONB data
            let currentSettings = await db.select().from(systemSettings).limit(1).then(res => res[0]);

            // Social Links
            const socialFields = {
                facebookUrl: 'facebook',
                twitterUrl: 'twitter',
                linkedinUrl: 'linkedin',
                instagramUrl: 'instagram',
                youtubeUrl: 'youtube'
            };
            const currentSocial = currentSettings.socialLinks as Record<string, string> || {};
            const newSocial = { ...currentSocial };
            let hasSocialUpdates = false;

            for (const [flatKey, jsonKey] of Object.entries(socialFields)) {
                if (flatKey in cleanUpdates) {
                    newSocial[jsonKey] = cleanUpdates[flatKey];
                    delete cleanUpdates[flatKey]; // Remove flat field
                    hasSocialUpdates = true;
                }
            }
            if (hasSocialUpdates) {
                cleanUpdates.socialLinks = newSocial;
            }

            // Legal Links
            const legalFields = {
                termsOfServiceUrl: 'termsOfService',
                privacyPolicyUrl: 'privacyPolicy',
                cookiePolicyUrl: 'cookiePolicy'
            };
            const currentLegal = currentSettings.legalLinks as Record<string, string> || {};
            const newLegal = { ...currentLegal };
            let hasLegalUpdates = false;

            for (const [flatKey, jsonKey] of Object.entries(legalFields)) {
                if (flatKey in cleanUpdates) {
                    newLegal[jsonKey] = cleanUpdates[flatKey];
                    delete cleanUpdates[flatKey]; // Remove flat field
                    hasLegalUpdates = true;
                }
            }
            if (hasLegalUpdates) {
                cleanUpdates.legalLinks = newLegal;
            }

            // Support Address
            if ('supportAddress' in cleanUpdates) {
                cleanUpdates.supportAddress = { text: cleanUpdates.supportAddress };
                // 'supportAddress' key in cleanUpdates is now the JSON object, which matches DB column name (if schema uses same name)
                // Schema uses 'supportAddress' (camelCase via drizzle-orm mappings usually, let's verify)
                // Drizzle schema: supportAddress: jsonb('support_address')
                // So cleanUpdates.supportAddress is correct.
            }

            const [updatedSettings] = await db.update(systemSettings)
                .set({
                    ...cleanUpdates,
                    updatedAt: new Date()
                })
                .where(eq(systemSettings.id, currentSettings.id))
                .returning();

            // Return masked settings
            return await this.getSettings();
        } catch (error) {
            this.app.log.error({ error, context: 'updateSettings', updates });
            // Return current settings on error
            return await this.getSettings();
        }
    }

    async getMaintenanceStatus() {
        const settings = await this.getSettings();
        return {
            maintenanceMode: settings.maintenanceMode,
            maintenanceMessage: settings.maintenanceMessage,
            startTime: settings.maintenanceStartTime,
            endTime: settings.maintenanceEndTime,
        };
    }

    async getBranding() {
        const settings = await this.getSettings();
        return {
            systemName: settings.systemName,
            systemTagline: settings.systemTagline,
            systemDescription: settings.systemDescription,
            logoUrl: settings.logoUrl,
            logoLightUrl: settings.logoLightUrl,
            logoDarkUrl: settings.logoDarkUrl,
            faviconUrl: settings.faviconUrl,

            // Contact
            supportEmail: settings.supportEmail,
            supportPhone: settings.supportPhone,
            supportAddress: settings.supportAddress, // This is the flattened string from getSettings

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

    async getRealtimeUsage() {
        // This would normally come from Redis/Websockets
        return {
            activeUsers: Math.floor(Math.random() * 50),
            activeSessions: Math.floor(Math.random() * 100),
            requestsPerSecond: Math.floor(Math.random() * 20),
            timestamp: new Date().toISOString(),
        };
    }

    async getTickets(params?: { status?: string; priority?: string; limit?: number; offset?: number }) {
        try {
            const limit = params?.limit || 100;
            const offset = params?.offset || 0;

            const conditions = [];
            if (params?.status) {
                conditions.push(eq(tickets.status, params.status));
            }
            if (params?.priority) {
                conditions.push(eq(tickets.priority, params.priority));
            }

            const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

            const ticketsList = await db
                .select()
                .from(tickets)
                .where(whereClause)
                .orderBy(desc(tickets.createdAt))
                .limit(limit)
                .offset(offset);

            return { tickets: ticketsList };
        } catch (error) {
            this.app.log.error({ error, context: 'getTickets' });
            // Return empty array on error to prevent dashboard crash
            return { tickets: [] };
        }
    }

    async getTicketsSummary() {
        try {
            const [totalResult] = await db.select({ count: count() }).from(tickets);
            const [openResult] = await db.select({ count: count() }).from(tickets).where(eq(tickets.status, 'open'));
            const [inProgressResult] = await db.select({ count: count() }).from(tickets).where(eq(tickets.status, 'in_progress'));
            const [resolvedResult] = await db.select({ count: count() }).from(tickets).where(eq(tickets.status, 'resolved'));

            // Get recent tickets (last 5)
            const recentTickets = await db
                .select({
                    id: tickets.id,
                    ticketNumber: tickets.ticketNumber,
                    title: tickets.title,
                    status: tickets.status,
                    priority: tickets.priority,
                    category: tickets.category,
                    createdAt: tickets.createdAt,
                })
                .from(tickets)
                .orderBy(desc(tickets.createdAt))
                .limit(5);

            // Calculate today's stats
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const [newTodayResult] = await db
                .select({ count: count() })
                .from(tickets)
                .where(sql`${tickets.createdAt} >= ${today}`);

            const [resolvedTodayResult] = await db
                .select({ count: count() })
                .from(tickets)
                .where(and(
                    eq(tickets.status, 'resolved'),
                    sql`${tickets.resolvedAt} >= ${today}`
                ));

            return {
                stats: {
                    total: totalResult.count,
                    open: openResult.count,
                    inProgress: inProgressResult.count,
                    resolved: resolvedResult.count,
                    avgResolutionTime: 0, // TODO: Calculate actual average
                    newToday: newTodayResult.count,
                    resolvedToday: resolvedTodayResult.count,
                },
                recentTickets,
            };
        } catch (error) {
            this.app.log.error({ error, context: 'getTicketsSummary' });
            // Return safe defaults on error to prevent dashboard crash
            return {
                stats: {
                    total: 0,
                    open: 0,
                    inProgress: 0,
                    resolved: 0,
                    avgResolutionTime: 0,
                    newToday: 0,
                    resolvedToday: 0,
                },
                recentTickets: [],
            };
        }
    }

    async getSystemFeatures() {
        try {
            const featuresList = await db.select().from(systemFeatures).where(eq(systemFeatures.isActive, true));
            return {
                features: featuresList,
                enabledModules: [
                    'agencies',
                    'users',
                    'plans',
                    'catalog',
                    'monitoring',
                    'database',
                ],
            };
        } catch (error) {
            this.app.log.error({ error, context: 'getSystemFeatures' });
            return { features: [], enabledModules: [] };
        }
    }

    async createFeature(input: any) {
        try {
            const [feature] = await db.insert(systemFeatures).values({
                ...input,
            }).returning();
            return feature;
        } catch (error) {
            this.app.log.error({ error, context: 'createFeature', input });
            throw new AppError('Failed to create system feature');
        }
    }

    async updateFeature(id: string, input: any) {
        try {
            const [feature] = await db.update(systemFeatures)
                .set({ ...input, updatedAt: new Date() })
                .where(eq(systemFeatures.id, id))
                .returning();
            if (!feature) throw new NotFoundError('Feature not found');
            return feature;
        } catch (error) {
            if (error instanceof NotFoundError) throw error;
            this.app.log.error({ error, context: 'updateFeature', id, input });
            throw new AppError('Failed to update system feature');
        }
    }

    async deleteFeature(id: string) {
        try {
            const [feature] = await db.update(systemFeatures)
                .set({ isActive: false, updatedAt: new Date() })
                .where(eq(systemFeatures.id, id))
                .returning();
            if (!feature) throw new NotFoundError('Feature not found');
            return feature;
        } catch (error) {
            if (error instanceof NotFoundError) throw error;
            this.app.log.error({ error, context: 'deleteFeature', id });
            throw new AppError('Failed to deactivate system feature');
        }
    }
    async getAgencyData(agencyId: string) {
        try {
            // Get Agency Users with Roles
            const agencyUsers = await db
                .select({
                    id: users.id,
                    full_name: profiles.fullName,
                    email: users.email,
                    role: userRoles.role,
                    is_active: users.status, // user status (active/inactive) mapping
                    created_at: users.createdAt,
                })
                .from(profiles)
                .innerJoin(users, eq(profiles.userId, users.id))
                .leftJoin(userRoles, and(
                    eq(userRoles.userId, profiles.userId),
                    eq(userRoles.agencyId, profiles.agencyId)
                ))
                .where(eq(profiles.agencyId, agencyId));

            // Map user status to boolean for frontend consistency (if needed)
            const formattedUsers = agencyUsers.map(u => ({
                ...u,
                is_active: u.is_active === 'active',
            }));

            // TODO: Implement other modules (Projects, Clients, Invoices, Inventory) once schemas are available
            // Returning empty arrays for now to prevent frontend crash
            return {
                users: formattedUsers,
                clients: [],
                projects: [],
                invoices: [],
                inventory: [],
            };
        } catch (error) {
            this.app.log.error({ error, context: 'getAgencyData', agencyId });
            return {
                users: [],
                clients: [],
                projects: [],
                invoices: [],
                inventory: [],
            };
        }
    }
}


