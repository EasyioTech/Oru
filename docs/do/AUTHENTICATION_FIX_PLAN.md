Enterprise ERP System Authentication and Permissions Security Fix Plan

This document provides a comprehensive, security-hardened implementation plan to fix all authentication and authorization vulnerabilities in the BuildFlow multi-tenant ERP system. This plan is specifically designed for enterprise-grade ERP systems with strict security, compliance, and audit requirements.

Implementation Philosophy

This fix plan follows defense-in-depth security principles:
1. Multiple layers of security controls
2. Fail-secure defaults (deny access if uncertain)
3. Principle of least privilege
4. Complete auditability
5. Compliance-first design
6. Zero-trust architecture

Each fix must be implemented with:
- Comprehensive testing
- Security review
- Compliance validation
- Performance impact assessment
- Rollback plan

Phase 1: Establish Secure User Context Management (CRITICAL FOUNDATION)

This phase creates a tamper-proof, centralized system for determining user type and context. This is the foundation for all other security controls.

Step 1.1: Create Immutable User Context Type System

Create src/types/authTypes.ts with strict TypeScript types:

Define UserContext interface with readonly properties:
- userId: string (immutable)
- email: string (immutable)
- userType: 'SYSTEM_SUPER_ADMIN' | 'AGENCY_ADMIN' | 'AGENCY_USER' (computed, immutable)
- agencyId: string | null (immutable)
- agencyDatabase: string | null (immutable)
- roles: readonly AppRole[] (immutable array)
- isSystemSuperAdmin: boolean (computed property, not stored)
- sessionId: string (unique per session)
- issuedAt: number (timestamp)
- expiresAt: number (timestamp)

Key Security Requirements:
- All properties must be readonly to prevent tampering
- userType must be computed from roles and agencyDatabase, never stored
- isSystemSuperAdmin must be computed as: has super_admin role AND agencyDatabase is null
- No mutable state in UserContext object

Step 1.2: Create Centralized User Context Factory with Security Validation

Create src/server/utils/secureUserContext.js with a single function createSecureUserContext that:

1. Takes decoded JWT token payload
2. Validates token structure (all required fields present, correct types)
3. Validates agencyDatabase format (if present, must match pattern: ^agency_[a-z0-9_]+$)
4. Validates agencyId format (if present, must be valid UUID)
5. Queries database to verify:
   - User still exists and is active
   - Agency still exists and is active (if agencyDatabase present)
   - User's roles haven't changed since token was issued
   - Agency database name matches agency record
6. Returns UserContext object or throws SecurityError

Security Requirements:
- All database queries must use parameterized queries to prevent SQL injection
- Cache user context for request duration (using WeakMap keyed by token) to prevent multiple DB queries
- If any validation fails, throw SecurityError and log security event
- Never trust token payload alone - always verify against database

Step 1.3: Implement Token Revocation Check in User Context Creation

Modify createSecureUserContext to:

1. Check if token is in revocation list (Redis cache or database)
2. If revoked, throw TokenRevokedError
3. Check token issue time against user's last_password_change or last_role_change
4. If token was issued before password/role change, throw TokenInvalidatedError

This ensures that:
- Revoked tokens are immediately invalid
- Password changes invalidate all existing tokens
- Role changes invalidate all existing tokens

Step 1.4: Update Backend Middleware to Use Secure Context

Modify authMiddleware.js authenticate function to:

1. Decode token using existing decodeToken function
2. Call createSecureUserContext with decoded payload
3. Attach UserContext to req.secureUserContext (not req.user to avoid confusion)
4. Log authentication event to audit system with:
   - User ID
   - Agency ID (if applicable)
   - IP address
   - User agent
   - Timestamp
   - Success/failure status

