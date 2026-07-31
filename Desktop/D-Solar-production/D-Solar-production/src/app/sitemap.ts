import { MetadataRoute } from 'next';
import connectDB from '@/lib/mongodb';
import Blog from '@/models/Blog';

// The sitemap needs to be fully static for Next.js static site generation
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://d-solar.asia';
  const isPreviewDeployment = process.env.VERCEL_ENV === 'preview';

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

  // Temporary safeguard: skip DB reads in preview builds when environment access is limited.
  if (isPreviewDeployment) {
    return staticPages;
  }

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
    console.warn('Sitemap fallback: unable to load blog posts from MongoDB.', error);
    return staticPages;
  }
} 