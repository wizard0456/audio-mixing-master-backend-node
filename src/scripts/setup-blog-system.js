const { Sequelize } = require('sequelize');
require('dotenv').config();

// Create Sequelize instance
const sequelize = new Sequelize(
  process.env.DB_DATABASE,
  process.env.DB_USERNAME,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT),
    dialect: 'mysql',
    logging: false
  }
);

const categories = [
  { name: 'All Blog', slug: 'all-blog', description: 'All blog posts' },
  { name: 'How to connect Analog Gear?', slug: 'how-to-connect-analog-gear', description: 'Tips and guides for connecting analog gear' },
  { name: 'How to Export Stems?', slug: 'how-to-export-stems', description: 'Tutorials on exporting stems' },
  { name: 'Mastering Tip', slug: 'mastering-tip', description: 'Mastering tips and techniques' },
  { name: 'Mixing & Mastering', slug: 'mixing-mastering', description: 'Mixing and mastering techniques' },
  { name: 'Mixing Tip', slug: 'mixing-tip', description: 'Mixing tips and tricks' },
  { name: 'Mixing Tips & Tricks!', slug: 'mixing-tips-tricks', description: 'Advanced mixing tips and tricks' },
  { name: 'Music Production Tips', slug: 'music-production-tips', description: 'General music production tips' },
  { name: 'Networking & Music Industry', slug: 'networking-music-industry', description: 'Networking and music industry advice' },
  { name: 'Recording Tips & Tricks', slug: 'recording-tips-tricks', description: 'Recording tips and techniques' }
];

async function createBlogTables() {
  try {
    console.log('📊 Creating database tables...');

    // Create blog_categories table
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS blog_categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL UNIQUE,
        description TEXT,
        is_active BOOLEAN NOT NULL DEFAULT true,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Create blogs table
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS blogs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(500) NOT NULL,
        slug VARCHAR(500) NOT NULL UNIQUE,
        author_name VARCHAR(255) NOT NULL,
        publish_date DATETIME NOT NULL,
        read_time INT NOT NULL DEFAULT 5,
        content TEXT NOT NULL,
        html_content LONGTEXT NOT NULL,
        keywords TEXT,
        meta_description TEXT,
        featured_image VARCHAR(500),
        category_id INT NOT NULL,
        is_published BOOLEAN NOT NULL DEFAULT false,
        views INT NOT NULL DEFAULT 0,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES blog_categories(id)
      )
    `);

    console.log('✅ Blog tables created successfully!');
    
  } catch (error) {
    console.error('❌ Error creating blog tables:', error);
    throw error;
  }
}

async function seedBlogCategories() {
  try {
    console.log('🌱 Seeding blog categories...');
    
    for (const category of categories) {
      await sequelize.query(`
        INSERT IGNORE INTO blog_categories (name, slug, description, is_active, created_at, updated_at)
        VALUES (?, ?, ?, true, NOW(), NOW())
      `, {
        replacements: [category.name, category.slug, category.description]
      });
    }
    
    console.log('✅ Blog categories seeded successfully!');
    
    // Show seeded categories
    const [results] = await sequelize.query('SELECT name FROM blog_categories ORDER BY name');
    console.log('�� Seeded categories:');
    results.forEach(row => console.log(`  - ${row.name}`));
    
  } catch (error) {
    console.error('❌ Error seeding blog categories:', error);
    throw error;
  }
}

async function setupBlogSystem() {
  try {
    console.log('🚀 Setting up blog system...');
    
    // Step 1: Create database tables
    await createBlogTables();
    
    // Step 2: Seed blog categories
    await seedBlogCategories();
    
    console.log('✅ Blog system setup completed successfully!');
    console.log('');
    console.log('📋 Available API endpoints:');
    console.log('  GET  /api/blogs - List all blogs');
    console.log('  GET  /api/blogs/categories - Get categories');
    console.log('  GET  /api/blogs/stats - Get statistics');
    console.log('  GET  /api/blogs/:id - Get blog by ID/slug');
    console.log('  POST /api/blogs - Create blog (admin)');
    console.log('  PUT  /api/blogs/:id - Update blog (admin)');
    console.log('  DELETE /api/blogs/:id - Delete blog (admin)');
    console.log('  POST /api/blogs/:blog_id/upload-html - Upload HTML file (admin)');
    console.log('');
    console.log('🔧 Admin endpoints:');
    console.log('  GET  /api/admin/blogs - Admin blog list');
    console.log('  GET  /api/admin/blog-categories - Get categories');
    console.log('  POST /api/admin/blog-categories - Create category');
    console.log('  PUT  /api/admin/blog-categories/:id - Update category');
    console.log('  DELETE /api/admin/blog-categories/:id - Delete category');
    
  } catch (error) {
    console.error('❌ Blog system setup failed:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

// Run the setup
setupBlogSystem()
  .then(() => {
    console.log('🎉 Setup completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Setup failed:', error);
    process.exit(1);
  }); 