Security Requirements:
- If createSecureUserContext throws, return 401 with generic error message (don't leak information)
- Log security events even on failure (for intrusion detection)
- Rate limit authentication attempts per IP address

Step 1.5: Update Frontend to Use Secure Context API

Create new API endpoint GET /api/auth/context that:

1. Validates token from Authorization header
2. Calls createSecureUserContext
3. Returns UserContext object (without sensitive fields)

Modify useAuth.tsx to:

1. Call /api/auth/context on mount and token refresh
2. Store UserContext in React state (not localStorage except token itself)
3. Never store agencyDatabase or agencyId in localStorage
4. Always decode from token or fetch from API

This eliminates the localStorage/localStorage mismatch vulnerability.

Phase 2: Implement Comprehensive Token Security (CRITICAL)

This phase implements enterprise-grade token management with revocation, rotation, and security hardening.

Step 2.1: Implement Token Revocation System

Create database table token_revocations:

CREATE TABLE token_revocations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token_jti UUID NOT NULL, -- JWT ID claim
  user_id UUID NOT NULL REFERENCES users(id),
  revoked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  revoked_by UUID REFERENCES users(id),
  revocation_reason TEXT, -- 'logout', 'password_change', 'role_change', 'security_incident'
  expires_at TIMESTAMPTZ NOT NULL, -- When token would have expired
  INDEX idx_token_revocations_jti (token_jti),
  INDEX idx_token_revocations_user_id (user_id),
  INDEX idx_token_revocations_expires_at (expires_at)
);

Create cleanup job that deletes expired revocations daily.

Modify token generation to include jti (JWT ID) claim - unique identifier for each token.

Modify authMiddleware.js to check revocation list before accepting token.

Step 2.2: Implement Refresh Token System

Create database table refresh_tokens:

CREATE TABLE refresh_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  token_hash TEXT NOT NULL, -- SHA-256 hash of token
  device_fingerprint TEXT, -- Browser fingerprint
  ip_address INET,
  user_agent TEXT,
  issued_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL,
  last_used_at TIMESTAMPTZ,
  is_revoked BOOLEAN NOT NULL DEFAULT false,
  revoked_at TIMESTAMPTZ,
  revoked_reason TEXT,
  UNIQUE(token_hash),
  INDEX idx_refresh_tokens_user_id (user_id),
  INDEX idx_refresh_tokens_expires_at (expires_at)
);

Modify login endpoint to:
1. Generate short-lived access token (15 minutes)
2. Generate long-lived refresh token (7 days)
3. Store refresh token hash in database
4. Return both tokens to client

Create POST /api/auth/refresh endpoint that:
1. Validates refresh token
2. Checks if revoked
3. Checks if expired
4. Updates last_used_at
5. Generates new access token
6. Optionally rotates refresh token (security best practice)

Step 2.3: Implement Token Rotation and Reuse Detection

Modify refresh endpoint to:
1. Detect if refresh token is being reused (check last_used_at)
2. If reused, revoke all refresh tokens for that user (possible token theft)
3. Log security incident
4. Require user to re-authenticate

This detects token theft even if the attacker uses the token before the legitimate user.

Step 2.4: Harden Token Generation

Modify authService.js generateToken to:

