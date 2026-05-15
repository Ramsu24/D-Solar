import { Metadata } from 'next';
import connectDB from '@/lib/mongodb';
import Blog from '@/models/Blog';

interface BlogPost {
  title: string;
  shortDescription: string;
  content: string;
  imageUrl: string;
  author: string;
  category: string;
  tags: string[];
  createdAt: string;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL ||
    (process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : 'https://d-solar.asia');
  const { slug } = await params;

  try {
    await connectDB();
    const blog = await Blog.findOne({ slug }).lean<BlogPost | null>();

    if (!blog) {
      return {
        title: 'Blog Post | D-Solar',
        description: 'Read our latest blog post',
      };
    }

    // Prepare meta tags
    return {
      title: `${blog.title} | D-Solar`,
      description: blog.shortDescription || `Read about ${blog.title}`,
      openGraph: {
        title: `${blog.title} | D-Solar`,
        description: blog.shortDescription || `Read about ${blog.title}`,
        url: `${baseUrl}/blogs/${slug}`,
        siteName: 'D-Solar',
        images: [
          {
            url: blog.imageUrl || `${baseUrl}/images/default-blog.jpg`,
            width: 1200,
            height: 630,
            alt: blog.title,
          },
        ],
        locale: 'en_US',
        type: 'article',
      },
      twitter: {
        card: 'summary_large_image',
        title: `${blog.title} | D-Solar`,
        description: blog.shortDescription || `Read about ${blog.title}`,
        images: [blog.imageUrl || `${baseUrl}/images/default-blog.jpg`],
      },
      alternates: {
        canonical: `${baseUrl}/blogs/${slug}`,
      },
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'Blog Post | D-Solar',
      description: 'Read our latest blog post',
    };
  }
} 