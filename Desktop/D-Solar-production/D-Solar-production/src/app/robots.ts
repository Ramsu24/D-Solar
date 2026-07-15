import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/admin/',
        '/api/',
        '/private/',
        '/confirm-appointment/',
      ],
    },
    sitemap: [
      'https://d-solar.asia/sitemap.xml',
    ],
  };
} 