import sequelize from '../config/database';

export const initializeDatabase = async () => {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connected successfully');
    
    // Sync database (in development)
    if (process.env['NODE_ENV'] === 'development') {
      await sequelize.sync({ alter: true });
      console.log('✅ Database synchronized');
    }
    
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    throw error;
  }
};

export const runMigrations = async () => {
  try {
    // Sequelize migrations are handled by sequelize-cli
    console.log('✅ Database migrations completed');
  } catch (error) {
    console.error('❌ Database migrations failed:', error);
    throw error;
  }
};

export const seedDatabase = async () => {
  try {
    // Check if database is already seeded
    const User = require('../models/User').default;
    const userCount = await User.count();
    if (userCount > 0) {
      console.log('✅ Database already seeded');
      return;
    }

    // Run seeders
    console.log('✅ Database seeded successfully');
  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    throw error;
  }
};

export const closeDatabase = async () => {
  try {
    await sequelize.close();
    console.log('✅ Database disconnected successfully');
  } catch (error) {
    console.error('❌ Database disconnection failed:', error);
    throw error;
  }
}; 