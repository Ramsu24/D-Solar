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

    if (!blogPosts || blogPosts.length === 0) {
      console.warn('⚠️ No blog posts found in database for sitemap');
      return staticPages;
    }

    const blogPages: MetadataRoute.Sitemap = blogPosts
      .filter((post) => post.slug)
      .map((post) => ({
        url: `${baseUrl}/blogs/${post.slug}`,
        lastModified: post.updatedAt || post.createdAt,
        changeFrequency: 'weekly',
        priority: 0.7,
      }));

    console.log(`✅ Sitemap generated: ${staticPages.length} static + ${blogPages.length} blog pages`);
    return [...staticPages, ...blogPages];
  } catch (error) {
    console.error('❌ CRITICAL: Error generating sitemap with blog posts:', error);
    console.error('This means blog posts are NOT in the sitemap and won\'t be indexed by Google!');
    return staticPages;
  }
} 