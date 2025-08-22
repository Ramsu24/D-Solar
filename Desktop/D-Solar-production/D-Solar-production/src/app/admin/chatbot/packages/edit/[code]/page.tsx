'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

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
}

export default function EditPackagePage() {
  const router = useRouter();
  const params = useParams();
  const packageCode = params.code as string;
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('ongrid');
  const [wattage, setWattage] = useState('');
  const [suitableFor, setSuitableFor] = useState('');
  const [financingPrice, setFinancingPrice] = useState('');
  const [srpPrice, setSrpPrice] = useState('');
  const [cashPrice, setCashPrice] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch package data
  useEffect(() => {
    const fetchPackage = async () => {
      try {
        const response = await fetch(`/api/admin/packages/${packageCode}`);
        if (!response.ok) {
          throw new Error(`Error fetching package: ${response.status}`);
        }
        const data = await response.json();
        setName(data.name);
        setDescription(data.description);
        
        // Handle the type conversion from database to UI
        if (data.type === 'hybrid') {
          // Determine if it's small or large hybrid based on name/code
          if (data.name.includes('10.24kWh') || 
              data.code.includes('10K') || 
              data.description.includes('10.24kWh')) {
            setType('hybrid-large');
          } else {
            setType('hybrid-small');
          }
        } else {
          setType(data.type);
        }
        
        setWattage(data.wattage.toString());
        setSuitableFor(data.suitableFor);
        setFinancingPrice(data.financingPrice.toString());
        setSrpPrice(data.srpPrice.toString());
        setCashPrice(data.cashPrice.toString());
      } catch (error) {
        console.error('Failed to fetch package:', error);
        setError('Failed to load package. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    if (packageCode) {
      fetchPackage();
    }
  }, [packageCode]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Validation
    if (!name || !description || !type || !wattage || !suitableFor || 
        !financingPrice || !srpPrice || !cashPrice) {
      setError('All fields are required.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Convert UI type back to database type if needed
      let dbType = type;
      if (type === 'hybrid-small' || type === 'hybrid-large') {
        dbType = 'hybrid';
      }
      
      const response = await fetch(`/api/admin/packages/${packageCode}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer admin-token' // Replace with actual auth
        },
        body: JSON.stringify({
          name,
          description,
          type: dbType, // Send the correct type to the database
          wattage: parseInt(wattage),
          suitableFor,
          financingPrice: parseInt(financingPrice),
          srpPrice: parseInt(srpPrice),
          cashPrice: parseInt(cashPrice)
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Error: ${response.status}`);
      }

      // Redirect to chatbot admin page on success
      router.push('/admin/chatbot');
    } catch (error) {
      console.error('Failed to update package:', error);
      setError(error instanceof Error ? error.message : 'Failed to update package');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="mb-6">
            <Link href="/admin/chatbot?tab=packages" className="flex items-center text-blue-600 hover:text-blue-700 transition-colors duration-200 font-medium">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Back to Knowledge Base
            </Link>
          </div>
          <div className="flex justify-center items-center py-24">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
              <div className="animate-spin rounded-full h-16 w-16 border-l-2 border-blue-500 absolute top-0 opacity-60" style={{ animationDirection: 'reverse', animationDuration: '1s' }}></div>
            </div>
            <p className="ml-4 text-gray-600 font-medium">Loading package details...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="mb-6">
          <Link href="/admin/chatbot?tab=packages" className="flex items-center text-blue-600 hover:text-blue-700 transition-colors duration-200 font-medium">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to Knowledge Base
          </Link>
        </div>

        <div className="bg-white shadow-lg rounded-xl p-8 transition-all duration-300">
          <div className="mb-6 border-b border-gray-100 pb-4">
            <h1 className="text-2xl font-bold text-gray-800">Edit Package</h1>
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

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <label htmlFor="code" className="block text-sm font-medium text-gray-700">
                  Package Code
                </label>
                <div className="relative">
                  <input
                    id="code"
                    value={packageCode}
                    disabled
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg shadow-sm bg-gray-50 text-gray-500 font-mono"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                </div>
                <p className="text-sm text-gray-500">
                  Package code cannot be changed after creation
                </p>
              </div>

              <div className="space-y-3">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Package Name
                </label>
                <input
                  id="name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                  value={name}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                  placeholder="e.g., OnGrid Basic Package"
                  required
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">Package Type</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className={`border rounded-lg p-4 cursor-pointer transition-all duration-200 ${
                  type === 'ongrid' 
                    ? 'bg-gradient-to-r from-green-50 to-green-100 border-green-200 ring-2 ring-green-500 ring-opacity-50' 
                    : 'border-gray-200 hover:bg-gray-50'
                }`} onClick={() => setType('ongrid')}>
                  <div className="flex items-start mb-2">
                    <input
                      type="radio"
                      id="ongrid"
                      name="packageType"
                      value="ongrid"
                      checked={type === 'ongrid'}
                      onChange={() => setType('ongrid')}
                      className="h-5 w-5 text-green-600 focus:ring-green-500 mt-0.5"
                    />
                    <label htmlFor="ongrid" className="ml-2 cursor-pointer">
                      <span className="font-medium text-gray-800 block">OnGrid System</span>
                      <span className="text-sm text-gray-600">Grid-tied solar without battery</span>
                    </label>
                  </div>
                  <div className="ml-7 pl-2 border-l-2 border-green-200">
                    <span className="text-xs text-green-700 font-medium">Best for daytime power consumption</span>
                  </div>
                </div>
                
                <div className={`border rounded-lg p-4 cursor-pointer transition-all duration-200 ${
                  type === 'hybrid-small' 
                    ? 'bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200 ring-2 ring-blue-500 ring-opacity-50' 
                    : 'border-gray-200 hover:bg-gray-50'
                }`} onClick={() => setType('hybrid-small')}>
                  <div className="flex items-start mb-2">
                    <input
                      type="radio"
                      id="hybrid-small"
                      name="packageType"
                      value="hybrid-small"
                      checked={type === 'hybrid-small'}
                      onChange={() => setType('hybrid-small')}
                      className="h-5 w-5 text-blue-600 focus:ring-blue-500 mt-0.5"
                    />
                    <label htmlFor="hybrid-small" className="ml-2 cursor-pointer">
                      <span className="font-medium text-gray-800 block">Hybrid (5.12kWh)</span>
                      <span className="text-sm text-gray-600">Mid-range battery storage</span>
                    </label>
                  </div>
                  <div className="ml-7 pl-2 border-l-2 border-blue-200">
                    <span className="text-xs text-blue-700 font-medium">Standard backup power solution</span>
                  </div>
                </div>
                
                <div className={`border rounded-lg p-4 cursor-pointer transition-all duration-200 ${
                  type === 'hybrid-large' 
                    ? 'bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200 ring-2 ring-purple-500 ring-opacity-50' 
                    : 'border-gray-200 hover:bg-gray-50'
                }`} onClick={() => setType('hybrid-large')}>
                  <div className="flex items-start mb-2">
                    <input
                      type="radio"
                      id="hybrid-large"
                      name="packageType"
                      value="hybrid-large"
                      checked={type === 'hybrid-large'}
                      onChange={() => setType('hybrid-large')}
                      className="h-5 w-5 text-purple-600 focus:ring-purple-500 mt-0.5"
                    />
                    <label htmlFor="hybrid-large" className="ml-2 cursor-pointer">
                      <span className="font-medium text-gray-800 block">Hybrid (10.24kWh)</span>
                      <span className="text-sm text-gray-600">Large battery capacity</span>
                    </label>
                  </div>
                  <div className="ml-7 pl-2 border-l-2 border-purple-200">
                    <span className="text-xs text-purple-700 font-medium">Premium backup power solution</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-3">
                <label htmlFor="wattage" className="block text-sm font-medium text-gray-700">
                  Wattage
                </label>
                <div className="relative">
                  <input
                    id="wattage"
                    type="number"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                    value={wattage}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setWattage(e.target.value)}
                    placeholder="e.g., 5000"
                    required
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                </div>
                <p className="text-sm text-gray-500">
                  System power in watts
                </p>
              </div>

              <div className="space-y-3">
                <label htmlFor="suitableFor" className="block text-sm font-medium text-gray-700">
                  Suitable For
                </label>
                <input
                  id="suitableFor"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                  value={suitableFor}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSuitableFor(e.target.value)}
                  placeholder="e.g., Monthly electric bill ₱6,000-₱10,000"
                  required
                />
                <p className="text-sm text-gray-500">
                  Target customer description
                </p>
              </div>

              <div className="space-y-3">
                <label htmlFor="financingPrice" className="block text-sm font-medium text-gray-700">
                  Financing Price (₱)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <span className="text-gray-500">₱</span>
                  </div>
                  <input
                    id="financingPrice"
                    type="number"
                    className="w-full pl-8 px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                    value={financingPrice}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFinancingPrice(e.target.value)}
                    placeholder="e.g., 350000"
                    required
                  />
                </div>
                <p className="text-sm text-gray-500">
                  Price with financing
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <label htmlFor="srpPrice" className="block text-sm font-medium text-gray-700">
                  SRP Price (₱)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <span className="text-gray-500">₱</span>
                  </div>
                  <input
                    id="srpPrice"
                    type="number"
                    className="w-full pl-8 px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                    value={srpPrice}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSrpPrice(e.target.value)}
                    placeholder="e.g., 400000"
                    required
                  />
                </div>
                <p className="text-sm text-gray-500">
                  Suggested retail price
                </p>
              </div>

              <div className="space-y-3">
                <label htmlFor="cashPrice" className="block text-sm font-medium text-gray-700">
                  Cash Price (₱)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <span className="text-gray-500">₱</span>
                  </div>
                  <input
                    id="cashPrice"
                    type="number"
                    className="w-full pl-8 px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                    value={cashPrice}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCashPrice(e.target.value)}
                    placeholder="e.g., 380000"
                    required
                  />
                </div>
                <p className="text-sm text-gray-500">
                  Price for cash payments
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description (Markdown supported)
              </label>
              <textarea
                id="description"
                rows={5}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                value={description}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
                placeholder="Enter detailed package description. You can use markdown formatting."
                required
              />
              <p className="text-sm text-gray-500 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                You can use markdown formatting (e.g., **bold**, *italic*, bullet points, etc.)
              </p>
            </div>

            <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3 pt-4 border-t border-gray-100">
              <Link
                href="/admin/chatbot?tab=packages"
                className="px-6 py-3 bg-white text-gray-700 rounded-lg border border-gray-300 hover:bg-gray-50 font-medium transition-colors duration-200 text-center shadow-sm"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors duration-200 flex justify-center items-center shadow-sm ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Updating...
                  </>
                ) : 'Update Package'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 