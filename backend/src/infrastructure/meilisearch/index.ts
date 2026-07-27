import { Meilisearch } from 'meilisearch';

let client: Meilisearch | null = null;

export const getMeiliClient = () => {
    if (!client) {
        const host = process.env.MEILI_HOST || 'http://localhost:7700';
        const apiKey = process.env.MEILI_MASTER_KEY;
        if (!host || host.trim() === '') return null;
        
        try {
            client = new Meilisearch({ host, apiKey });
        } catch (err) {
            return null;
        }
    }
    return client;
};

export const INDEXES = {
    CLIENTS: 'clients',
    EMPLOYEES: 'employees',
    PROJECTS: 'projects',
} as const;
