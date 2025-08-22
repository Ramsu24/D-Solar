'use client';

import React, { useEffect } from 'react';
import { useAdmin } from '@/contexts/AdminContext';
import Link from 'next/link';

export default function AdminDashboard() {
  const { isAuthenticated, username } = useAdmin();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100">
      <div className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
            <p className="text-gray-600 text-lg">Manage D-Solar content and settings in this dashboard.</p>
          </div>
          
          <div className="bg-white shadow-lg rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl mb-8 border border-gray-100">
            <div className="px-8 py-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Welcome, <span className="text-blue-600">{username}</span></h2>
              <p className="text-gray-600">
                Use the navigation sidebar to manage your website content.
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4 mb-8">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1 border border-gray-100">
              <div className="h-2 bg-orange-600"></div>
              <div className="px-6 py-8">
                <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-lg flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Manage Appointments</h3>
                <p className="text-gray-600 mb-6">
                  View, update, and manage customer appointments.
                </p>
                <div>
                  <Link
                    href="/admin/appointments"
                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors duration-200"
                  >
                    View Appointments
                  </Link>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1 border border-gray-100">
              <div className="h-2 bg-blue-600"></div>
              <div className="px-6 py-8">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 0 1-2.25 2.25M16.5 7.5V18a2.25 2.25 0 0 0 2.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 0 0 2.25 2.25h13.5M6 7.5h3v3H6v-3Z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Manage Blog Posts</h3>
                <p className="text-gray-600 mb-6">
                  Create, edit, and delete blog posts on your website.
                </p>
                <div>
                  <Link
                    href="/admin/blogs"
                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                  >
                    View All Blogs
                  </Link>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1 border border-gray-100">
              <div className="h-2 bg-green-600"></div>
              <div className="px-6 py-8">
                <div className="w-12 h-12 bg-green-100 text-green-600 rounded-lg flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Create New Blog Post</h3>
                <p className="text-gray-600 mb-6">
                  Add a new blog post to your website.
                </p>
                <div>
                  <Link
                    href="/admin/blogs/create"
                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200"
                  >
                    Create New Blog
                  </Link>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1 border border-gray-100">
              <div className="h-2 bg-purple-600"></div>
              <div className="px-6 py-8">
                <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Manage Chatbot Knowledge</h3>
                <p className="text-gray-600 mb-6">
                  Manage FAQs and packages for the chatbot.
                </p>
                <div>
                  <Link
                    href="/admin/chatbot"
                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors duration-200"
                  >
                    Manage Chatbot
                  </Link>
                </div>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 mb-8">
            <div className="bg-white shadow-lg rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl border border-gray-100">
              <div className="px-6 py-6 bg-indigo-500">
                <h3 className="text-xl font-semibold text-white">Manage FAQs</h3>
              </div>
              <div className="px-6 py-6">
                <p className="text-gray-600 mb-6">
                  Create, edit, and delete FAQs for the chatbot knowledge base.
                </p>
                <div className="flex space-x-4">
                  <Link
                    href="/admin/chatbot?tab=faqs"
                    className="inline-flex items-center px-4 py-2 border border-indigo-600 text-sm font-medium rounded-lg text-indigo-600 bg-white hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
                  >
                    View All FAQs
                  </Link>
                  <Link
                    href="/admin/chatbot/faqs/new"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
                  >
                    Add New FAQ
                  </Link>
                </div>
              </div>
            </div>
            
            <div className="bg-white shadow-lg rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl border border-gray-100">
              <div className="px-6 py-6 bg-amber-500">
                <h3 className="text-xl font-semibold text-white">Manage Packages</h3>
              </div>
              <div className="px-6 py-6">
                <p className="text-gray-600 mb-6">
                  Create, edit, and delete solar packages for the chatbot knowledge base.
                </p>
                <div className="flex space-x-4">
                  <Link
                    href="/admin/chatbot?tab=packages"
                    className="inline-flex items-center px-4 py-2 border border-amber-600 text-sm font-medium rounded-lg text-amber-600 bg-white hover:bg-amber-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-colors duration-200"
                  >
                    View All Packages
                  </Link>
                  <Link
                    href="/admin/chatbot/packages/new"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-colors duration-200"
                  >
                    Add New Package
                  </Link>
                </div>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 mb-8">
            <div className="bg-white shadow-lg rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl border border-gray-100">
              <div className="px-6 py-6 bg-teal-500">
                <h3 className="text-xl font-semibold text-white">Solar Calculator Parameters</h3>
              </div>
              <div className="px-6 py-6">
                <p className="text-gray-600 mb-6">
                  Customize and fine-tune the solar calculator parameters, including costs, efficiency rates, and regional settings.
                </p>
                <div className="flex space-x-4">
                  <Link
                    href="/admin/calculator-params"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-colors duration-200"
                  >
                    Manage Calculator Settings
                  </Link>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-8 bg-white shadow-lg overflow-hidden rounded-2xl border border-gray-100">
            <div className="px-6 py-6 bg-gray-50 border-b border-gray-100">
              <h2 className="text-lg font-medium text-gray-900">Quick Tips</h2>
            </div>
            <div className="px-6 py-6">
              <ul className="space-y-3">
                <li className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-green-500 mr-2 mt-0.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                  <span className="text-gray-600">Keep blog posts concise and focused on a single topic</span>
                </li>
                <li className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-green-500 mr-2 mt-0.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                  <span className="text-gray-600">Use high-quality images that are relevant to your content</span>
                </li>
                <li className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-green-500 mr-2 mt-0.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                  <span className="text-gray-600">Include a call-to-action in your blog posts</span>
                </li>
                <li className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-green-500 mr-2 mt-0.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                  <span className="text-gray-600">Regularly update your blog with fresh content</span>
                </li>
                <li className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-green-500 mr-2 mt-0.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                  <span className="text-gray-600">Add relevant keywords to FAQs to improve chatbot responses</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 