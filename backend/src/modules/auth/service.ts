import { FastifyInstance } from 'fastify';
import { eq, sql } from 'drizzle-orm';
import { users, profiles, userRoles, agencies } from '../../infrastructure/database/schema.js';
import { and, desc } from 'drizzle-orm';
import { hashPassword, verifyPassword } from '../../utils/password.js';
import { UnauthorizedError, ValidationError } from '../../utils/errors.js';
import type { RegisterInput, LoginInput } from './schemas.js';

export class AuthService {
    constructor(private fastify: FastifyInstance) { }

    async register(input: RegisterInput) {
        const { email, password, name } = input;
        const normalizedEmail = email.toLowerCase();

        // Check if user exists
        const existing = await this.fastify.db.query.users.findFirst({
            where: eq(users.email, email),
        });

        if (existing) {
            throw new ValidationError('Email already registered');
        }

        // Hash password
        const passwordHash = await hashPassword(password);

        // Transaction to create user and profile
        const result = await this.fastify.db.transaction(async (tx) => {
            // Create user
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

            // Create profile
            await tx.insert(profiles).values({
                userId: user.id,
                fullName: name,
            });

            return user;
        });

        // Generate tokens
        const accessToken = this.fastify.jwt.sign({
            id: result.id,
            email: result.email,
            roles: [], // Freshly registered users might have no roles yet in main DB
        });

        const refreshToken = this.fastify.jwt.sign(
            { id: result.id, type: 'refresh' },
            { expiresIn: '7d' }
        );

        this.fastify.log.info({ userId: result.id }, 'User registered');

        return {
            user: result,
            accessToken,
            refreshToken,
        };
    }

    async login(input: LoginInput) {
        const { email, password, domain } = input;

        // Find user
        const user = await this.fastify.db.query.users.findFirst({
            where: eq(users.email, email),
        });

        if (!user || !user.passwordHash) {
            throw new UnauthorizedError('Invalid credentials');
        }

        // Verify password
        const valid = await verifyPassword(password, user.passwordHash);
        if (!valid) {
            throw new UnauthorizedError('Invalid credentials');
        }

        // Fetch user roles
        const rolesResults = await this.fastify.db.query.userRoles.findMany({
            where: and(
                eq(userRoles.userId, user.id),
                eq(userRoles.isActive, true)
            ),
        });
        const roles = rolesResults.map((r: any) => r.role);

        // Security Policy: Platform Super Admins are FORBIDDEN from using the Agency login.
        // They must use the /sauth endpoint to access the System Panel.
        if (roles.includes('super_admin')) {
            throw new UnauthorizedError('Super Admins must use the System Login path.');
        }

        if (!domain) {
            throw new ValidationError('Agency domain is required');
        }

        // Fetch user agency context
        let agency = await this.fastify.db.query.agencies.findFirst({
            where: and(
                eq(agencies.domain, domain),
                eq(agencies.isActive, true)
            ),
        });

        if (!agency) {
            throw new UnauthorizedError('Agency not found or inactive');
        }

        // Check if user has a role ENROLLED for this specific agency
        const hasAgencyAccess = rolesResults.some((r: any) => r.agencyId === agency?.id);
        if (!hasAgencyAccess) {
            throw new UnauthorizedError('You do not have access to this agency');
        }

        // Update last login
        await this.fastify.db
            .update(users)
            .set({ lastSignInAt: new Date() })
            .where(eq(users.id, user.id));

        // Generate tokens
        const accessToken = this.fastify.jwt.sign({
            id: user.id,
            email: user.email,
            roles: roles,
            agencyId: agency.id,
            agencyDatabase: agency.databaseName,
        });

        const refreshToken = this.fastify.jwt.sign(
            { id: user.id, type: 'refresh' },
            { expiresIn: '7d' }
        );

        this.fastify.log.info({ userId: user.id, agencyId: agency.id }, 'User logged in to agency');

        return {
            success: true,
            token: accessToken,
            accessToken,
            refreshToken,
            user: {
                id: user.id,
                email: user.email,
                roles: roles,
                agency: {
                    id: agency.id,
                    name: agency.name,
                    domain: agency.domain,
                    databaseName: agency.databaseName,
                    status: agency.status,
                },
            },
        };
    }

    async refreshToken(token: string) {
        try {
            const decoded = this.fastify.jwt.verify<{ id: string; type: string }>(token);

            if (decoded.type !== 'refresh') {
                throw new UnauthorizedError('Invalid token type');
            }

            const user = await this.fastify.db.query.users.findFirst({
                where: eq(users.id, decoded.id),
            });

            if (!user) {
                throw new UnauthorizedError('User not found');
            }

            // Fetch roles for refresh
            const rolesResults = await this.fastify.db.query.userRoles.findMany({
                where: eq(userRoles.userId, user.id),
            });
            const roles = rolesResults.map((r: any) => r.role);

            const accessToken = this.fastify.jwt.sign({
                id: user.id,
                email: user.email,
                status: user.status,
                roles: roles,
            });

            return { accessToken };
        } catch (error) {
            throw new UnauthorizedError('Invalid refresh token');
        }
    }

    // 2FA methods temporarily removed or stubbed as schema does not support them yet
    async enable2FA(userId: string) {
        throw new Error('2FA not implemented yet');
    }

    async verify2FA(userId: string, totpCode: string) {
        throw new Error('2FA not implemented yet');
    }

    async loginSauth(input: LoginInput) {
        const { email, password } = input;

        // Find user
        const user = await this.fastify.db.query.users.findFirst({
            where: eq(users.email, email),
        });

        if (!user || !user.passwordHash) {
            throw new UnauthorizedError('Invalid credentials');
        }

        // Verify password
        const valid = await verifyPassword(password, user.passwordHash);
        if (!valid) {
            throw new UnauthorizedError('Invalid credentials');
        }

        // Check if user is super admin
        const adminRole = await this.fastify.db.query.userRoles.findFirst({
            where: and(
                eq(userRoles.userId, user.id),
                eq(userRoles.role, 'super_admin'),
                eq(userRoles.isActive, true),
                sql`agency_id IS NULL` // Platform admin role has no agency id
            ),
        });

        if (!adminRole) {
            throw new UnauthorizedError('Access denied: Unauthorized System Entry');
        }

        // Update last login
        await this.fastify.db
            .update(users)
            .set({ lastSignInAt: new Date() })
            .where(eq(users.id, user.id));

        // Generate tokens - STRICTLY PLATFORM ONLY
        const accessToken = this.fastify.jwt.sign({
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
        const user = await this.fastify.db.query.users.findFirst({
            where: eq(users.id, userId),
        });

        if (!user) {
            throw new UnauthorizedError('User not found');
        }

        const profile = await this.fastify.db.query.profiles.findFirst({
            where: eq(profiles.userId, userId),
        });

        const rolesResults = await this.fastify.db.query.userRoles.findMany({
            where: eq(userRoles.userId, userId),
        });
        const roles = rolesResults.map((r: any) => r.role);

        // Find agency context if any
        let agency = null;
        if (profile?.agencyId) {
            agency = await this.fastify.db.query.agencies.findFirst({
                where: eq(agencies.id, profile.agencyId),
            });
        }

        return {
            ...user,
            profile: profile || undefined,
            roles: roles,
            agency: agency ? {
                id: agency.id,
                name: agency.name,
                domain: agency.domain,
                databaseName: agency.databaseName,
                status: agency.status,
            } : undefined,
        };
    }
}
