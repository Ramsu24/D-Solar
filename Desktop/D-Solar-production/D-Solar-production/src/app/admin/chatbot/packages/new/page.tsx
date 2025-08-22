'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function NewPackagePage() {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('ongrid');
  const [wattage, setWattage] = useState('');
  const [suitableFor, setSuitableFor] = useState('');
  const [financingPrice, setFinancingPrice] = useState('');
  const [srpPrice, setSrpPrice] = useState('');
  const [cashPrice, setCashPrice] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Validation
    if (!code || !name || !description || !type || !wattage || !suitableFor || 
        !financingPrice || !srpPrice || !cashPrice) {
      setError('All fields are required.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/packages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer admin-token' // Replace with actual auth
        },
        body: JSON.stringify({
          code,
          name,
          description,
          type,
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
      router.push('/admin/chatbot?tab=packages');
    } catch (error) {
      console.error('Failed to create package:', error);
      setError(error instanceof Error ? error.message : 'Failed to create package');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <div className="mb-6">
        <Link href="/admin/chatbot?tab=packages" className="flex items-center text-blue-600 hover:text-blue-800">
          <span className="mr-2">←</span> Back to Knowledge Base
        </Link>
      </div>

      <div className="bg-white shadow-md rounded-lg p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Add New Package</h1>
        </div>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="code" className="block text-sm font-medium text-gray-700">
                Package Code
              </label>
              <input
                id="code"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={code}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCode(e.target.value.toUpperCase())}
                placeholder="e.g., ONG-2K-P1"
                required
              />
              <p className="text-sm text-gray-500">
                Unique package identifier (e.g., ONG-2K-P1)
              </p>
            </div>

            <div className="space-y-2">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Package Name
              </label>
              <input
                id="name"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                placeholder="e.g., OnGrid Basic Package"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Package Type</label>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center">
                <input
                  type="radio"
                  id="ongrid"
                  name="packageType"
                  value="ongrid"
                  checked={type === 'ongrid'}
                  onChange={() => setType('ongrid')}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="ongrid" className="ml-2 text-sm text-gray-700 cursor-pointer">
                  OnGrid System
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="radio"
                  id="hybrid-small"
                  name="packageType"
                  value="hybrid-small"
                  checked={type === 'hybrid-small'}
                  onChange={() => setType('hybrid-small')}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="hybrid-small" className="ml-2 text-sm text-gray-700 cursor-pointer">
                  Hybrid (5.12kWh Battery)
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="radio"
                  id="hybrid-large"
                  name="packageType"
                  value="hybrid-large"
                  checked={type === 'hybrid-large'}
                  onChange={() => setType('hybrid-large')}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="hybrid-large" className="ml-2 text-sm text-gray-700 cursor-pointer">
                  Hybrid (10.24kWh Battery)
                </label>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label htmlFor="wattage" className="block text-sm font-medium text-gray-700">
                Wattage
              </label>
              <input
                id="wattage"
                type="number"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={wattage}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setWattage(e.target.value)}
                placeholder="e.g., 2320"
                required
              />
              <p className="text-sm text-gray-500">
                System power in watts
              </p>
            </div>

            <div className="space-y-2">
              <label htmlFor="suitableFor" className="block text-sm font-medium text-gray-700">
                Suitable For
              </label>
              <input
                id="suitableFor"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={suitableFor}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSuitableFor(e.target.value)}
                placeholder="e.g., Bills around ₱2,500"
                required
              />
              <p className="text-sm text-gray-500">
                Target customer description
              </p>
            </div>

            <div className="space-y-2">
              <label htmlFor="financingPrice" className="block text-sm font-medium text-gray-700">
                Financing Price (₱)
              </label>
              <input
                id="financingPrice"
                type="number"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={financingPrice}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFinancingPrice(e.target.value)}
                placeholder="e.g., 124880"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="srpPrice" className="block text-sm font-medium text-gray-700">
                SRP Price (₱)
              </label>
              <input
                id="srpPrice"
                type="number"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={srpPrice}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSrpPrice(e.target.value)}
                placeholder="e.g., 111500"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="cashPrice" className="block text-sm font-medium text-gray-700">
                Cash Price (₱)
              </label>
              <input
                id="cashPrice"
                type="number"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={cashPrice}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCashPrice(e.target.value)}
                placeholder="e.g., 104800"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description (Markdown supported)
            </label>
            <textarea
              id="description"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={description}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
              placeholder="Detailed package description with features and benefits"
              required
              rows={4}
            />
            <p className="text-sm text-gray-500">
              You can use markdown formatting (e.g., **bold**, *italic*, bullet points, etc.)
            </p>
          </div>

          <div className="flex justify-end space-x-2">
            <Link href="/admin/chatbot?tab=packages">
              <button 
                type="button"
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
            </Link>
            <button 
              type="submit" 
              disabled={isSubmitting || !code || !name || !description || !type || !wattage || 
                        !suitableFor || !financingPrice || !srpPrice || !cashPrice}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Creating...' : 'Create Package'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 