
export interface AgencyProvisioningPayload {
    jobId: string;
    agencyId: string;
    dbName: string;
    subdomain: string;
    adminEmail: string;
    adminPasswordHash: string; // Already hashed
    adminFirstName: string;
    adminLastName: string;
    userId: string;
    plan: string;
}

export const QUEUES = {
    AGENCY_PROVISIONING: 'agency-provisioning',
    EMAIL_NOTIFICATIONS: 'email-notifications', // Future use
} as const;
