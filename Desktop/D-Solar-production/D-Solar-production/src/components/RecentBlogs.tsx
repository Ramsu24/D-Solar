import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { siteColors } from '@/utils/theme';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  imageUrl: string;
  createdAt: string;
  updatedAt: string;
}

export default function RecentBlogs() {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecentBlogs = async () => {
      try {
        const response = await fetch('/api/admin/blogs');

        if (!response.ok) {
          throw new Error('Failed to fetch blog posts');
        }

        const data = await response.json();
        const sortedBlogs = [...data]
          .sort((a: BlogPost, b: BlogPost) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 3);

        setBlogs(sortedBlogs);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        console.error('Error fetching recent blogs:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecentBlogs();
  }, []);

  const truncateContent = (content: string, maxLength: number = 120) => {
    const plainText = content
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    if (plainText.length <= maxLength) return plainText;
    return plainText.substring(0, maxLength) + '...';
  };

  if (isLoading) {
    return (
      <div className="py-12" style={{ backgroundColor: siteColors.secondary.lightBlue }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold" style={{ color: siteColors.primary.blue }}>Recent Blog Posts</h2>
            <p className="mt-4 text-lg" style={{ color: siteColors.neutrals.darkBlue }}>Loading latest articles...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || blogs.length === 0) {
    return (
      <div className="py-12" style={{ backgroundColor: siteColors.secondary.lightBlue }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold" style={{ color: siteColors.primary.blue }}>Recent Blog Posts</h2>
            <p className="mt-4 text-lg" style={{ color: siteColors.neutrals.darkBlue }}>
              {error || 'No blog posts available at the moment.'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <section className="relative min-h-screen pt-16 pb-24 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(to bottom, ${siteColors.secondary.lightBlue}, ${siteColors.neutrals.white})`,
          }}
        />
        <div
          className="absolute right-0 top-0 w-64 h-64 rounded-full opacity-60"
          style={{
            backgroundColor: siteColors.secondary.yellow,
            transform: 'translate(30%, -10%)',
          }}
        />
      </div>

      <div className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold" style={{ color: siteColors.primary.blue }}>Recent Blog Posts</h2>
            <p className="mt-4 text-xl max-w-3xl mx-auto" style={{ color: siteColors.neutrals.darkBlue }}>
              Stay updated with our latest articles and industry insights
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {blogs.map((blog) => (
              <div key={blog.id} className="flex flex-col overflow-hidden rounded-lg shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-xl bg-white">
                <div className="flex-shrink-0">
                  <img className="h-48 w-full object-cover" src={blog.imageUrl} alt={blog.title} />
                </div>
                <div className="flex-1 p-6 flex flex-col justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      <span
                        className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium"
                        style={{
                          backgroundColor: `${siteColors.primary.blue}1A`,
                          color: siteColors.primary.blue,
                        }}
                      >
                        Blog
                      </span>
                    </p>
                    <Link href={`/blogs/${blog.slug}`} className="block mt-2">
                      <p
                        className="text-xl font-semibold hover:text-blue-600 transition-colors duration-300"
                        style={{ color: siteColors.primary.blue }}
                      >
                        {blog.title}
                      </p>
                      <p className="mt-3 text-base" style={{ color: siteColors.neutrals.darkBlue }}>
                        {truncateContent(blog.content)}
                      </p>
                    </Link>
                  </div>
                  <div className="mt-6 flex items-center">
                    <div className="flex-shrink-0">
                      <span className="sr-only">D-Solar</span>
                      <img className="h-10 w-10 rounded-full" src="/logo.png" alt="D-Solar Logo" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium" style={{ color: siteColors.primary.blue }}>D-Solar Team</p>
                      <div className="flex space-x-1 text-sm" style={{ color: siteColors.neutrals.darkBlue }}>
                        <time dateTime={blog.createdAt}>
                          {new Date(blog.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </time>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link
              href="/blogs"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm transition-all duration-300 hover:opacity-90"
              style={{
                backgroundColor: siteColors.primary.orange,
                color: siteColors.neutrals.white,
              }}
            >
              View All Blog Posts
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
