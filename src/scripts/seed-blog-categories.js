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

async function seedBlogCategories() {
  try {
    console.log('Seeding blog categories...');
    
    for (const category of categories) {
      await sequelize.query(`
        INSERT IGNORE INTO blog_categories (name, slug, description, is_active, created_at, updated_at)
        VALUES (?, ?, ?, true, NOW(), NOW())
      `, {
        replacements: [category.name, category.slug, category.description]
      });
    }
    
    console.log('Blog categories seeded successfully!');
    
    // Show seeded categories
    const [results] = await sequelize.query('SELECT name FROM blog_categories ORDER BY name');
    console.log('Seeded categories:');
    results.forEach(row => console.log(`  - ${row.name}`));
    
  } catch (error) {
    console.error('Error seeding blog categories:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

// Run the seeding
seedBlogCategories()
  .then(() => {
    console.log('Seeding completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Seeding failed:', error);
    process.exit(1);
  }); 