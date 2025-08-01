# Blog System Setup Instructions

This guide explains how to set up the blog system for the Audio Mixing & Mastering platform, including database initialization and frontend integration.

## 🗄️ Database Setup

### 1. Database Tables
The blog system requires two main tables:

#### `blog_categories` Table
```sql
CREATE TABLE blog_categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

#### `blogs` Table
```sql
CREATE TABLE blogs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    author_name VARCHAR(255) NOT NULL,
    publish_date DATE NOT NULL,
    read_time INT NOT NULL,
    keywords TEXT,
    content LONGTEXT,
    html_content LONGTEXT,
    meta_description TEXT,
    featured_image VARCHAR(500),
    category_id INT,
    is_published TINYINT(1) DEFAULT 1,
    views INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES blog_categories(id) ON DELETE SET NULL
);
```

### 2. Initialize Blog Data

Run the following command to seed the database with sample blog categories and posts:

```bash
cd audio-mixing-master-backend-node
npm run seed-blog
```

This will create:
- **5 Blog Categories**: Audio Mixing, Music Production, Studio Equipment, Mastering, Industry Tips
- **10 Sample Blog Posts**: Each with featured images, content, and proper categorization

## 🔧 Backend API Endpoints

### Public Blog Endpoints
- `GET /api/blogs` - Get all published blog posts with pagination
- `GET /api/blogs/:slug` - Get specific blog post by slug
- `GET /api/blogs/categories` - Get all blog categories

### Admin Blog Endpoints
- `GET /api/admin/blogs` - Get all blogs (admin only)
- `POST /api/admin/blogs` - Create new blog post (admin only)
- `PUT /api/admin/blogs/:id` - Update blog post (admin only)
- `DELETE /api/admin/blogs/:id` - Delete blog post (admin only)
- `GET /api/admin/blog-categories` - Get all categories (admin only)
- `POST /api/admin/blog-categories` - Create new category (admin only)

## 🎨 Frontend Integration

### Updated Components

The frontend has been updated to fetch blog data from the database instead of using static JSON files:

#### 1. `useBlogPosts.js` Hook
- **Removed**: Dependency on `audioImages.json`
- **Added**: Fallback to default images when no `featured_image` is provided
- **Updated**: API calls to use proper backend endpoints

#### 2. `BlogPost.jsx` Component
- **Removed**: Dependency on `audioImages.json`
- **Added**: Default image fallback system
- **Updated**: Fetches blog data by slug from database

### Default Images
The system now uses a curated set of default images from Pexels when no featured image is provided:
- Professional audio studio images
- DJ and mixing equipment photos
- High-quality, relevant imagery

## 📝 Blog Post Structure

Each blog post in the database includes:

```javascript
{
    id: 1,
    title: "The History of Mixing and Mastering",
    slug: "the-history-of-mixing-and-mastering",
    author_name: "Audio Expert",
    publish_date: "2024-01-15",
    read_time: 8,
    content: "Brief description...",
    html_content: "<h2>Full HTML content...</h2>",
    keywords: "audio mixing, mastering, history",
    category_id: 1,
    is_published: 1,
    featured_image: "https://images.pexels.com/...",
    views: 0
}
```

## 🚀 Running the System

### 1. Start the Backend
```bash
cd audio-mixing-master-backend-node
npm install
npm run dev
```

### 2. Seed the Database
```bash
npm run seed-blog
```

### 3. Start the Frontend
```bash
cd audio-mixing-master-frontend
npm install
npm run dev
```

### 4. Access the Blog
- **Frontend**: `http://localhost:5173/blog`
- **Admin**: `http://localhost:5174/blog` (admin dashboard)

## 🔄 Adding New Blog Posts

### Via Admin Dashboard
1. Log into the admin dashboard
2. Navigate to Blog section
3. Click "Add New Post"
4. Fill in all required fields
5. Upload or provide a featured image URL
6. Publish the post

### Via Database
```sql
INSERT INTO blogs (
    title, slug, author_name, publish_date, read_time,
    content, html_content, keywords, category_id,
    is_published, featured_image
) VALUES (
    'Your Post Title',
    'your-post-slug',
    'Author Name',
    '2024-01-01',
    10,
    'Brief description...',
    '<h2>Full HTML content...</h2>',
    'keywords, here',
    1,
    1,
    'https://your-image-url.com/image.jpg'
);
```

## 🎯 Key Features

### ✅ Implemented
- Database-driven blog system
- Featured images with fallbacks
- Category filtering
- Pagination
- SEO-friendly slugs
- View counting
- Admin management interface

### 🔄 Editable via Admin
- Blog post creation and editing
- Category management
- Featured image uploads
- Content management
- Publishing controls

### 📱 Frontend Features
- Responsive blog listing
- Individual blog post pages
- Category filtering
- Search functionality
- Related posts
- Social sharing

## 🛠️ Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Check your database configuration in `.env`
   - Ensure MySQL is running
   - Verify database exists

2. **Blog Posts Not Loading**
   - Check if the backend is running
   - Verify API endpoints are accessible
   - Check browser console for errors

3. **Images Not Displaying**
   - Verify image URLs are accessible
   - Check if fallback images are working
   - Ensure proper CORS configuration

### Debug Commands
```bash
# Check database connection
npm run dev

# Reset and reseed database
npm run seed-blog

# Check API endpoints
curl http://localhost:3000/api/blogs
```

## 📊 Sample Data Included

The seeding script creates 10 comprehensive blog posts covering:
- Audio mixing techniques
- Music production tips
- Studio equipment guides
- Mastering tutorials
- Industry insights

Each post includes:
- Professional content
- Featured images
- Proper categorization
- SEO-friendly slugs
- Read time estimates

This setup provides a complete, production-ready blog system that can be easily managed through the admin interface. 