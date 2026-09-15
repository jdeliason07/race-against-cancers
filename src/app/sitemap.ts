import { MetadataRoute } from 'next';
import { SITE_URL } from '@/config/site';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: SITE_URL,                           lastModified: new Date(), changeFrequency: 'weekly',  priority: 1   },
    { url: `${SITE_URL}/register`,             lastModified: new Date(), changeFrequency: 'monthly', priority: 0.9 },
    { url: `${SITE_URL}/race-details`,         lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
{ url: `${SITE_URL}/volunteer`,            lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${SITE_URL}/sponsor`,              lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE_URL}/about`,                lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE_URL}/faq`,                  lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${SITE_URL}/privacy`,              lastModified: new Date(), changeFrequency: 'yearly',  priority: 0.3 },
    { url: `${SITE_URL}/waiver`,               lastModified: new Date(), changeFrequency: 'yearly',  priority: 0.3 },
  ];
}
