import { useLeads as useLeadsQuery } from './useCrm';

export const useLeads = () => {
    const { data, isLoading, refetch } = useLeadsQuery();
    return {
        leads: data || [],
        loading: isLoading,
        fetchLeads: refetch
    };
};
