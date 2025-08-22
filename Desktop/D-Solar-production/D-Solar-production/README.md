# D-Solar Website

## MongoDB Setup

1. Create a MongoDB Atlas account or use an existing MongoDB instance
2. Create a new cluster and database
3. Copy the connection string from MongoDB Atlas
4. Create a `.env` file in the root directory
5. Copy the contents from `.env.example` to `.env`
6. Replace the MongoDB connection string with your actual connection string

## Initial Admin Setup

After setting up MongoDB, you'll need to create your first admin user. You can do this by running the following commands in your MongoDB shell or MongoDB Compass:

```javascript
use your-database-name

db.admins.insertOne({
  username: "admin",
  passwordHash: "5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8", // This is the hash for "password"
  name: "Admin User",
  email: "admin@dsolar.com"
})
```

**Note:** Make sure to change the default admin password after first login!

## Development

```bash
# Install dependencies
npm install

# Run the development server
npm run dev
```

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```
MONGODB_URI=your_mongodb_connection_string
NEXT_PUBLIC_DOMAIN=your_domain (for production)
NODE_ENV=development
```

## Features

- MongoDB integration for data persistence
- Secure admin authentication
- Blog management system
- Responsive design
- SEO optimized

## Security Notes

- All passwords are hashed using SHA-256
- Admin sessions are managed using HTTP-only cookies
- Database connections are pooled and cached for better performance
- Proper error handling and validation

## Production Deployment

1. Update environment variables for production
2. Build the application:
   ```bash
   npm run build
   ```
3. Start the production server:
   ```bash
   npm start
   ```

## License

[Your License]
