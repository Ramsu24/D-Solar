'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  imageUrl: string;
  createdAt: string;
  updatedAt: string;
}

// Removing animation keyframes
const styles = `
  .blog-card {
    transition: transform 0.3s ease, box-shadow 0.3s ease;
  }
  
  .blog-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
  }
`;

export default function Blogs() {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const response = await fetch('/api/admin/blogs');
        
        if (!response.ok) {
          throw new Error('Failed to fetch blog posts');
        }
        
        const data = await response.json();
        setBlogs(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchBlogs();
  }, []);
  
  // Function to truncate content for preview
  const truncateContent = (content: string, maxLength: number = 150) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };
  
  return (
    <main className="min-h-screen bg-gradient-to-b from-sky-50 to-white pt-28">
      {/* Simple decorative elements instead of animations */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Top right decorative element */}
        <div className="absolute top-0 right-0 w-72 h-72 rounded-bl-full bg-blue-100/50"></div>
        
        {/* Bottom left decorative element */}
        <div className="absolute bottom-0 left-0 w-64 h-64 rounded-tr-full bg-orange-100/50"></div>
      </div>

      <div className="container mx-auto px-4 py-16 relative z-10">
        <div className="mb-12">
          <h1 className="text-5xl font-bold text-primary inline-block border-b-4 border-orange-400 pb-2">
            Recent Blogs
          </h1>
        </div>
        
        {isLoading ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Loading blog posts...</p>
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded my-4" role="alert">
            <p>{error}</p>
          </div>
        ) : blogs.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No blog posts found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {blogs.map(blog => (
              <div key={blog.id} className="overflow-hidden rounded-lg shadow-md border border-gray-100 bg-white blog-card">
                <img 
                  src={blog.imageUrl} 
                  alt={blog.title} 
                  className="w-full h-48 object-cover"
                />
                <div className="p-6">
                  <h2 className="text-xl font-semibold mb-2 text-primary">{blog.title}</h2>
                  <p className="text-gray-600 mb-4">
                    {truncateContent(blog.content)}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">
                      {new Date(blog.createdAt).toLocaleDateString()}
                    </span>
                    <Link 
                      href={`/blogs/${blog.slug}`}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Read More
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Add style tag for subtle animations */}
      <style jsx global>{styles}</style>
    </main>
  );
} 