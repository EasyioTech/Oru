import { eq, sql } from 'drizzle-orm';
import { users, profiles, userRoles, agencies, auditLogs, agencySettings, workspaceProfiles } from '../../infrastructure/database/schema.js';
import { and } from 'drizzle-orm';
import { hashPassword, verifyPassword } from '../../utils/password.js';
import { UnauthorizedError, ValidationError } from '../../utils/errors.js';
import type { RegisterInput, LoginInput, AgencySignupInput } from './schemas.js';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import type { JWT } from '@fastify/jwt';
import type { FastifyBaseLogger } from 'fastify';
import { agencyProvisioningQueue } from '../../jobs/queues.js';
import type { AgencyProvisioningPayload } from '../../jobs/definitions.js';
import { transformAgencyRow } from '../../infrastructure/transformers/agency.transformer.js';
import { provisionNewAgency } from '../agencies/provisioning/index.js';

export class AuthService {
    constructor(
        private db: NodePgDatabase<any> | any,
        private jwt: JWT | any,
        private log: FastifyBaseLogger | any
    ) { }

    async agencySignup(input: AgencySignupInput) {
        const { agencyName, industry, teamSize, name, email, password } = input;

        // Check if email is already registered before beginning
        const existing = await this.db.query.users.findFirst({
            where: eq(users.email, email.toLowerCase().trim())
        });
        if (existing) throw new ValidationError('Email already registered');

        const result = await provisionNewAgency(
            this.db,
            {
                agencyName,
                adminEmail: email,
                adminName: name,
                adminPassword: password,
                industry,
                teamSize,
                jwt: this.jwt,
            },
            this.log
        );

        // Optional / non-blocking background notification
        try {
            const provisioningJob: AgencyProvisioningPayload = {
                jobId: `${Date.now()}`,
                agencyId: result.agencyId,
                dbName: result.agency.domain,
                subdomain: result.agency.domain,
                adminEmail: result.user.email,
                adminPasswordHash: result.user.passwordHash,
                adminFirstName: name.split(' ')[0],
                adminLastName: name.split(' ').slice(1).join(' ') || name,
                userId: result.user.id,
                plan: result.agency.subscriptionPlan,
            };
            await agencyProvisioningQueue.add('setup-workspace', provisioningJob, {
                delay: 1000,
                priority: 10,
            });
        } catch (queueError) {
            this.log.warn({ agencyId: result.agencyId, error: queueError }, 'Background queue notification skipped');
        }

        this.log.info({ userId: result.user.id, agencyId: result.agencyId }, 'Agency signup completed');
        return {
            user: result.user,
            agency: result.agency,
            accessToken: result.accessToken!,
            refreshToken: result.refreshToken!,
        };
    }

    async register(input: RegisterInput) {
        const { email, password, name } = input;
        const normalizedEmail = email.toLowerCase();

        const existing = await this.db.query.users.findFirst({
            where: eq(users.email, normalizedEmail),
        });

        if (existing) {
            throw new ValidationError('Email already registered');
        }

        const passwordHash = await hashPassword(password);

        const result = await this.db.transaction(async (tx: any) => {
            const [user] = await tx
                .insert(users)
                .values({
                    email,
                    emailNormalized: normalizedEmail,
                    passwordHash,
                    status: 'active',
                })
                .returning({
                    id: users.id,
                    email: users.email,
                    status: users.status,
                });

            await tx.insert(profiles).values({
                userId: user.id,
                fullName: name,
            });

            return user;
        });

        const accessToken = this.jwt.sign({
            id: result.id,
            email: result.email,
            roles: [],
        });

        const refreshToken = this.jwt.sign(
            { id: result.id, type: 'refresh' },
            { expiresIn: '7d' }
        );

        this.log.info({ userId: result.id }, 'User registered');

        return { user: result, accessToken, refreshToken };
    }

