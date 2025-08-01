# Blog Image Upload Implementation

This document describes the implementation of image upload functionality for the blog system.

## Features

- **File Upload**: Support for uploading image files (JPEG, JPG, PNG, GIF, WebP)
- **URL Support**: Support for providing image URLs
- **File Management**: Automatic cleanup of old image files when updating
- **Validation**: File type and size validation (max 5MB)
- **Storage**: Images are stored in `public/blog-images/` directory

## API Endpoints

### Create Blog with Image
```
POST /api/admin/blogs
Content-Type: multipart/form-data
Authorization: Bearer <admin-token>

Form Data:
- title: string (required)
- author_name: string (required)
- publish_date: string (required, YYYY-MM-DD format)
- read_time: string (required)
- keywords: string (optional)
- content: string (required)
- html_content: string (optional)
- category_id: string (required)
- is_active: string (required, "1" or "0")
- image: file (optional) - Image file to upload
- image_url: string (optional) - Image URL instead of file
```

### Update Blog with Image
```
PUT /api/admin/blogs/:id
Content-Type: multipart/form-data
Authorization: Bearer <admin-token>

Form Data:
- title: string (optional)
- author_name: string (optional)
- publish_date: string (optional, YYYY-MM-DD format)
- read_time: string (optional)
- keywords: string (optional)
- content: string (optional)
- html_content: string (optional)
- category_id: string (optional)
- is_published: string (optional, "1" or "0")
- image: file (optional) - Image file to upload
- image_url: string (optional) - Image URL instead of file
```

## Implementation Details

### File Storage
- Images are stored in `public/blog-images/` directory
- Filename format: `blog_image_<timestamp>_<random>.jpg`
- Old image files are automatically deleted when updating

### Database Schema
The `blogs` table has a `featured_image` field that stores:
- File path for uploaded images: `blog-images/filename.jpg`
- URL for external images: `https://example.com/image.jpg`
- NULL for blogs without images

### Error Handling
- File size limit: 5MB
- Supported formats: JPEG, JPG, PNG, GIF, WebP
- Invalid file type returns 400 error
- File too large returns 400 error

## Frontend Integration

The frontend can send either:
1. **File upload**: Include the image file in the form data
2. **Image URL**: Include the `image_url` field in the form data

### Example Frontend Usage

```javascript
// File upload
const formData = new FormData();
formData.append('title', 'Blog Title');
formData.append('image', fileInput.files[0]);

// Image URL
const formData = new FormData();
formData.append('title', 'Blog Title');
formData.append('image_url', 'https://example.com/image.jpg');
```

## Testing

Use the provided test script to verify functionality:

```bash
node test-blog-upload.js
```

Make sure to:
1. Update the `API_BASE_URL` in the test script
2. Replace `ADMIN_TOKEN` with a valid admin token
3. Create a test image file named `test-image.jpg` in the same directory

## Security Considerations

- File type validation prevents malicious file uploads
- File size limits prevent abuse
- Admin authentication required for all operations
- Old files are cleaned up to prevent disk space issues 