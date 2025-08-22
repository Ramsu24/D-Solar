'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAdmin } from '@/contexts/AdminContext';
import { ExternalLink, Edit, Trash2 } from 'lucide-react';
import { Console } from 'console';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  imageUrl: string;
  createdAt: string;
  updatedAt: string;
}

// Tooltip component
const Tooltip = ({ children, text }: { children: React.ReactNode; text: string }) => (
  <div className="group relative inline-block">
    {children}
    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 absolute z-50 py-1 px-2 bottom-full left-1/2 transform -translate-x-1/2 mb-1 w-auto min-w-[80px] max-w-[140px] bg-slate-800 text-white text-xs rounded-lg text-center whitespace-normal">
      {text}
      <div className="absolute left-1/2 top-full w-2 h-2 -mt-1 transform -translate-x-1/2 bg-slate-800 rotate-45"></div>
    </div>
  </div>
);

export default function AdminBlogs() {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState(-1); //Initial state order
  const [isDebouncing, setIsDebouncing] = useState(false); //Debounce flag
  const [isUp, setIsUp] = useState(false); //Toggle button 

  // Fetch blog posts
  const fetchBlogs = async (order: number) => {
    try {

      const response = await fetch(`/api/admin/blogs?order=${order}`); //Pass order as query param
      
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
  useEffect(() => {
    fetchBlogs(sortOrder);//Fetch blogs with the initial set order
  }, [sortOrder]);
  
  //CreatedAt sorting
  const handleClick = () => {
    if(isDebouncing) return; //Ignore clicks if debouncing is active
    
    setIsDebouncing(true); //Start debouncing
    const newOrder = sortOrder === -1? 1:-1; //Toggle the set order
    setSortOrder(newOrder); //Update the set order in state
    fetchBlogs(newOrder); //Fetch blogs with the new set order
    setTimeout(() => { //End debouncing after 500ms
      setIsDebouncing(false)
      const button = document.querySelector('.CreatedAtBtn');
      if(button){
        if(isUp){
          button.innerHTML = '<img src="/down.png" alt="" style="margin-left:5px; height:9px; width:10px;"/>';
          setIsUp(false); 
        }else{
          button.innerHTML = '<img src="/up.png" alt="" style="margin-left:5px; height: 9px; width: 10px;"/>';
          setIsUp(true);
        }
      }else{
        console.error('Button not found!');
      }
    }, 500);

    
  };

  // Delete blog post
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this blog post?')) {
      return;
    }
    
    try {
      setDeletingId(id);
      const response = await fetch(`/api/admin/blogs/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete blog post');
      }
      
      // Remove blog from state
      setBlogs(blogs.filter(blog => blog.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete blog post');
    } finally {
      setDeletingId(null);
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-indigo-50 to-emerald-50">
      <div className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-slate-800">Manage Blog Posts</h1>
              <p className="mt-2 text-slate-600">Create and manage your blog content</p>
            </div>
            <Link
              href="/admin/blogs/create"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 transition-all duration-200 hover:shadow-md"
            >
              Create New Blog
            </Link>
          </div>
          
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-slate-600">Loading blog posts...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg my-6" role="alert">
              <p className="flex items-center">
                <span className="mr-2">⚠️</span>
                {error}
              </p>
            </div>
          ) : (
            <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-slate-200">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                    <tr>
                      <th scope="col" className="px-6 py-4 text-left text-sm font-semibold text-slate-800">
                        Title
                      </th>
                      <th scope="col" className="px-6 py-4 text-left text-sm font-semibold text-slate-800">
                        Slug
                      </th>
                      <th scope="col" className="px-6 py-4 text-left text-sm font-semibold text-slate-800 whitespace-nowrap">
                        Created At
                        <button type="button" className="CreatedAtBtn" onClick={handleClick}><img src="/down.png" alt="" style={{marginLeft:'5px', height: '9px', width: '10px',}}/></button>
                      </th>
                      <th scope="col" className="px-6 py-4 text-left text-sm font-semibold text-slate-800 whitespace-nowrap">
                        Updated At
                      </th>
                      <th scope="col" className="px-6 py-4 text-center text-sm font-semibold text-slate-800 whitespace-nowrap">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {blogs.map(blog => (
                      <tr key={blog.id} className="hover:bg-slate-50 transition-all duration-150">
                        <td className="px-6 py-4 text-sm font-medium text-slate-800">
                          {blog.title}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600 font-mono">
                          {blog.slug}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600 whitespace-nowrap">
                          {new Date(blog.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600 whitespace-nowrap">
                          {new Date(blog.updatedAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium whitespace-nowrap">
                          <div className="flex items-center justify-end gap-4">
                            <Tooltip text="View on website">
                              <Link
                                href={`/blogs/${blog.slug}`}
                                target="_blank"
                                className="text-emerald-600 hover:text-emerald-800 transition-colors duration-150 flex items-center gap-1"
                              >
                                <span>View</span>
                                <ExternalLink className="h-3 w-3" />
                              </Link>
                            </Tooltip>
                            
                            <Tooltip text="Edit post">
                              <Link
                                href={`/admin/blogs/edit/${blog.id}`}
                                className="text-blue-600 hover:text-blue-800 transition-colors duration-150 flex items-center gap-1"
                              >
                                <span>Edit</span>
                                <Edit className="h-3 w-3" />
                              </Link>
                            </Tooltip>
                            
                            <Tooltip text="Delete post">
                              <button
                                onClick={() => handleDelete(blog.id)}
                                disabled={deletingId === blog.id}
                                className="text-red-600 hover:text-red-800 transition-colors duration-150 disabled:text-red-400 disabled:cursor-not-allowed flex items-center gap-1"
                              >
                                {deletingId === blog.id ? (
                                  <span className="flex items-center gap-1">
                                    <svg className="animate-spin h-3 w-3 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    <span>Deleting...</span>
                                  </span>
                                ) : (
                                  <>
                                    <span>Delete</span>
                                    <Trash2 className="h-3 w-3" />
                                  </>
                                )}
                              </button>
                            </Tooltip>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 