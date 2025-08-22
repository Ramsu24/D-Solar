'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function NewFAQPage() {
  const router = useRouter();
  const [id, setId] = useState('');
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [keyword, setKeyword] = useState('');
  const [keywords, setKeywords] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateId = () => {
    // Generate a kebab-case ID from the question
    if (question) {
      const newId = question
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .substring(0, 50);
      setId(newId);
    }
  };

  const addKeyword = () => {
    if (keyword && !keywords.includes(keyword)) {
      setKeywords([...keywords, keyword]);
      setKeyword('');
    }
  };

  const removeKeyword = (index: number) => {
    setKeywords(keywords.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!id || !question || !answer || keywords.length === 0) {
      setError('All fields are required and at least one keyword must be added.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/faqs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer admin-token' // Replace with actual auth
        },
        body: JSON.stringify({
          id,
          question,
          answer,
          keywords
        })
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || `Error: ${response.status}`);
      }

      // Redirect to chatbot admin page on success with the faqs tab active
      router.push('/admin/chatbot?tab=faqs');
    } catch (error) {
      console.error('Failed to create FAQ:', error);
      setError(error instanceof Error ? error.message : 'Failed to create FAQ');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-6">
        <Link href="/admin/chatbot?tab=faqs" className="text-blue-600 hover:text-blue-800 flex items-center">
          <span className="mr-2">←</span> Back to Knowledge Base
        </Link>
      </div>

      <div className="bg-white shadow-lg border border-gray-100 rounded-lg overflow-hidden">
        <div className="bg-green-600 px-6 py-4">
          <h1 className="text-2xl font-bold text-white">Add New FAQ</h1>
        </div>
        
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
            <p className="font-medium">Error</p>
            <p>{error}</p>
          </div>
        )}

        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="question" className="block font-medium text-gray-700">Question</label>
              <input
                id="question"
                value={question}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuestion(e.target.value)}
                placeholder="Enter the question"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="id" className="block font-medium text-gray-700">
                ID
                <button 
                  type="button" 
                  onClick={generateId}
                  className="ml-2 px-2 py-1 text-xs bg-gray-200 rounded hover:bg-gray-300 transition-colors duration-200"
                >
                  Generate from Question
                </button>
              </label>
              <input
                id="id"
                value={id}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setId(e.target.value.replace(/\s+/g, '-').toLowerCase())}
                placeholder="Enter a unique ID for the FAQ (kebab-case)"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="text-sm text-gray-500">
                Use a unique, kebab-case ID (e.g., "frequently-asked-question")
              </p>
            </div>

            <div className="space-y-2">
              <label htmlFor="answer" className="block font-medium text-gray-700">Answer (Markdown supported)</label>
              <textarea
                id="answer"
                value={answer}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setAnswer(e.target.value)}
                placeholder="Enter the answer in markdown format"
                required
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="text-sm text-gray-500">
                You can use markdown formatting (e.g., **bold**, *italic*, bullet points, etc.)
              </p>
            </div>

            <div className="space-y-2">
              <label htmlFor="keywords" className="block font-medium text-gray-700">Keywords</label>
              <div className="flex gap-2">
                <input
                  id="keyword"
                  value={keyword}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setKeyword(e.target.value)}
                  placeholder="Enter a keyword"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addKeyword();
                    }
                  }}
                />
                <button 
                  type="button" 
                  onClick={addKeyword}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors duration-200"
                >
                  Add
                </button>
              </div>
              <p className="text-sm text-gray-500">
                Add keywords that will help match user questions to this FAQ
              </p>

              {keywords.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {keywords.map((kw, index) => (
                    <div 
                      key={index} 
                      className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full transition-colors duration-200 hover:bg-blue-200"
                    >
                      <span>{kw}</span>
                      <button
                        type="button"
                        onClick={() => removeKeyword(index)}
                        className="text-blue-800 hover:text-blue-900 font-bold"
                        aria-label={`Remove keyword ${kw}`}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
              <Link href="/admin/chatbot?tab=faqs">
                <button type="button" className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200">
                  Cancel
                </button>
              </Link>
              <button 
                type="submit" 
                disabled={isSubmitting || !id || !question || !answer || keywords.length === 0}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 transition-colors duration-200 flex items-center"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating...
                  </>
                ) : 'Create FAQ'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 