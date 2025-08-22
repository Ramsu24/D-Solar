import { Metadata } from 'next';

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
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_BASE_URL || 'https://dsolar.com.ph';
  const { slug } = await params;

  try {
    // Fetch blog data
    const response = await fetch(`${baseUrl}/api/blogs/${slug}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch blog post: ${response.status}`);
    }

    const blog: BlogPost = await response.json();

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