    async login(input: LoginInput) {
        const { email, password, domain } = input;
        const normalizedEmail = email.toLowerCase();

        const user = await this.db.query.users.findFirst({
            where: eq(users.email, normalizedEmail),
        });

        if (!user || !user.passwordHash) {
            throw new UnauthorizedError('Invalid credentials');
        }

        const valid = await verifyPassword(password, user.passwordHash);
        if (!valid) {
            throw new UnauthorizedError('Invalid credentials');
        }

        const rolesResults = await this.db.query.userRoles.findMany({
            where: and(
                eq(userRoles.userId, user.id),
                eq(userRoles.isActive, true)
            ),
        });
        const roles = rolesResults.map((r: any) => r.role);

        // Super Admins are forbidden from agency login — they must use /sauth
        if (roles.includes('super_admin')) {
            throw new UnauthorizedError('Super Admins must use the System Login path.');
        }

        let agency: any;

        if (domain) {
            agency = await this.db.query.agencies.findFirst({
                where: and(
                    eq(agencies.domain, domain),
                    eq(agencies.isActive, true)
                ),
            });
            if (!agency) {
                throw new UnauthorizedError('Agency not found or inactive');
            }
            const hasAgencyAccess = rolesResults.some((r: any) => r.agencyId === agency?.id);
            if (!hasAgencyAccess) {
                throw new UnauthorizedError('You do not have access to this agency');
            }
        } else {
            const agencyRole = rolesResults.find((r: any) => r.agencyId);
            if (!agencyRole) {
                throw new UnauthorizedError('User does not belong to any agency');
            }
            agency = await this.db.query.agencies.findFirst({
                where: and(
                    eq(agencies.id, agencyRole.agencyId),
                    eq(agencies.isActive, true)
                ),
            });
            if (!agency) {
                throw new UnauthorizedError('Agency not found or inactive');
            }
        }

        await this.db
            .update(users)
            .set({ lastSignInAt: new Date() })
            .where(eq(users.id, user.id));

        const accessToken = this.jwt.sign({
            id: user.id,
            email: user.email,
            roles,
            agencyId: agency.id,
        });

        const refreshToken = this.jwt.sign(
            { id: user.id, type: 'refresh' },
            { expiresIn: '7d' }
        );

        this.log.info({ userId: user.id, agencyId: agency.id }, 'User logged in to agency');

        const transformedAgency = transformAgencyRow(agency);
        return {
            success: true,
            token: accessToken,
            accessToken,
            refreshToken,
            user: {
                id: user.id,
                email: user.email,
                roles,
                agency: transformedAgency,
            },
        };
    }

    async refreshToken(token: string) {
        try {
            const decoded = this.jwt.verify(token) as { id: string; type: string };

            if (decoded.type !== 'refresh') {
                throw new UnauthorizedError('Invalid token type');
            }

            const user = await this.db.query.users.findFirst({
                where: eq(users.id, decoded.id),
            });

            if (!user) {
                throw new UnauthorizedError('User not found');
            }

            const rolesResults = await this.db.query.userRoles.findMany({
                where: eq(userRoles.userId, user.id),
            });
            const roles = rolesResults.map((r: any) => r.role);

            const accessToken = this.jwt.sign({
                id: user.id,
                email: user.email,
                status: user.status,
                roles,
            });

            return { accessToken };
        } catch {
            throw new UnauthorizedError('Invalid refresh token');
        }
    }

    async loginSauth(input: LoginInput) {
        const { email, password } = input;

        const user = await this.db.query.users.findFirst({
            where: eq(users.email, email),
        });

        if (!user || !user.passwordHash) {
            throw new UnauthorizedError('Invalid credentials');
        }

        const valid = await verifyPassword(password, user.passwordHash);
        if (!valid) {
            throw new UnauthorizedError('Invalid credentials');
        }

        const adminRole = await this.db.query.userRoles.findFirst({
            where: and(
                eq(userRoles.userId, user.id),
                eq(userRoles.role, 'super_admin'),
                eq(userRoles.isActive, true),
                sql`agency_id IS NULL`
            ),
        });

        if (!adminRole) {
            throw new UnauthorizedError('Access denied: Unauthorized System Entry');
        }

        await this.db
            .update(users)
            .set({ lastSignInAt: new Date() })
            .where(eq(users.id, user.id));

        // Strictly platform-only token — no agencyId in payload
        const accessToken = this.jwt.sign({
            id: user.id,
            email: user.email,
            roles: ['super_admin'],
            context: 'platform'
        });

        return {
            success: true,
            token: accessToken,
            user: {
                id: user.id,
                email: user.email,
                roles: ['super_admin'],
            },
        };
    }

    async getCurrentUser(userId: string) {
        const user = await this.db.query.users.findFirst({
            where: eq(users.id, userId),
        });

        if (!user) {
            throw new UnauthorizedError('User not found');
        }

        const profile = await this.db.query.profiles.findFirst({
            where: eq(profiles.userId, userId),
        });

        const rolesResults = await this.db.query.userRoles.findMany({
            where: eq(userRoles.userId, userId),
        });
        const roles = rolesResults.map((r: any) => r.role);

        let agency = null;
        if (profile?.agencyId) {
            agency = await this.db.query.agencies.findFirst({
                where: eq(agencies.id, profile.agencyId),
            });
        }

        return {
            ...user,
            profile: profile || undefined,
            roles,
            agency: agency ? transformAgencyRow(agency) : undefined,
        };
    }
}
