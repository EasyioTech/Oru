import { api } from '@/utils/api';

export interface SeoSettings {
  meta_title: string | null;
  meta_description: string | null;
  meta_keywords: string | null;
  og_title: string | null;
  og_description: string | null;
  og_image_url: string | null;
  twitter_card_type: string | null;
  twitter_site: string | null;
  facebook_url: string | null;
  twitter_url: string | null;
  linkedin_url: string | null;
  instagram_url: string | null;
  youtube_url: string | null;
}

export const fetchSeoSettings = async (): Promise<SeoSettings> => {
  const response = await api.get('/system/seo-settings');
  return response.data.data;
};
