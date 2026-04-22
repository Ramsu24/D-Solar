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
      ],
    },
    sitemap: [
      'https://d-solar.asia/sitemap.xml',
      'https://d-solar.asia/server-sitemap.xml'
    ],
  };
} 