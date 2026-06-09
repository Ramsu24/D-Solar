import { MetadataRoute } from 'next';
import connectDB from '@/lib/mongodb';
import Blog from '@/models/Blog';

// The sitemap needs to be fully static for Next.js static site generation
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://d-solar.asia';

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 1,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/projects`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/blogs`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/social`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];

  try {
    await connectDB();

    const blogPosts = await Blog.find({}, 'slug updatedAt createdAt')
      .sort({ createdAt: -1 })
      .lean<Array<{ slug: string; updatedAt?: Date; createdAt: Date }>>();

    const blogPages: MetadataRoute.Sitemap = blogPosts
      .filter((post) => post.slug)
      .map((post) => ({
        url: `${baseUrl}/blogs/${post.slug}`,
        lastModified: post.updatedAt || post.createdAt,
        changeFrequency: 'weekly',
        priority: 0.7,
      }));

    return [...staticPages, ...blogPages];
  } catch (error) {
    console.error('Error generating sitemap with blog posts:', error);
    return staticPages;
  }
} 