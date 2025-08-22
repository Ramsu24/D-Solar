'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  LucideFileImage, 
  LucideTag, 
  LucideChevronDown, 
  LucideAlertCircle, 
  LucideEye,
  LucideRotateCcw,
  LucideBold,
  LucideItalic,
  LucideHeading1,
  LucideHeading2,
  LucideList,
  LucideLink,
  LucideHelpCircle,
  LucideImage,
  LucideClock
} from "lucide-react";
import LoadingOverlay from '../../components/LoadingOverlay';
import { useDropzone } from 'react-dropzone';

// Tooltip component
const Tooltip = ({ children, text }: { children: React.ReactNode; text: string }) => (
  <div className="group relative inline-block">
    {children}
    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 absolute z-50 py-1 px-2 -top-2 left-full ml-2 w-auto min-w-[80px] max-w-[160px] bg-slate-800 text-white text-xs rounded-lg text-center whitespace-normal">
      {text}
      <div className="absolute -left-1 top-3 w-2 h-2 bg-slate-800 transform rotate-45"></div>
    </div>
  </div>
);

export default function CreateBlog() {
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [content, setContent] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('/default-blog-image.jpg');
  const [author, setAuthor] = useState('D-Solar Team');
  const [category, setCategory] = useState('Solar Energy');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [readingTime, setReadingTime] = useState(0);
  const [isDraggingImage, setIsDraggingImage] = useState(false);
  
  const router = useRouter();

  // Calculate reading time
  useEffect(() => {
    const wordsPerMinute = 200;
    const words = content.trim().split(/\s+/).length;
    setReadingTime(Math.ceil(words / wordsPerMinute));
  }, [content]);
  
  const categories = [
    'Solar Energy',
    'Renewable Energy',
    'Sustainability',
    'Technology',
    'Installation',
    'Energy Efficiency',
    'News',
    'Tips & Guides'
  ];

  // Image drop zone handling
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    multiple: false
  });
  
  // Format toolbar handlers
  const insertFormat = (format: string) => {
    const textarea = document.getElementById('content') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);

    let insertion = '';
    switch (format) {
      case 'bold':
        insertion = `**${selectedText}**`;
        break;
      case 'italic':
        insertion = `*${selectedText}*`;
        break;
      case 'h1':
        insertion = `# ${selectedText}`;
        break;
      case 'h2':
        insertion = `## ${selectedText}`;
        break;
      case 'list':
        insertion = `\n- ${selectedText}`;
        break;
      case 'link':
        insertion = `[${selectedText}](url)`;
        break;
    }

    const newContent = content.substring(0, start) + insertion + content.substring(end);
    setContent(newContent);
  };

  // Generate slug from title
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    
    // Auto-generate slug if user hasn't manually edited it
    if (!slug || slug === generateSlug(newTitle)) {
      setSlug(generateSlug(newTitle));
    }
  };
  
  // Generate slug from title
  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/gi, '')
      .replace(/\s+/g, '-');
  };
  
  // Handle adding tags
  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };
  
  // Handle removing tags
  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };
  
  // Auto-generate a short description if not provided
  const generateShortDescription = () => {
    if (content) {
      const description = content.slice(0, 150);
      setShortDescription(description + (content.length > 150 ? '...' : ''));
    }
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    
    try {
      // If no short description provided, auto-generate one
      const finalShortDescription = shortDescription || content.slice(0, 150) + (content.length > 150 ? '...' : '');
      
      const response = await fetch('/api/admin/blogs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          slug,
          content,
          shortDescription: finalShortDescription,
          imageUrl,
          author,
          category,
          tags
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create blog post');
      }
      
      // Redirect to blog list
      router.push('/admin/blogs');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setIsLoading(false);
    }
  };
  
  // Simple content preview with Markdown-like formatting
  const renderPreview = () => {
    // Very basic markdown parser (for headings, bold, italic, lists)
    const formattedContent = content
      .replace(/\n\n/g, '<br/><br/>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/^# (.*?)$/gm, '<h1 class="text-3xl font-bold my-4">$1</h1>')
      .replace(/^## (.*?)$/gm, '<h2 class="text-2xl font-bold my-3">$1</h2>')
      .replace(/^### (.*?)$/gm, '<h3 class="text-xl font-bold my-2">$1</h3>')
      .replace(/^\- (.*?)$/gm, '<li class="ml-4">$1</li>');
    
    return (
      <div className="preview-container bg-white rounded-lg p-8 shadow-lg">
        <h1 className="text-3xl font-bold mb-2">{title}</h1>
        <p className="text-gray-500 mb-4">By {author} • {new Date().toLocaleDateString()}</p>
        {imageUrl && <img src={imageUrl} alt={title} className="w-full h-64 object-cover rounded-lg mb-6" />}
        <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: formattedContent }} />
      </div>
    );
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-indigo-50 to-emerald-50">
      {isLoading && <LoadingOverlay message="Creating blog post..." />}
      <div className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-slate-800">Create New Blog Post</h1>
              <p className="mt-2 text-slate-600 flex items-center">
                <LucideClock className="w-4 h-4 mr-2" />
                Estimated reading time: {readingTime} min
              </p>
            </div>
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => setIsPreviewMode(!isPreviewMode)}
                className="inline-flex items-center px-6 py-3 border border-slate-200 rounded-lg shadow-sm text-base font-medium bg-white hover:bg-slate-50 text-slate-700 transition-all duration-200 hover:shadow-md"
              >
                <LucideEye className="mr-2 h-5 w-5" />
                {isPreviewMode ? 'Edit Mode' : 'Preview'}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg mb-8 animate-shake" role="alert">
              <p className="flex items-center">
                <LucideAlertCircle className="h-5 w-5 mr-2" />
                <span>{error}</span>
              </p>
            </div>
          )}

          {isPreviewMode ? (
            <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-slate-200">
              <div className="p-8">
                {renderPreview()}
                <div className="mt-8 flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => setIsPreviewMode(false)}
                    className="px-6 py-3 border border-slate-200 rounded-lg shadow-sm text-base font-medium text-slate-700 bg-white hover:bg-slate-50 transition-all duration-200 hover:shadow-md"
                  >
                    Continue Editing
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isLoading}
                    className="px-6 py-3 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 hover:shadow-md disabled:opacity-50"
                  >
                    {isLoading ? 'Creating...' : 'Create Blog Post'}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-white shadow-xl rounded-2xl overflow-hidden border border-slate-200">
              <div className="p-8 space-y-8">
                {/* Title and Slug Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label htmlFor="title" className="block text-sm font-medium text-slate-700">
                      Title *
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        id="title"
                        className="block w-full rounded-lg border-slate-200 shadow-sm focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-slate-300"
                        value={title}
                        onChange={handleTitleChange}
                        placeholder="Enter a compelling title"
                        required
                      />
                      <div className="absolute right-2 top-2">
                        <Tooltip text="Main post heading">
                          <LucideHelpCircle className="h-5 w-5 text-slate-400" />
                        </Tooltip>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="slug" className="block text-sm font-medium text-slate-700">
                      URL Slug *
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        id="slug"
                        className="block w-full rounded-lg border-slate-200 shadow-sm focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-slate-300"
                        value={slug}
                        onChange={(e) => setSlug(e.target.value)}
                        placeholder="your-post-url"
                        required
                      />
                      <div className="absolute right-2 top-2">
                        <Tooltip text="URL path for your post">
                          <LucideHelpCircle className="h-5 w-5 text-slate-400" />
                        </Tooltip>
                      </div>
                      <p className="mt-2 text-sm text-slate-500">
                        URL: /blogs/{slug}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Image Upload Section */}
                <div className="space-y-2">
                  <div className="flex items-center">
                    <label className="block text-sm font-medium text-slate-700">Featured Image</label>
                    <div className="ml-2">
                      <Tooltip text="Featured image">
                        <LucideHelpCircle className="h-4 w-4 text-slate-400" />
                      </Tooltip>
                    </div>
                  </div>
                  <div
                    {...getRootProps()}
                    className={`border-2 border-dashed rounded-lg p-6 transition-all duration-200 ${
                      isDragActive ? 'border-blue-500 bg-blue-50' : 'border-slate-300 hover:border-blue-400 bg-slate-50/50'
                    }`}
                  >
                    <input {...getInputProps()} />
                    <div className="text-center">
                      {imageUrl && imageUrl !== '/default-blog-image.jpg' ? (
                        <div className="space-y-4">
                          <img src={imageUrl} alt="Preview" className="mx-auto max-h-48 rounded-lg shadow-md" />
                          <p className="text-sm text-slate-500">Drag & drop a new image to replace</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="mx-auto flex flex-col items-center justify-center">
                            <LucideFileImage className="h-12 w-12 text-slate-400" />
                            <p className="mt-2 text-sm font-medium text-slate-600">Drag & drop an image here</p>
                            <p className="text-xs text-slate-500">or click to browse files</p>
                            <span className="mt-2 rounded-md bg-white px-3 py-1 text-xs text-slate-500 shadow-sm ring-1 ring-inset ring-slate-300">
                              JPG, PNG, GIF up to 5MB
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Content Editor Section */}
                <div className="space-y-2">
                  <div className="flex items-center">
                    <label htmlFor="content" className="block text-sm font-medium text-slate-700">
                      Content *
                    </label>
                    <div className="ml-2">
                      <Tooltip text="Content with markdown">
                        <LucideHelpCircle className="h-4 w-4 text-slate-400" />
                      </Tooltip>
                    </div>
                  </div>
                  <div className="border rounded-lg shadow-sm border-slate-200 bg-white">
                    <div className="flex items-center space-x-2 p-2 border-b border-slate-200 bg-slate-50">
                      <button
                        type="button"
                        onClick={() => insertFormat('bold')}
                        className="p-2 hover:bg-slate-200 rounded transition-colors duration-200"
                        title="Bold"
                      >
                        <LucideBold className="h-5 w-5 text-slate-700" />
                      </button>
                      <button
                        type="button"
                        onClick={() => insertFormat('italic')}
                        className="p-2 hover:bg-slate-200 rounded transition-colors duration-200"
                        title="Italic"
                      >
                        <LucideItalic className="h-5 w-5 text-slate-700" />
                      </button>
                      <div className="w-px h-6 bg-slate-300"></div>
                      <button
                        type="button"
                        onClick={() => insertFormat('h1')}
                        className="p-2 hover:bg-slate-200 rounded transition-colors duration-200"
                        title="Heading 1"
                      >
                        <LucideHeading1 className="h-5 w-5 text-slate-700" />
                      </button>
                      <button
                        type="button"
                        onClick={() => insertFormat('h2')}
                        className="p-2 hover:bg-slate-200 rounded transition-colors duration-200"
                        title="Heading 2"
                      >
                        <LucideHeading2 className="h-5 w-5 text-slate-700" />
                      </button>
                      <div className="w-px h-6 bg-slate-300"></div>
                      <button
                        type="button"
                        onClick={() => insertFormat('list')}
                        className="p-2 hover:bg-slate-200 rounded transition-colors duration-200"
                        title="List"
                      >
                        <LucideList className="h-5 w-5 text-slate-700" />
                      </button>
                      <button
                        type="button"
                        onClick={() => insertFormat('link')}
                        className="p-2 hover:bg-slate-200 rounded transition-colors duration-200"
                        title="Link"
                      >
                        <LucideLink className="h-5 w-5 text-slate-700" />
                      </button>
                    </div>
                    <textarea
                      id="content"
                      rows={15}
                      className="block w-full rounded-b-lg border-0 focus:ring-blue-500 font-mono transition-all duration-200 p-4 bg-white text-slate-800 placeholder-slate-400"
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="Write your blog post content here..."
                      required
                    />
                  </div>
                  <div className="flex justify-between text-sm text-slate-500">
                    <span>{content.length} characters</span>
                    <span>{content.trim().split(/\s+/).length} words</span>
                  </div>
                </div>

                {/* Tags Section */}
                <div>
                  <div className="flex items-center mb-2">
                    <label htmlFor="tags" className="block text-sm font-medium text-slate-700">
                      Tags
                    </label>
                    <div className="ml-2">
                      <Tooltip text="Post categories">
                        <LucideHelpCircle className="h-4 w-4 text-slate-400" />
                      </Tooltip>
                    </div>
                  </div>
                  <div className="flex rounded-lg shadow-sm">
                    <div className="relative flex items-stretch flex-grow focus-within:z-10">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <LucideTag className="h-5 w-5 text-slate-400" />
                      </div>
                      <input
                        type="text"
                        id="tags"
                        className="block w-full rounded-l-lg border-slate-200 pl-10 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-slate-300"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                        placeholder="Add a tag"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleAddTag}
                      className="inline-flex items-center px-4 py-2 rounded-r-lg border border-l-0 border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 transition-all duration-200"
                    >
                      Add Tag
                    </button>
                  </div>
                  {tags.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-50 text-blue-700 border border-blue-200"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(tag)}
                            className="ml-2 inline-flex items-center justify-center w-4 h-4 rounded-full text-blue-500 hover:bg-blue-200 hover:text-blue-700 focus:outline-none transition-colors duration-200"
                          >
                            <span className="sr-only">Remove {tag} tag</span>
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-4 pt-6">
                  <button
                    type="button"
                    onClick={() => router.push('/admin/blogs')}
                    className="px-6 py-3 border border-slate-200 rounded-lg shadow-sm text-base font-medium text-slate-700 bg-white hover:bg-slate-50 transition-all duration-200 hover:shadow-md"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsPreviewMode(true)}
                    className="px-6 py-3 border border-slate-200 rounded-lg shadow-sm text-base font-medium text-slate-700 bg-white hover:bg-slate-50 transition-all duration-200 hover:shadow-md"
                  >
                    Preview
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-6 py-3 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 hover:shadow-md disabled:opacity-50"
                  >
                    {isLoading ? 'Creating...' : 'Create Blog Post'}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
} 