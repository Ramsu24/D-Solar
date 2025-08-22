// Script to update all blog posts with author "DSolar Team" to "D-Solar Team"
const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

async function updateBlogAuthors() {
  const uri = process.env.MONGODB_URI;
  
  if (!uri) {
    console.error('MONGODB_URI environment variable is not set');
    process.exit(1);
  }
  
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db('dsolar');
    const blogsCollection = db.collection('blogs');
    
    // Find all blog posts with author "DSolar Team"
    const query = { author: 'DSolar Team' };
    const blogCount = await blogsCollection.countDocuments(query);
    
    if (blogCount === 0) {
      console.log('No blog posts found with author "DSolar Team"');
      return;
    }
    
    console.log(`Found ${blogCount} blog posts with author "DSolar Team"`);
    
    // Update all matching blog posts
    const result = await blogsCollection.updateMany(
      query,
      { $set: { author: 'D-Solar Team' } }
    );
    
    console.log(`Updated ${result.modifiedCount} blog posts`);
    
  } catch (error) {
    console.error('Error updating blog authors:', error);
  } finally {
    await client.close();
    console.log('Disconnected from MongoDB');
  }
}

updateBlogAuthors().catch(console.error); 