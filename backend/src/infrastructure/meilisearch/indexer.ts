import { getMeiliClient, INDEXES } from './index.js';

export const indexClients = async (agencyId: string, records: any[]) => {
    const client = getMeiliClient();
    if (!client) return;

    const docs = records.map((record) => ({
        id: record.id,
        name: record.name,
        email: record.email,
        phone: record.phone,
        agencyId,
    }));

    try {
        await client.index(INDEXES.CLIENTS).addDocuments(docs);
    } catch (error) {
        console.error('Meilisearch indexing error (clients):', error);
    }
};

export const indexEmployees = async (agencyId: string, records: any[]) => {
    const client = getMeiliClient();
    if (!client) return;

    const docs = records.map((record) => ({
        id: record.id,
        firstName: record.firstName,
        lastName: record.lastName,
        email: record.email,
        department: record.department,
        agencyId,
    }));

    try {
        await client.index(INDEXES.EMPLOYEES).addDocuments(docs);
    } catch (error) {
        console.error('Meilisearch indexing error (employees):', error);
    }
};

export const indexProjects = async (agencyId: string, records: any[]) => {
    const client = getMeiliClient();
    if (!client) return;

    const docs = records.map((record) => ({
        id: record.id,
        name: record.name,
        status: record.status,
        agencyId,
    }));

    try {
        await client.index(INDEXES.PROJECTS).addDocuments(docs);
    } catch (error) {
        console.error('Meilisearch indexing error (projects):', error);
    }
};

export const removeFromIndex = async (indexName: string, id: string) => {
    const client = getMeiliClient();
    if (!client) return;

    try {
        await client.index(indexName).deleteDocument(id);
    } catch (error) {
        console.error(`Meilisearch remove error (${indexName}):`, error);
    }
};
