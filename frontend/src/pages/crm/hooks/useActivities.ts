import { useActivities as useActivitiesQuery } from './useCrm';

export const useActivities = () => {
    const { data, isLoading, refetch } = useActivitiesQuery();
    return {
        activities: data || [],
        loading: isLoading,
        fetchActivities: refetch
    };
};
