import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

// Path to data files
const blogsPath = path.join(process.cwd(), 'src/data/blogPosts.json');
const adminsPath = path.join(process.cwd(), 'src/data/admins.json');

// Blog post interface
export interface BlogPost {
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

// Admin interface
export interface Admin {
  id: string;
  username: string;
  passwordHash: string;
  name: string;
  email: string;
}

// Get all blog posts
export function getAllBlogPosts(): BlogPost[] {
  try {
    const data = fs.readFileSync(blogsPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading blog posts:', error);
    return [];
  }
}

// Get a single blog post by slug
export function getBlogPostBySlug(slug: string): BlogPost | null {
  const posts = getAllBlogPosts();
  return posts.find(post => post.slug === slug) || null;
}

// Create a new blog post
export function createBlogPost(post: Omit<BlogPost, 'id' | 'createdAt' | 'updatedAt'>): BlogPost {
  const posts = getAllBlogPosts();
  
  const newPost: BlogPost = {
    ...post,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  const updatedPosts = [...posts, newPost];
  fs.writeFileSync(blogsPath, JSON.stringify(updatedPosts, null, 2));
  
  return newPost;
}

// Update an existing blog post
export function updateBlogPost(id: string, updates: Partial<Omit<BlogPost, 'id' | 'createdAt'>>): BlogPost | null {
  const posts = getAllBlogPosts();
  const postIndex = posts.findIndex(post => post.id === id);
  
  if (postIndex === -1) return null;
  
  const updatedPost = {
    ...posts[postIndex],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  
  posts[postIndex] = updatedPost;
  fs.writeFileSync(blogsPath, JSON.stringify(posts, null, 2));
  
  return updatedPost;
}

// Delete a blog post
export function deleteBlogPost(id: string): boolean {
  const posts = getAllBlogPosts();
  const filteredPosts = posts.filter(post => post.id !== id);
  
  if (filteredPosts.length === posts.length) return false;
  
  fs.writeFileSync(blogsPath, JSON.stringify(filteredPosts, null, 2));
  return true;
}

// Admin authentication functions
export function authenticateAdmin(username: string, password: string): Admin | null {
  try {
    const data = fs.readFileSync(adminsPath, 'utf8');
    const admins: Admin[] = JSON.parse(data);
    
    // Hash the provided password
    const passwordHash = crypto
      .createHash('sha256')
      .update(password)
      .digest('hex');
    
    // Find admin with matching credentials
    const admin = admins.find(
      admin => admin.username === username && admin.passwordHash === passwordHash
    );
    
    return admin || null;
  } catch (error) {
    console.error('Error authenticating admin:', error);
    return null;
  }
}

// Function to check if a session is valid
export function getAdminByUsername(username: string): Admin | null {
  try {
    const data = fs.readFileSync(adminsPath, 'utf8');
    const admins: Admin[] = JSON.parse(data);
    return admins.find(admin => admin.username === username) || null;
  } catch (error) {
    console.error('Error getting admin:', error);
    return null;
  }
} 