1. Use strong, randomly generated jti for each token
2. Set short expiration (15 minutes for access tokens)
3. Include minimal necessary claims (don't store sensitive data)
4. Use RS256 algorithm instead of HS256 (better for distributed systems)
5. Sign with private key, verify with public key
6. Include token version for future migrations

Security Requirements:
- JWT_SECRET or private key must be at least 256 bits
- Keys must be stored in secure key management system (not in code or environment variables in production)
- Keys must be rotated regularly (every 90 days)
- Old keys must be retained for token validation during rotation period

Step 2.5: Implement Token Security Headers

Add security headers to all API responses:
- Strict-Transport-Security: max-age=31536000; includeSubDomains
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- Content-Security-Policy: default-src 'self'

This prevents token theft via XSS, clickjacking, and other attacks.

Phase 3: Fix Multi-Tenancy Data Isolation (CRITICAL)

This phase ensures complete, verifiable data isolation between agencies with defense-in-depth controls.

Step 3.1: Implement Database-Level Agency Context Validation

Create database function validate_agency_context:

CREATE OR REPLACE FUNCTION validate_agency_context(
  p_user_id UUID,
  p_agency_database TEXT,
  p_agency_id UUID
) RETURNS BOOLEAN AS $$
DECLARE
  v_user_agency_database TEXT;
  v_user_agency_id UUID;
BEGIN
  -- Get user's agency from main database
  SELECT a.database_name, a.id INTO v_user_agency_database, v_user_agency_id
  FROM agencies a
  JOIN profiles p ON p.agency_id = a.id
  WHERE p.user_id = p_user_id
    AND a.is_active = true
    AND p.is_active = true;
  
  -- For super admin, agency should be null
  IF v_user_agency_database IS NULL THEN
    RETURN p_agency_database IS NULL AND p_agency_id IS NULL;
  END IF;
  
  -- Verify agency matches
  RETURN v_user_agency_database = p_agency_database 
    AND v_user_agency_id = p_agency_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

Call this function in every route that accesses agency data to verify context.

Step 3.2: Implement Connection Pool Security

Modify poolManager.js to:

1. Validate agency database name format before creating pool
2. Verify agency exists and is active in main database
3. Use connection string with read-only user for queries (when possible)
4. Implement connection pool per agency with max connections limit
5. Monitor pool usage and alert on anomalies
6. Implement pool cleanup when agency is deactivated

Security Requirements:
- Never create pool for non-existent agency
- Never allow connection to agency database without valid agency record
- Log all pool creation and connection events
- Implement connection timeout to prevent pool exhaustion attacks

Step 3.3: Implement Query-Level Agency Filtering

Create database helper function ensure_agency_filter that:

1. Takes query string and parameters
2. Automatically adds agency_id filter if table has agency_id column
3. Throws error if agency_id filter cannot be added and table requires it
4. Validates that agency_id matches user's agency

Use this helper in all database queries to ensure agency filtering.

Step 3.4: Implement Row-Level Security Policies

For each agency database, create RLS policies:

-- Example for projects table
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY agency_isolation_policy ON projects
  FOR ALL
  USING (agency_id = current_setting('app.current_agency_id', true)::UUID)
  WITH CHECK (agency_id = current_setting('app.current_agency_id', true)::UUID);

Set app.current_agency_id session variable in every connection:
- In middleware, before executing queries
- Use SECURITY DEFINER function to set safely
- Verify value matches user's agency

This provides defense-in-depth: even if application code has bugs, database enforces isolation.

Step 3.5: Implement Agency Context Validation Middleware

Create requireValidAgencyContext middleware that:

1. Extracts agencyDatabase from token
2. Extracts agencyDatabase from X-Agency-Database header (if present)
3. Verifies they match (if both present)
4. Queries main database to verify:
   - Agency exists
   - Agency is active
   - User belongs to this agency (or is super admin)
5. Sets req.validatedAgencyContext for downstream use
6. Logs validation event

Use this middleware on all routes that access agency data.

Phase 4: Fix Role-Based Access Control with ERP-Specific Security (CRITICAL)

This phase implements secure, consistent role checking with ERP-specific requirements.

Step 4.1: Create Single Source of Truth for Role Hierarchy

Create src/shared/roleHierarchy.json (JSON for both frontend and backend):

{
  "super_admin": { "level": 1, "is_system_role": true, "requires_agency": false },
  "ceo": { "level": 2, "is_system_role": true, "requires_agency": false },
  "cto": { "level": 3, "is_system_role": true, "requires_agency": false },
  "cfo": { "level": 4, "is_system_role": true, "requires_agency": false },
  "coo": { "level": 5, "is_system_role": true, "requires_agency": false },
  "admin": { "level": 6, "is_system_role": false, "requires_agency": true },
  ...
}

Key Security Properties:
- is_system_role: true means role exists in main database, false means agency database
- requires_agency: true means user must have agency context, false means no agency needed
- level: used for hierarchy comparison

Step 4.2: Implement Secure Role Checking Function

Create src/server/utils/secureRoleCheck.js with function hasSecureRole that:

1. Takes UserContext and required role
2. Determines if required role is system role or agency role
3. Checks appropriate database (main for system roles, agency for agency roles)
4. Verifies user has role with correct agency_id (NULL for system roles, agency ID for agency roles)
5. Checks role hierarchy if allowHigherRoles is true
6. Returns boolean and logs decision

Security Requirements:
- Never allow agency admin to access system super admin routes
- Always verify agency context for agency roles
- Always verify no agency context for system super admin role
- Log all role checks for audit

Step 4.3: Fix Super Admin vs Agency Admin Logic

Modify requireSuperAdmin middleware to:

1. Check UserContext.isSystemSuperAdmin (computed property)
2. Verify user has super_admin role in main database with agency_id IS NULL
3. Verify user does NOT have agencyDatabase
4. If user is agency admin trying to access super admin route, return 403 with clear error
5. Log access attempt (success or failure)

Create separate requireAgencyAdmin middleware for agency admin routes.

Step 4.4: Implement Role-Based Route Protection

Create requireSecureRole middleware factory that:

1. Takes required roles array
2. Takes allowHigherRoles boolean
3. Validates UserContext
4. Calls hasSecureRole for each required role
5. Returns 403 if no match
6. Logs access decision

Use this instead of manual role checks in routes.

Step 4.5: Implement Permission-Based Access Control

For fine-grained permissions (beyond roles), create permissions system:

1. Database table: permissions (action, resource, required_role)
2. Database table: user_permissions (user_id, permission_id, granted_by, granted_at)
3. Function: hasPermission(user_id, action, resource)
4. Middleware: requirePermission(action, resource)

This allows field-level and operation-level permissions beyond role-based access.

Phase 5: Implement Comprehensive Audit Trail System (CRITICAL FOR COMPLIANCE)

This phase implements tamper-proof, comprehensive audit logging for compliance and security monitoring.

Step 5.1: Create Secure Audit Log Storage

Create separate audit database or write-only audit log storage:

Option 1: Separate PostgreSQL database for audit logs (recommended)
Option 2: Append-only file system with integrity verification
Option 3: External audit log service (AWS CloudTrail, etc.)

Security Requirements:
- Write-only access for application (cannot modify or delete)
- Read-only access for auditors and security team
- Integrity verification (hash chain or digital signatures)
- Encrypted at rest
- Replicated for disaster recovery

Step 5.2: Implement Comprehensive Audit Logging

Create audit logging service that logs:

Authentication Events:
- Login attempts (success and failure)
- Logout events
- Token refresh
- Password changes
- Account lockouts
- Failed authentication attempts

Authorization Events:
- Role changes
- Permission grants/revocations
- Access denied events
- Privilege escalation attempts

Data Access Events:
- Sensitive data reads (financial records, employee data)
- Data modifications (all CRUD operations on sensitive tables)
- Data exports
- Report generation

System Events:
- Agency creation/deletion
- Configuration changes
- Super admin actions
- Database schema changes

Each log entry must include:
- Timestamp (UTC, high precision)
- User ID
- User email
- Agency ID (if applicable)
- IP address
- User agent
- Action performed
- Resource affected
- Old values (for updates)
- New values (for updates)
- Success/failure status
- Error message (if failure)
- Request ID (for correlation)

Step 5.3: Implement Audit Log Integrity Protection

Implement hash chain for audit logs:

1. Each log entry includes hash of previous entry
2. Any modification breaks the chain
3. Periodic verification of chain integrity
4. Alert on chain breakage

Alternatively, use digital signatures:
1. Sign each log entry with private key
2. Verify signatures periodically
3. Alert on invalid signatures

Step 5.4: Implement Audit Log Retention and Archival

Create retention policy:
- Active logs: 90 days in primary storage
- Archived logs: 7 years in cold storage
- Compliance logs: Permanent retention

Implement archival process:
1. Daily job moves logs older than 90 days to archive
2. Compress and encrypt archived logs
3. Store in separate system (S3, Glacier, etc.)
4. Maintain index for searching archived logs

Step 5.5: Implement Real-Time Security Monitoring

Create security monitoring system that:

1. Analyzes audit logs in real-time
2. Detects suspicious patterns:
   - Multiple failed login attempts
   - Unusual access patterns
   - Privilege escalation attempts
   - Cross-agency access attempts
   - Unusual data access volumes
   - Unusual times/locations
3. Sends alerts to security team
4. Automatically blocks suspicious activity

Phase 6: Implement Session Management Security (HIGH PRIORITY)

This phase implements secure session management with timeouts, device tracking, and concurrent session limits.

Step 6.1: Implement Session Timeout

Create session tracking system:

1. Track last activity timestamp for each session
2. Implement idle timeout (15 minutes of inactivity)
3. Implement absolute timeout (8 hours maximum session duration)
4. Refresh timeout on each request
5. Automatically revoke expired sessions

Modify frontend to:
1. Track user activity (mouse movement, keyboard input)
2. Show warning before timeout (2 minutes before)
3. Automatically refresh token if user is active
4. Redirect to login on timeout

Step 6.2: Implement Concurrent Session Management

Create session management system:

1. Track all active sessions per user
2. Limit concurrent sessions (e.g., 5 per user)
3. When limit exceeded, revoke oldest session
4. Allow users to view and revoke their own sessions
5. Allow admins to revoke any session

Store sessions in database:
- session_id
- user_id
- device_fingerprint
- ip_address
- user_agent
- created_at
- last_activity_at
- expires_at
- is_active

Step 6.3: Implement Device and Location Tracking

Track device information:
- Device fingerprint (browser, OS, screen resolution, etc.)
- IP address and geolocation
- User agent
- Login history per device

Implement security controls:
1. Require additional authentication for new devices
2. Alert on login from new location
3. Implement geofencing (optional, per agency policy)
4. Allow IP whitelisting for sensitive roles

Step 6.4: Implement Session Security Headers

Add security headers to prevent session hijacking:
- Set-Cookie: HttpOnly, Secure, SameSite=Strict
- X-Frame-Options: DENY (prevent clickjacking)
- Content-Security-Policy: strict policy

Phase 7: Implement Password Security and Account Management (HIGH PRIORITY)

This phase implements enterprise-grade password security with policies, hashing, and account protection.

Step 7.1: Standardize Password Hashing

Migrate all passwords to bcrypt with consistent configuration:
- Cost factor: 12 (adjust based on performance requirements)
- Salt: automatically generated by bcrypt
- No custom salt logic

Create migration script to:
1. Identify passwords using pgcrypto
2. Re-hash with bcrypt on next login
3. Update password_hash column
4. Mark migration complete

Step 7.2: Implement Password Policy Enforcement

Create password policy system:

Database table: password_policies
- min_length (default: 12)
- require_uppercase (default: true)
- require_lowercase (default: true)
- require_numbers (default: true)
- require_special_chars (default: true)
- prevent_common_passwords (default: true)
- prevent_user_info (default: true)
- max_age_days (default: 90)
- history_count (default: 5)

Enforce policy:
1. On password creation/change
2. Check against common passwords list
3. Check against user information (name, email, etc.)
4. Check password history
5. Reject weak passwords with specific error messages

Step 7.3: Implement Account Lockout

Enhance existing lockout system:

1. Track failed login attempts per user and IP
2. Lock account after N failed attempts (e.g., 5)
3. Lock duration increases with each lockout (exponential backoff)
4. Send email notification on lockout
5. Allow admin to unlock accounts
6. Implement CAPTCHA after 3 failed attempts

Store lockout information:
- user_id or email
- ip_address
- failed_attempts
- locked_until
- lockout_count

Step 7.4: Implement Secure Password Reset

Create secure password reset flow:

1. User requests reset via email
2. Generate cryptographically secure reset token (32 random bytes)
3. Hash token with SHA-256 before storing
4. Store reset token with:
   - user_id
   - token_hash
   - expires_at (15 minutes)
   - used (boolean)
   - ip_address (of request)
5. Send reset link via email (not in response)
6. Validate token on reset:
   - Check expiration
   - Check if already used
   - Verify user still exists and is active
7. Require new password to meet policy
8. Invalidate all existing sessions on password change
9. Log password reset events

Security Requirements:
- Reset tokens single-use only
- Short expiration (15 minutes)
- Rate limit reset requests (3 per hour per email)
- Don't reveal if email exists (prevent enumeration)

Phase 8: Implement API Security Hardening (HIGH PRIORITY)

This phase implements comprehensive API security with input validation, rate limiting, and attack prevention.

Step 8.1: Implement Comprehensive Input Validation

Use express-validator for all inputs:

1. Email validation: strict format, domain validation
2. Password validation: policy enforcement
3. UUID validation: proper format
4. Agency database name: format validation (^agency_[a-z0-9_]+$)
5. SQL injection prevention: parameterized queries only
6. XSS prevention: sanitize all user input
7. NoSQL injection prevention: validate object structures

Create validation middleware factory for common patterns.

Step 8.2: Implement Rate Limiting

Implement rate limiting on all endpoints:

Authentication endpoints:
- Login: 5 attempts per 15 minutes per IP
- Password reset: 3 attempts per hour per email
- Token refresh: 10 per minute per token

Sensitive operations:
- Role changes: 10 per hour per user
- Permission changes: 20 per hour per user
- Financial transactions: per business rules
- Data exports: 5 per day per user

Use Redis for distributed rate limiting.

Step 8.3: Implement API Request Validation

Validate all API requests:

1. Content-Type header (must match expected)
2. Request size limits (prevent DoS)
3. Required headers present
4. Agency context matches token
5. User still active
6. Agency still active

Reject invalid requests early with clear error messages.

Step 8.4: Implement CORS Security

Configure CORS strictly:

1. Whitelist specific origins (not *)
2. Allow only necessary methods
3. Allow only necessary headers
4. Don't send credentials to untrusted origins
5. Implement preflight request caching

Step 8.5: Implement Request ID Tracking

Add request ID to all requests:

1. Generate unique ID per request
2. Include in response headers
3. Log with all audit events
4. Use for correlation in logs
5. Return to client for support requests

Phase 9: Implement Database Security Hardening (CRITICAL)

This phase implements database-level security controls as defense-in-depth.

Step 9.1: Implement Database User Roles

Create separate database users:

1. Application user: read/write access to application tables
2. Read-only user: read access for reports (separate connection pool)
3. Migration user: schema modification access (used only for migrations)
4. Audit user: write-only access to audit tables

Grant minimal necessary permissions to each user.

Step 9.2: Implement Row-Level Security Policies

As mentioned in Phase 3, implement RLS on all tables with agency_id:

1. Enable RLS on all multi-tenant tables
2. Create policies for SELECT, INSERT, UPDATE, DELETE
3. Use session variables for agency context
4. Test policies thoroughly
5. Monitor policy performance

Step 9.3: Implement Database Encryption

Encrypt sensitive data at rest:

1. Enable PostgreSQL encryption at rest (TDE)
2. Encrypt sensitive columns (SSN, credit cards, etc.) with application-level encryption
3. Use strong encryption algorithms (AES-256)
4. Secure key management (HSM or key management service)
5. Rotate encryption keys regularly

Step 9.4: Implement Database Connection Security

Secure database connections:

1. Use SSL/TLS for all connections
2. Verify server certificates
3. Use strong cipher suites
4. Implement connection timeout
5. Limit connection pool size
6. Monitor connection usage

Step 9.5: Implement Database Audit Logging

Enable PostgreSQL audit logging:

1. Log all DDL statements
2. Log all DML statements on sensitive tables
3. Log failed authentication attempts
4. Log privilege escalations
5. Forward logs to centralized logging system

Phase 10: Implement Security Monitoring and Alerting (HIGH PRIORITY)

This phase implements real-time security monitoring and automated response.

Step 10.1: Implement Security Event Detection

Create security event detection system that monitors:

1. Failed authentication attempts (brute force detection)
2. Unusual access patterns (time, location, volume)
3. Privilege escalation attempts
4. Cross-agency access attempts
5. Unusual data access (sensitive tables)
6. Token anomalies (unusual refresh patterns)
7. Session anomalies (multiple concurrent sessions)

Step 10.2: Implement Automated Response

Create automated response system:

1. Block IP addresses after N failed attempts
2. Lock accounts after suspicious activity
3. Require additional authentication for suspicious logins
4. Alert security team on critical events
5. Generate security incident reports

Step 10.3: Implement Security Dashboard

Create security dashboard for admins:

1. Real-time security events
2. Failed login attempts
3. Active sessions
4. Token usage statistics
5. Audit log summaries
6. Security alerts

Step 10.4: Implement Compliance Reporting

Create compliance reports:

1. Access review reports (who has access to what)
2. Audit trail reports (all changes to sensitive data)
3. Authentication reports (login history, failed attempts)
4. Permission change reports
5. Export for auditors

Implementation Timeline and Priorities

Week 1 (CRITICAL - Immediate):
- Phase 1: Secure User Context (Steps 1.1-1.5)
- Phase 2: Token Revocation (Step 2.1)
- Phase 3: Agency Context Validation (Steps 3.1, 3.5)

Week 2 (CRITICAL):
- Phase 2: Complete token security (Steps 2.2-2.5)
- Phase 3: Complete multi-tenancy fixes (Steps 3.2-3.4)
- Phase 4: Role-based access control fixes (Steps 4.1-4.3)

Week 3 (HIGH PRIORITY):
- Phase 4: Complete RBAC (Steps 4.4-4.5)
- Phase 5: Audit trail system (Steps 5.1-5.3)
- Phase 6: Session management (Steps 6.1-6.2)

Week 4 (HIGH PRIORITY):
- Phase 5: Complete audit system (Steps 5.4-5.5)
- Phase 6: Complete session management (Steps 6.3-6.4)
- Phase 7: Password security (Steps 7.1-7.2)

Week 5 (MEDIUM PRIORITY):
- Phase 7: Complete password security (Steps 7.3-7.4)
- Phase 8: API security (Steps 8.1-8.3)
- Phase 9: Database security (Steps 9.1-9.2)

Week 6 (MEDIUM PRIORITY):
- Phase 8: Complete API security (Steps 8.4-8.5)
- Phase 9: Complete database security (Steps 9.3-9.5)
- Phase 10: Security monitoring (Steps 10.1-10.2)

Week 7 (ONGOING):
- Phase 10: Complete monitoring (Steps 10.3-10.4)
- Comprehensive testing
- Security review
- Performance optimization
- Documentation

Testing Requirements

Each phase must include:

1. Unit tests for all new functions
2. Integration tests for API endpoints
3. Security tests (penetration testing)
4. Performance tests (load testing)
5. Compliance validation tests
6. Regression tests for existing functionality

Security Review Checklist

Before deploying each phase:

1. Code review by security team
2. Threat modeling review
3. Compliance validation
4. Performance impact assessment
5. Rollback plan documented
6. Monitoring and alerting configured
7. Documentation updated

Success Criteria

The implementation is successful when:

1. All critical vulnerabilities are fixed
2. All security tests pass
3. Compliance requirements are met
4. Performance is acceptable (< 100ms overhead)
5. Audit trail is complete and tamper-proof
6. No regression in existing functionality
7. Security monitoring is operational
8. Documentation is complete

This comprehensive fix plan addresses all identified vulnerabilities with enterprise-grade, compliance-focused solutions specifically designed for multi-tenant ERP systems.
