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

// Define the tables manually
async function createBlogTables() {
  try {
    console.log('Creating blog tables...');

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

    console.log('Blog tables created successfully!');
    
    // Test the connection
    const [categories] = await sequelize.query('SELECT COUNT(*) as count FROM blog_categories');
    const [blogs] = await sequelize.query('SELECT COUNT(*) as count FROM blogs');
    
    console.log(`Tables created - Categories: ${categories[0].count}, Blogs: ${blogs[0].count}`);
    
  } catch (error) {
    console.error('Error creating blog tables:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

// Run the table creation
createBlogTables()
  .then(() => {
    console.log('Blog tables created successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Failed to create blog tables:', error);
    process.exit(1);
  }); 