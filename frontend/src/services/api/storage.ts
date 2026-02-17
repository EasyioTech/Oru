import { getApiEndpoint } from '@/config/services';

export interface UploadResponse {
    url: string;
    key: string;
    mimeType: string;
    originalName: string;
}

function getAuthHeaders(isMultipart = false) {
    if (typeof window === 'undefined') {
        return {};
    }

    const token = window.localStorage.getItem('auth_token') || '';
    const userRole = window.localStorage.getItem('user_role');
    const agencyDatabase = window.localStorage.getItem('agency_database') || '';

    const headers: Record<string, string> = {
        'Accept': 'application/json',
    };

    // For multipart, we do NOT set Content-Type; browser sets it with boundary
    if (!isMultipart) {
        headers['Content-Type'] = 'application/json';
    }

    if (token) {
        headers['Authorization'] = `Bearer ${token}`; // Remove Bearer prefix if your backend doesn't expect it, but standard is with Bearer
    }

    // Don't include agency database header for super admins
    if (agencyDatabase && userRole !== 'super_admin') {
        headers['X-Agency-Database'] = agencyDatabase;
    }

    return headers;
}

export const uploadFile = async (file: File, context: string = 'general'): Promise<UploadResponse> => {
    const endpoint = getApiEndpoint(`/storage/upload?context=${context}`);
    const formData = new FormData();
    formData.append('file', file);

    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: getAuthHeaders(true),
            body: formData,
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Upload failed: ${errorText}`);
        }

        const result = await response.json();
        if (!result.success) {
            throw new Error(result.message || 'Upload failed');
        }

        return result.data;
    } catch (error) {
        console.error('File upload error:', error);
        throw error;
    }
};
