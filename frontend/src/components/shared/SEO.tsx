import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useSeoSettings } from '@/hooks/useSeoSettings';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
  ogType?: string;
  canonical?: string;
  twitterHandle?: string;
  schema?: Record<string, any>; // For extra JSON-LD data
}

/**
 * Reusable SEO component for dynamic head metadata management.
 * Injects Open Graph, Twitter, and standard meta tags.
 */
export const SEO: React.FC<SEOProps> = ({
  title,
  description,
  keywords,
  ogImage,
  ogType = 'website',
  canonical,
  twitterHandle,
  schema,
}) => {
  const { data: globalSettings } = useSeoSettings();

  const siteTitle = title 
    ? `${title} | Oru ERP` 
    : (globalSettings?.meta_title || 'Oru ERP - Complete Agency Management');
  
  const metaDescription = description || globalSettings?.meta_description || 'Oru ERP is the all-in-one platform for agency management and business growth.';
  const metaKeywords = keywords || globalSettings?.meta_keywords || 'erp, agency management, crm, project management, business automation';
  const siteUrl = window.location.origin;
  const currentUrl = canonical || window.location.href;
  const image = ogImage || globalSettings?.og_image_url || `${siteUrl}/og-image.png`;

  // Default Structured Data
  const defaultSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Oru ERP",
    "operatingSystem": "Web, iOS, Android",
    "applicationCategory": "BusinessApplication",
    "offers": {
      "@type": "Offer",
      "price": "29.00",
      "priceCurrency": "USD"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "reviewCount": "120"
    }
  };

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Easyio Technologies",
    "alternateName": ["Oru ERP", "EasyioTech", "Oru by Easyio", "OruERP"],
    "url": "https://oruerp.com",
    "logo": `${siteUrl}/logo.png`,
    "description": "Oru ERP is an advanced enterprise resource planning system developed by Easyio Technologies for modern agencies and businesses.",
    "sameAs": [
      "https://easyiotech.com",
      "https://get-oru.com",
      globalSettings?.facebook_url,
      globalSettings?.twitter_url,
      globalSettings?.linkedin_url,
      globalSettings?.instagram_url,
      globalSettings?.youtube_url
    ].filter(Boolean)
  };

  return (
    <Helmet>
      {/* Standard Metadata */}
      <title>{siteTitle}</title>
      <meta name="description" content={metaDescription} />
      <meta name="keywords" content={metaKeywords} />
      {canonical && <link rel="canonical" href={canonical} />}

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:title" content={siteTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:image" content={image} />

      {/* Twitter */}
      <meta name="twitter:card" content={globalSettings?.twitter_card_type || 'summary_large_image'} />
      <meta name="twitter:url" content={currentUrl} />
      <meta name="twitter:title" content={siteTitle} />
      <meta name="twitter:description" content={metaDescription} />
      <meta name="twitter:image" content={image} />
      {(twitterHandle || globalSettings?.twitter_site) && (
        <meta name="twitter:site" content={twitterHandle || globalSettings?.twitter_site || ''} />
      )}

      {/* Social Links if available */}
      {globalSettings?.facebook_url && <meta property="article:publisher" content={globalSettings.facebook_url} />}

      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(defaultSchema)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(organizationSchema)}
      </script>
      {schema && (
        <script type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      )}
    </Helmet>
  );
};
