import { useQuery } from '@tanstack/react-query';
import { fetchSeoSettings, type SeoSettings } from '@/services/api/seo';

/**
 * Hook to fetch public SEO settings
 * This is used for landing pages and public routes where the user might not be logged in.
 */
export const useSeoSettings = () => {
  return useQuery({
    queryKey: ['seo-settings'],
    queryFn: fetchSeoSettings,
    staleTime: 1000 * 60 * 60, // 1 hour
    gcTime: 1000 * 60 * 60 * 24, // 24 hours
  });
};
