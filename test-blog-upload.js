const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

// Test configuration
const API_BASE_URL = 'http://localhost:3000/api'; // Adjust to your API URL
const ADMIN_TOKEN = 'your-admin-token-here'; // Replace with actual admin token

async function testBlogImageUpload() {
  try {
    console.log('Testing blog image upload...');

    // Test 1: Create blog with image file
    console.log('\n1. Testing blog creation with image file...');
    
    const formData = new FormData();
    formData.append('title', 'Test Blog with Image');
    formData.append('author_name', 'Test Author');
    formData.append('publish_date', '2024-01-15');
    formData.append('read_time', '5');
    formData.append('keywords', 'test, blog, image');
    formData.append('content', 'This is a test blog content');
    formData.append('html_content', '<p>This is a test blog content</p>');
    formData.append('category_id', '1');
    formData.append('is_active', '1');
    
    // Add a test image file (you'll need to create this file)
    const testImagePath = path.join(__dirname, 'test-image.jpg');
    if (fs.existsSync(testImagePath)) {
      formData.append('image', fs.createReadStream(testImagePath));
    } else {
      console.log('Test image file not found, skipping file upload test');
    }

    const createResponse = await axios.post(`${API_BASE_URL}/admin/blogs`, formData, {
      headers: {
        'Authorization': `Bearer ${ADMIN_TOKEN}`,
        ...formData.getHeaders()
      }
    });

    console.log('Blog created successfully:', createResponse.data);
    const blogId = createResponse.data.data.blog.id;

    // Test 2: Update blog with image URL
    console.log('\n2. Testing blog update with image URL...');
    
    const updateFormData = new FormData();
    updateFormData.append('title', 'Updated Test Blog');
    updateFormData.append('author_name', 'Updated Author');
    updateFormData.append('publish_date', '2024-01-16');
    updateFormData.append('read_time', '7');
    updateFormData.append('keywords', 'updated, test, blog');
    updateFormData.append('content', 'This is updated test blog content');
    updateFormData.append('html_content', '<p>This is updated test blog content</p>');
    updateFormData.append('category_id', '1');
    updateFormData.append('is_published', '1');
    updateFormData.append('image_url', 'https://example.com/test-image.jpg');

    const updateResponse = await axios.put(`${API_BASE_URL}/admin/blogs/${blogId}`, updateFormData, {
      headers: {
        'Authorization': `Bearer ${ADMIN_TOKEN}`,
        ...updateFormData.getHeaders()
      }
    });

    console.log('Blog updated successfully:', updateResponse.data);

    // Test 3: Get blog details
    console.log('\n3. Testing blog retrieval...');
    
    const getResponse = await axios.get(`${API_BASE_URL}/admin/blogs/${blogId}`, {
      headers: {
        'Authorization': `Bearer ${ADMIN_TOKEN}`
      }
    });

    console.log('Blog retrieved successfully:', getResponse.data);

    console.log('\n✅ All tests passed!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Run the test
testBlogImageUpload(); 