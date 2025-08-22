'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  shortDescription?: string;
  imageUrl: string;
  author?: string;
  category?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export default function BlogPost() {
  const [blog, setBlog] = useState<BlogPost | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;
  
  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const response = await fetch('/api/admin/blogs');
        
        if (!response.ok) {
          throw new Error('Failed to fetch blog posts');
        }
        
        const data = await response.json();
        const foundBlog = data.find((post: BlogPost) => post.slug === slug);
        
        if (!foundBlog) {
          throw new Error('Blog post not found');
        }
        
        setBlog(foundBlog);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchBlog();
  }, [slug]);
  
  // Format and render content with simple markdown parsing
  const renderContent = (content: string) => {
    // Very basic markdown parser
    const formattedContent = content
      .split('\n\n')
      .map((paragraph, idx) => {
        // Handle headings
        if (paragraph.startsWith('# ')) {
          return <h1 key={idx} className="text-3xl font-bold my-6">{paragraph.substring(2)}</h1>;
        }
        if (paragraph.startsWith('## ')) {
          return <h2 key={idx} className="text-2xl font-bold my-5">{paragraph.substring(3)}</h2>;
        }
        if (paragraph.startsWith('### ')) {
          return <h3 key={idx} className="text-xl font-bold my-4">{paragraph.substring(4)}</h3>;
        }
        
        // Handle lists
        if (paragraph.includes('\n- ')) {
          const listItems = paragraph.split('\n- ');
          const firstPart = listItems.shift(); // Get text before the list
          
          return (
            <div key={idx}>
              {firstPart && <p className="mb-4">{firstPart}</p>}
              <ul className="list-disc pl-6 mb-6">
                {listItems.map((item, itemIdx) => (
                  <li key={itemIdx} className="mb-2">{item}</li>
                ))}
              </ul>
            </div>
          );
        }
        
        // Regular paragraph with bold and italic formatting
        const formattedParagraph = paragraph
          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
          .replace(/\*(.*?)\*/g, '<em>$1</em>');
        
        return (
          <p 
            key={idx} 
            className="mb-6" 
            dangerouslySetInnerHTML={{ __html: formattedParagraph }}
          />
        );
      });
    
    return <div className="prose prose-lg max-w-none">{formattedContent}</div>;
  };
  
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16 mt-16">
        <div className="text-center py-8">
          <p className="text-gray-500">Loading blog post...</p>
        </div>
      </div>
    );
  }
  
  if (error || !blog) {
    return (
      <div className="container mx-auto px-4 py-16 mt-16">
        
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded my-4" role="alert">
          <p>{error || 'Blog post not found'}</p>
          
          <button
            onClick={() => router.push('/blogs')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Back to Blogs
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-16 mt-16">
        <Link href="/blogs" className="text-blue-600 hover:text-blue-800 mb-6 inline-flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back to Blogs
        </Link>
        
        <article className="max-w-4xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
          <div className="w-full h-96 overflow-hidden">
            <img 
              src={blog.imageUrl} 
              alt={blog.title} 
              className="w-full h-full object-cover"
            />
          </div>
          
          <div className="p-8">
            {blog.category && (
              <span className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800 mb-4">
                {blog.category}
              </span>
            )}
            
            <h1 className="text-4xl font-bold mb-4 text-gray-900">{blog.title}</h1>
            
            {blog.shortDescription && (
              <p className="text-xl text-gray-600 mb-6 italic">
                {blog.shortDescription}
              </p>
            )}
            
            <div className="flex items-center mb-8">
              <img 
                src="/logo.png" 
                alt="Author" 
                className="w-12 h-12 rounded-full mr-4"
              />
              <div>
                <p className="text-gray-900 font-medium">{blog.author || 'D-Solar Team'}</p>
                <div className="flex space-x-1 text-sm text-gray-500">
                  <time dateTime={blog.createdAt}>
                    {new Date(blog.createdAt).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </time>
                  {blog.updatedAt !== blog.createdAt && (
                    <span> (Updated: {new Date(blog.updatedAt).toLocaleDateString()})</span>
                  )}
                  <span> · {Math.ceil(blog.content.length / 1000)} min read</span>
                </div>
              </div>
            </div>
            
            {renderContent(blog.content)}
            
            {blog.tags && blog.tags.length > 0 && (
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 mb-3">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {blog.tags.map(tag => (
                    <span 
                      key={tag} 
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Share this article</h3>
              <div className="flex space-x-4">
                <a 
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(blog.title)}&url=${encodeURIComponent(window.location.href)}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:text-blue-700"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
                <a 
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                  </svg>
                </a>
                <a 
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-700 hover:text-blue-900"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M19.7 3H4.3A1.3 1.3 0 003 4.3v15.4A1.3 1.3 0 004.3 21h15.4a1.3 1.3 0 001.3-1.3V4.3A1.3 1.3 0 0019.7 3zM8.339 18.338H5.667v-8.59h2.672v8.59zM7.004 8.574a1.548 1.548 0 11-.002-3.096 1.548 1.548 0 01.002 3.096zm11.335 9.764H15.67v-4.177c0-.996-.017-2.278-1.387-2.278-1.389 0-1.601 1.086-1.601 2.206v4.249h-2.667v-8.59h2.559v1.174h.037c.356-.675 1.227-1.387 2.526-1.387 2.703 0 3.203 1.779 3.203 4.092v4.711z" clipRule="evenodd" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </article>
      </div>
    </main>
  );
} 