import { FastifyInstance } from 'fastify';
import { eq } from 'drizzle-orm';
import { users, profiles, userRoles } from '../../infrastructure/database/schema.js';
import { and } from 'drizzle-orm';
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

        // Fetch user roles
        const rolesResults = await this.fastify.db.query.userRoles.findMany({
            where: eq(userRoles.userId, user.id),
        });
        const roles = rolesResults.map(r => r.role);

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
        });

        const refreshToken = this.fastify.jwt.sign(
            { id: user.id, type: 'refresh' },
            { expiresIn: '7d' }
        );

        this.fastify.log.info({ userId: user.id }, 'User logged in');

        return {
            user: {
                id: user.id,
                email: user.email,
                roles: roles,
            },
            accessToken,
            refreshToken,
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
            const roles = rolesResults.map(r => r.role);

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
                eq(userRoles.isActive, true)
            ),
        });

        if (!adminRole) {
            throw new UnauthorizedError('Access denied: Super Admin only');
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
            roles: ['super_admin'],
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
}
