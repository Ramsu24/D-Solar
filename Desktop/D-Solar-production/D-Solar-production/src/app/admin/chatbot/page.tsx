'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';

// Types for our entities
interface FAQ {
  id: string;
  question: string;
  answer: string;
  keywords: string[];
  createdAt: string;
  updatedAt: string;
}

interface Package {
  code: string;
  name: string;
  description: string;
  type: string;
  wattage: number;
  suitableFor: string;
  financingPrice: number;
  srpPrice: number;
  cashPrice: number;
  createdAt: string;
  updatedAt: string;
}

// This component handles the search params
function ChatbotContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState(tabParam === 'packages' ? 'packages' : 'faqs');
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortField, setSortField] = useState<'type' | 'wattage' | 'cashPrice'>('type');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Function to fetch FAQs
  const fetchFAQs = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/admin/faqs');
      if (!response.ok) {
        throw new Error(`Error fetching FAQs: ${response.status}`);
      }
      const data = await response.json();
      setFaqs(data);
    } catch (error) {
      console.error('Failed to fetch FAQs:', error);
      setError('Failed to load FAQs. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Function to fetch Packages
  const fetchPackages = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/admin/packages');
      if (!response.ok) {
        throw new Error(`Error fetching packages: ${response.status}`);
      }
      const data = await response.json();
      setPackages(data);
    } catch (error) {
      console.error('Failed to fetch packages:', error);
      setError('Failed to load packages. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  
  const handleDeleteFAQ = async (id: string) => {
    if (!confirm('Are you sure you want to delete this FAQ?')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/admin/faqs/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer admin-token' // Replace with actual auth
        }
      });
      
      if (!response.ok) {
        throw new Error(`Error deleting FAQ: ${response.status}`);
      }
      
      // Refresh FAQs list
      fetchFAQs();
    } catch (error) {
      console.error('Failed to delete FAQ:', error);
      setError('Failed to delete FAQ. Please try again.');
    }
  };

  // Handle deleting a Package
  const handleDeletePackage = async (code: string) => {
    if (!confirm('Are you sure you want to delete this package?')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/admin/packages/${code}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer admin-token' // Replace with actual auth
        }
      });
      
      if (!response.ok) {
        throw new Error(`Error deleting package: ${response.status}`);
      }
      
      // Refresh packages list
      fetchPackages();
    } catch (error) {
      console.error('Failed to delete package:', error);
      setError('Failed to delete package. Please try again.');
    }
  };

  // Update the URL when activeTab changes
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    router.push(`/admin/chatbot?tab=${tab}`, { scroll: false });
  };

  // Load data when the component mounts or when activeTab changes
  useEffect(() => {
    // Check URL parameters for tab
    if (tabParam === 'packages' && activeTab !== 'packages') {
      setActiveTab('packages');
    } else if (tabParam === 'faqs' && activeTab !== 'faqs') {
      setActiveTab('faqs');
    }
    
    if (activeTab === 'faqs') {
      fetchFAQs();
    } else {
      fetchPackages();
    }
  }, [activeTab, tabParam]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto py-8 px-4 max-w-7xl">
        <div className="bg-white rounded-xl shadow-md mb-8 p-6 transition-all duration-300">
          <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
            <h1 className="text-3xl font-bold text-gray-800 tracking-tight">
              Chatbot Knowledge Base Management
            </h1>
            <div className="flex space-x-3">
              <button 
                onClick={() => activeTab === 'faqs' ? fetchFAQs() : fetchPackages()}
                className="px-4 py-2.5 bg-gray-100 rounded-lg hover:bg-gray-200 text-gray-700 font-medium transition-colors duration-200 flex items-center space-x-2 border border-gray-200 hover:border-gray-300"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Refresh</span>
              </button>
              <Link 
                href={activeTab === 'faqs' ? '/admin/chatbot/faqs/new' : '/admin/chatbot/packages/new'}
                className="px-4 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium transition-all duration-200 flex items-center space-x-2 shadow-sm hover:shadow transform hover:-translate-y-0.5"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span>Add New {activeTab === 'faqs' ? 'FAQ' : 'Package'}</span>
              </Link>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-md mb-6 animate-fade-in" role="alert">
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <p className="font-medium">{error}</p>
              </div>
            </div>
          )}

          <div className="mb-6">
            <div className="flex bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => handleTabChange('faqs')}
                className={`flex-1 py-3 px-5 rounded-lg text-center font-medium transition-all duration-200 ${
                  activeTab === 'faqs' 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-200'
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>FAQs</span>
                </div>
              </button>
              <button
                onClick={() => handleTabChange('packages')}
                className={`flex-1 py-3 px-5 rounded-lg text-center font-medium transition-all duration-200 ${
                  activeTab === 'packages' 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-200'
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  <span>Packages</span>
                </div>
              </button>
            </div>
          </div>

          {activeTab === 'faqs' && (
            <div className="transition-opacity duration-300">
              {isLoading ? (
                <div className="flex justify-center items-center py-24">
                  <div className="relative">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
                    <div className="animate-spin rounded-full h-16 w-16 border-l-2 border-blue-500 absolute top-0 opacity-60" style={{ animationDirection: 'reverse', animationDuration: '1s' }}></div>
                  </div>
                  <p className="ml-4 text-gray-600 font-medium">Loading FAQs...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-5">
                  {faqs.map((faq) => (
                    <div key={faq.id} className="border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 transform hover:-translate-y-1 bg-white">
                      <div className="bg-blue-50 p-5 border-b border-blue-100">
                        <div className="flex justify-between items-start">
                          <h3 className="text-xl font-semibold text-gray-800">{faq.question}</h3>
                          <div className="flex space-x-2">
                            <Link 
                              href={`/admin/chatbot/faqs/edit/${faq.id}`}
                              className="px-3 py-1.5 bg-white rounded-lg hover:bg-gray-100 text-gray-700 font-medium transition-colors duration-200 border border-gray-200 shadow-sm flex items-center space-x-1"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                              <span>Edit</span>
                            </Link>
                            <button 
                              className="px-3 py-1.5 bg-white text-red-600 rounded-lg hover:bg-red-50 font-medium transition-colors duration-200 border border-gray-200 shadow-sm flex items-center space-x-1"
                              onClick={() => handleDeleteFAQ(faq.id)}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                              <span>Delete</span>
                            </button>
                          </div>
                        </div>
                        <div className="text-sm text-gray-500 mt-1.5">
                          Last updated: {new Date(faq.updatedAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="p-5">
                        <div className="mb-4">
                          <p className="text-gray-700">{faq.answer.length > 150 ? `${faq.answer.substring(0, 150)}...` : faq.answer}</p>
                          {faq.answer.length > 150 && (
                            <button className="text-blue-500 text-sm font-medium mt-2 hover:text-blue-700">
                              Read more
                            </button>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {faq.keywords.map((keyword, index) => (
                            <span key={`${faq.id}-${index}`} className="px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full border border-blue-100">
                              {keyword}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                  {faqs.length === 0 && !isLoading && (
                    <div className="flex flex-col items-center justify-center py-16 px-4 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-gray-600 text-lg mb-2">No FAQs found</p>
                      <p className="text-gray-500 text-center mb-6">Create your first FAQ to help users find answers to common questions</p>
                      <Link 
                        href="/admin/chatbot/faqs/new"
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium transition-all duration-200 flex items-center space-x-2"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        <span>Create FAQ</span>
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'packages' && (
            <div className="transition-opacity duration-300">
              {isLoading ? (
                <div className="flex justify-center items-center py-24">
                  <div className="relative">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
                    <div className="animate-spin rounded-full h-16 w-16 border-l-2 border-blue-500 absolute top-0 opacity-60" style={{ animationDirection: 'reverse', animationDuration: '1s' }}></div>
                  </div>
                  <p className="ml-4 text-gray-600 font-medium">Loading Packages...</p>
                </div>
              ) : (
                <>
                  <div className="mb-6 flex flex-wrap gap-4 items-center bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <div className="flex items-center space-x-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" />
                      </svg>
                      <label htmlFor="sortField" className="text-sm font-medium text-gray-700">
                        Sort packages by:
                      </label>
                      <select
                        id="sortField"
                        value={sortField}
                        onChange={(e) => setSortField(e.target.value as 'type' | 'wattage' | 'cashPrice')}
                        className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm p-2 bg-white"
                      >
                        <option value="type">Type</option>
                        <option value="wattage">Wattage</option>
                        <option value="cashPrice">Cash Price</option>
                      </select>
                    </div>
                    <button
                      onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 mr-2 transition-transform duration-200 ${sortDirection === 'desc' ? 'transform rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                      </svg>
                      {sortDirection === 'asc' ? 'Ascending' : 'Descending'}
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[...packages]
                      .sort((a, b) => {
                        if (sortField === 'type') {
                          const aType = a.type === 'hybrid' ? (a.name.includes('10.24kWh') ? 'hybrid-large' : 'hybrid-small') : a.type;
                          const bType = b.type === 'hybrid' ? (b.name.includes('10.24kWh') ? 'hybrid-large' : 'hybrid-small') : b.type;
                          return sortDirection === 'asc' 
                            ? aType.localeCompare(bType)
                            : bType.localeCompare(aType);
                        }
                        if (sortField === 'wattage') {
                          return sortDirection === 'asc'
                            ? a.wattage - b.wattage
                            : b.wattage - a.wattage;
                        }
                        // cashPrice
                        return sortDirection === 'asc'
                          ? a.cashPrice - b.cashPrice
                          : b.cashPrice - a.cashPrice;
                      })
                      .map((pkg) => {
                        // Determine card styling based on package type
                        let cardHeaderClass = "bg-gray-50";
                        let cardBorderClass = "border border-gray-200";
                        let typeTextClass = "text-gray-800";
                        let badgeClass = "";
                        let typeLabel = "";
                        
                        if (pkg.type === 'ongrid') {
                          cardHeaderClass = "bg-gradient-to-r from-green-50 to-green-100";
                          cardBorderClass = "border border-green-200";
                          typeTextClass = "text-green-800";
                          badgeClass = "bg-green-100 text-green-800 border border-green-200";
                          typeLabel = "OnGrid";
                        } else if (pkg.type === 'hybrid' || pkg.type === 'hybrid-small' || pkg.type === 'hybrid-large') {
                          // Check if it's a large battery hybrid
                          if (pkg.name.includes('10.24kWh') || pkg.code.includes('10K')) {
                            cardHeaderClass = "bg-gradient-to-r from-purple-50 to-purple-100";
                            cardBorderClass = "border border-purple-200";
                            typeTextClass = "text-purple-800";
                            badgeClass = "bg-purple-100 text-purple-800 border border-purple-200";
                            typeLabel = "Hybrid (10.24kWh Battery)";
                          } else {
                            cardHeaderClass = "bg-gradient-to-r from-blue-50 to-blue-100";
                            cardBorderClass = "border border-blue-200";
                            typeTextClass = "text-blue-800";
                            badgeClass = "bg-blue-100 text-blue-800 border border-blue-200";
                            typeLabel = "Hybrid (5.12kWh Battery)";
                          }
                        }
                        
                        return (
                          <div key={pkg.code} className={`${cardBorderClass} rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 transform hover:-translate-y-1 bg-white`}>
                            <div className={`${cardHeaderClass} p-5`}>
                              <div className="flex justify-between items-start">
                                <div className="flex flex-col">
                                  <h3 className={`text-xl font-semibold ${typeTextClass}`}>{pkg.name}</h3>
                                  <p className="text-sm text-gray-500 mt-0.5">{pkg.code}</p>
                                  {/* Type indicator badge */}
                                  <span className={`mt-2 inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${badgeClass}`}>
                                    {typeLabel}
                                  </span>
                                </div>
                                <div className="flex space-x-2">
                                  <Link 
                                    href={`/admin/chatbot/packages/edit/${pkg.code}`}
                                    className="px-3 py-1.5 bg-white rounded-lg hover:bg-gray-100 text-gray-700 font-medium transition-colors duration-200 border border-gray-200 shadow-sm flex items-center space-x-1"
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                    <span>Edit</span>
                                  </Link>
                                  <button 
                                    className="px-3 py-1.5 bg-white text-red-600 rounded-lg hover:bg-red-50 font-medium transition-colors duration-200 border border-gray-200 shadow-sm flex items-center space-x-1"
                                    onClick={() => handleDeletePackage(pkg.code)}
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                    <span>Delete</span>
                                  </button>
                                </div>
                              </div>
                            </div>
                            <div className="p-5 space-y-4">
                              {/* Wattage and Price Section */}
                              <div className="flex justify-between items-center">
                                <div className="flex items-center">
                                  <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium bg-amber-50 text-amber-700 border border-amber-200">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                    {pkg.wattage.toLocaleString()} Watts
                                  </span>
                                </div>
                                <div className="flex flex-col items-end">
                                  <span className="text-xs text-gray-500">Cash Price</span>
                                  <span className="text-lg font-bold text-green-600">₱{pkg.cashPrice.toLocaleString()}</span>
                                </div>
                              </div>
                              
                              {/* Suitable For Section */}
                              <div className="border-t border-gray-100 pt-4">
                                <p className="text-sm text-gray-500 mb-2">Suitable For</p>
                                <div className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm bg-gray-100 text-gray-800">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                  </svg>
                                  {pkg.suitableFor}
                                </div>
                              </div>

                              {/* Price Comparison Section */}
                              <div className="border-t border-gray-100 pt-4 grid grid-cols-2 gap-4">
                                <div className="bg-gray-50 p-3 rounded-lg">
                                  <p className="text-xs text-gray-500 mb-1">SRP Price</p>
                                  <p className="text-base font-medium">₱{pkg.srpPrice.toLocaleString()}</p>
                                </div>
                                <div className="bg-gray-50 p-3 rounded-lg">
                                  <p className="text-xs text-gray-500 mb-1">Financing Price</p>
                                  <p className="text-base font-medium">₱{pkg.financingPrice.toLocaleString()}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    {packages.length === 0 && !isLoading && (
                      <div className="flex flex-col items-center justify-center py-16 px-4 bg-gray-50 rounded-xl border border-dashed border-gray-300 col-span-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                        <p className="text-gray-600 text-lg mb-2">No packages found</p>
                        <p className="text-gray-500 text-center mb-6">Create your first package to showcase your solar solutions</p>
                        <Link 
                          href="/admin/chatbot/packages/new"
                          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium transition-all duration-200 flex items-center space-x-2"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                          <span>Create Package</span>
                        </Link>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Main component that uses Suspense
export default function ChatbotAdminPage() {
  return (
    <Suspense fallback={<div className="py-10 text-center">Loading...</div>}>
      <ChatbotContent />
    </Suspense>
  );
} 