'use client';

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
  const [isLoaded, setIsLoaded] = useState(true);
  const [scrollY, setScrollY] = useState(0);
  const scrollTicking = React.useRef(false);
  
  useEffect(() => {
    // Optimized scroll handler with requestAnimationFrame
    const handleScroll = () => {
      if (!scrollTicking.current) {
        requestAnimationFrame(() => {
          setScrollY(window.scrollY);
          scrollTicking.current = false;
        });
        scrollTicking.current = true;
      }
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  useEffect(() => {
    const fetchRecentBlogs = async () => {
      try {
        const response = await fetch('/api/admin/blogs');
        
        if (!response.ok) {
          throw new Error('Failed to fetch blog posts');
        }
        
        const data = await response.json();
        
        // Sort blogs by creation date (newest first) and take the top 3
        const sortedBlogs = [...data].sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        ).slice(0, 3);
        
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
  
  // Function to truncate content for preview
  const truncateContent = (content: string, maxLength: number = 120) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
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
              {error || "No blog posts available at the moment."}
            </p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <section className="relative min-h-screen pt-16 pb-24 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
        {/* Light blue background gradient */}
        <div 
          className="absolute inset-0"
          style={{ 
            background: `linear-gradient(to bottom, ${siteColors.secondary.lightBlue}, ${siteColors.neutrals.white})`,
            opacity: Math.max(0.6, 1 - (scrollY * 0.001)) 
          }}
        />
        
        {/* Big sun in corner */}
        <div 
          className={`absolute right-0 top-0 w-64 h-64 rounded-full transition-all duration-1000 ease-out ${
            isLoaded ? 'opacity-60' : 'opacity-0'
          }`}
          style={{
            backgroundColor: siteColors.secondary.yellow,
            transform: `translate(30%, -10%) scale(${1 + scrollY * 0.009})`
          }}
        />
        
        {/* Floating solar panels */}
        {[...Array(5)].map((_, i) => (
          <div
            key={`panel-${i}`}
            className={`absolute rounded-md transition-all duration-1000 ease-out ${
              isLoaded ? 'opacity-50' : 'opacity-0'
            }`}
            style={{
              backgroundColor: siteColors.primary.blue,
              width: `${60 + i * 20}px`,
              height: `${50 + i * 10}px`,
              top: `${20 + i * 15}%`,
              left: `${5 + i * 18}%`,
              transform: `rotate(${i * 9}deg) translateY(${scrollY * (0.1 + i * 0.004)}px)`,
              transition: 'transform 0.1s ease-out, opacity 1s ease-out',
              transitionDelay: `${i * 0}s`,
              boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
              border: '1px solid rgba(255, 255, 255, 0.5)'
            }}
          />
        ))}
        
        {/* Bottom right panels */}
        {[...Array(3)].map((_, i) => (
          <div
            key={`bottom-panel-${i}`}
            className={`absolute rounded-md transition-all duration-1000 ease-out ${
              isLoaded ? 'opacity-50' : 'opacity-0'
            }`}
            style={{
              backgroundColor: siteColors.primary.blue,
              width: `${80 + i * 20}px`,
              height: `${60 + i * 15}px`,
              bottom: `${5 + i * 10}%`,
              right: `${5 + i * 10}%`,
              transform: `rotate(${-5 - i * 5}deg) translateY(${-scrollY * (0.01 + i * 0.005)}px)`,
              transition: 'transform 0.2s ease-out, opacity 1s ease-out',
              transitionDelay: `${0.5 + i * 0.1}s`,
              boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
              border: '1px solid rgba(255, 255, 255, 0.5)'
            }}
          />
        ))}

        {/* Light beams from top */}
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute top-0"
            style={{
              backgroundColor: siteColors.secondary.yellow,
              left: `${5 + i * 12}%`,
              width: '3px',
              height: `${300 + i * 50}px`,
              opacity: Math.max(0.1, 0.3 - (scrollY * 0.0005)),
              transform: `rotate(${-5 + i * 2}deg) translateY(${-20 + scrollY * 0.1}px)`,
              boxShadow: `0 0 15px ${siteColors.secondary.yellow}`
            }}
          />
        ))}

        {/* Moving clouds */}
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              backgroundColor: siteColors.neutrals.white,
              width: `${120 + i * 40}px`,
              height: `${40 + i * 15}px`,
              top: `${5 + i * 10}%`,
              left: `${20 + i * 20}%`,
              opacity: 0.4,
              transform: `translateX(${scrollY * (-0.1 - i * 0.05)}px)`,
              filter: 'blur(5px)'
            }}
          />
        ))}

        {/* Subtle grid overlay */}
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(${siteColors.primary.blue}0D 1px, transparent 1px), linear-gradient(90deg, ${siteColors.primary.blue}0D 1px, transparent 1px)`,
            backgroundSize: '20px 20px',
            opacity: Math.max(0.2, 0.5 - (scrollY * 0.001)),
            transform: `translateY(${scrollY * 0.1}px)`
          }}
        />
      </div>

      {/* Main content */}
      <div className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold" style={{ color: siteColors.primary.blue }}>Recent Blog Posts</h2>
            <p className="mt-4 text-xl max-w-3xl mx-auto" style={{ color: siteColors.neutrals.darkBlue }}>
              Stay updated with our latest articles and industry insights
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {blogs.map(blog => (
              <div key={blog.id} className="flex flex-col overflow-hidden rounded-lg shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-xl bg-white">
                <div className="flex-shrink-0">
                  <img
                    className="h-48 w-full object-cover"
                    src={blog.imageUrl}
                    alt={blog.title}
                  />
                </div>
                <div className="flex-1 p-6 flex flex-col justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      <span className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium" 
                        style={{ 
                          backgroundColor: `${siteColors.primary.blue}1A`,
                          color: siteColors.primary.blue 
                        }}>
                        Blog
                      </span>
                    </p>
                    <Link href={`/blogs/${blog.slug}`} className="block mt-2">
                      <p className="text-xl font-semibold hover:text-blue-600 transition-colors duration-300" 
                        style={{ color: siteColors.primary.blue }}>
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
                            day: 'numeric' 
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
                color: siteColors.neutrals.white
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
  