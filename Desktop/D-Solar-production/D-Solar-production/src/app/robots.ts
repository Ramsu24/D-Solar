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
      'https://dsolar.vercel.app/sitemap.xml',
      'https://dsolar.vercel.app/server-sitemap.xml'
    ],
  };
} 