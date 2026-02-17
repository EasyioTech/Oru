
import { db } from '../../infrastructure/database/index.js';
import { subscriptionPlans, systemFeatures } from '../../infrastructure/database/schema.js';
import { eq, desc } from 'drizzle-orm';
import { FastifyBaseLogger } from 'fastify';
import { AppError, NotFoundError } from '../../utils/errors.js';
import { createPlanSchema, updatePlanSchema, createFeatureSchema, updateFeatureSchema } from './schemas.js';


export class PlansService {
    constructor(private logger: FastifyBaseLogger) { }

    async listPlans() {
        try {
            const plans = await db.select().from(subscriptionPlans).orderBy(subscriptionPlans.basePriceMonthly);
            // Return empty array if no plans exist (prevents frontend crashes)
            return (plans || []).map(plan => ({
                ...plan,
                basePriceMonthly: parseFloat(plan.basePriceMonthly as string) || 0,
                price: parseFloat(plan.basePriceMonthly as string) || 0,
                currency: 'inr',
                interval: 'month',
                features: Array.isArray(plan.features) ? plan.features : []
            }));
        } catch (error) {
            this.logger.error({ error, context: 'listPlans' });
            // Return empty array on error to prevent dashboard from breaking
            return [];
        }
    }

    async getPlan(id: string) {
        try {
            const [plan] = await db.select().from(subscriptionPlans).where(eq(subscriptionPlans.id, id));
            if (!plan) throw new NotFoundError('Plan not found');
            return plan;
        } catch (error) {
            if (error instanceof NotFoundError) throw error;
            this.logger.error({ error, context: 'getPlan', id });
            throw new AppError('Failed to fetch plan');
        }
    }

    async createPlan(input: any) {
        try {
            // Map 'price' to 'basePriceMonthly' if present
            const data = { ...input };
            if (data.price !== undefined) {
                data.basePriceMonthly = data.price.toString();
                delete data.price;
            }

            // Generate slug if not present
            if (!data.slug && data.name) {
                data.slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
            }

            const validated = createPlanSchema.parse(data);
            const [plan] = await db.insert(subscriptionPlans).values({
                ...validated,
            }).returning();
            return plan;
        } catch (error) {
            this.logger.error({ error, context: 'createPlan', input });
            throw new AppError('Failed to create plan');
        }
    }

    async updatePlan(id: string, input: any) {
        try {
            // Map 'price' to 'basePriceMonthly' if present
            const data = { ...input };
            if (data.price !== undefined) {
                data.basePriceMonthly = data.price.toString();
                delete data.price;
            }

            // Update slug if name changes and no slug provided
            if (data.name && !data.slug) {
                data.slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
            }

            const validated = updatePlanSchema.parse(data);
            const [plan] = await db.update(subscriptionPlans)
                .set({ ...validated, updatedAt: new Date() })
                .where(eq(subscriptionPlans.id, id))
                .returning();
            if (!plan) throw new NotFoundError('Plan not found');
            return plan;
        } catch (error) {
            if (error instanceof NotFoundError) throw error;
            this.logger.error({ error, context: 'updatePlan', id, input });
            throw new AppError('Failed to update plan');
        }
    }

    async deletePlan(id: string) {
        try {
            const [plan] = await db.delete(subscriptionPlans)
                .where(eq(subscriptionPlans.id, id))
                .returning();
            if (!plan) throw new NotFoundError('Plan not found');
            return plan;
        } catch (error) {
            if (error instanceof NotFoundError) throw error;
            this.logger.error({ error, context: 'deletePlan', id });
            throw new AppError('Failed to delete subscription plan');
        }
    }

    // Features Management

    async listFeatures() {
        try {
            const features = await db.select().from(systemFeatures).orderBy(systemFeatures.name);
            return features || [];
        } catch (error) {
            this.logger.error({ error, context: 'listFeatures' });
            return [];
        }
    }

    async createFeature(input: any) {
        try {
            const validated = createFeatureSchema.parse(input);
            const [feature] = await db.insert(systemFeatures).values({
                ...validated,
            }).returning();
            return feature;
        } catch (error) {
            this.logger.error({ error, context: 'createFeature', input });
            throw new AppError('Failed to create feature');
        }
    }

    async updateFeature(id: string, input: any) {
        try {
            const validated = updateFeatureSchema.parse(input);
            const [feature] = await db.update(systemFeatures)
                .set({ ...validated, updatedAt: new Date() })
                .where(eq(systemFeatures.id, id))
                .returning();

            if (!feature) throw new NotFoundError('Feature not found');
            return feature;
        } catch (error) {
            if (error instanceof NotFoundError) throw error;
            this.logger.error({ error, context: 'updateFeature', id, input });
            throw new AppError('Failed to update feature');
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
            this.logger.error({ error, context: 'deleteFeature', id });
            throw new AppError('Failed to delete feature');
        }
    }
}
