import { getServerSideSitemap } from 'next-sitemap';
import type { ISitemapField } from 'next-sitemap';
import connectDB from '@/lib/mongodb';
import Blog from '@/models/Blog';

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_BASE_URL || 'https://dsolar.vercel.app';

  // Static pages
  const staticPages: ISitemapField[] = [
    {
      loc: baseUrl,
      lastmod: new Date().toISOString(),
      changefreq: 'monthly',
      priority: 1,
    },
    {
      loc: `${baseUrl}/residential`,
      lastmod: new Date().toISOString(),
      changefreq: 'monthly',
      priority: 0.8,
    },
    {
      loc: `${baseUrl}/commercial`,
      lastmod: new Date().toISOString(),
      changefreq: 'monthly',
      priority: 0.8,
    },
    {
      loc: `${baseUrl}/financing`,
      lastmod: new Date().toISOString(),
      changefreq: 'monthly',
      priority: 0.8,
    },
    {
      loc: `${baseUrl}/net-metering`,
      lastmod: new Date().toISOString(),
      changefreq: 'monthly',
      priority: 0.8,
    },
    {
      loc: `${baseUrl}/blogs`,
      lastmod: new Date().toISOString(),
      changefreq: 'daily',
      priority: 0.9,
    },
  ];

  try {
    // Connect to database
    await connectDB();
    
    // Fetch blog posts
    const blogPosts = await Blog.find({}, 'slug updatedAt createdAt').sort({ createdAt: -1 });
    
    // Blog pages
    const blogPages: ISitemapField[] = blogPosts.map((post: any) => ({
      loc: `${baseUrl}/blogs/${post.slug}`,
      lastmod: new Date(post.updatedAt || post.createdAt).toISOString(),
      changefreq: 'weekly',
      priority: 0.7,
    }));
    
    // Combine static and dynamic pages
    return getServerSideSitemap([...staticPages, ...blogPages]);
  } catch (error) {
    console.error('Error generating server-side sitemap:', error);
    // Return only static pages if there's an error
    return getServerSideSitemap(staticPages);
  }
} 