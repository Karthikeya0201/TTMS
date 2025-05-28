import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import errorHandler from './middleware/errorHandler.js';
import routes from './routes/index.js';
import { logger } from './utils/logger.js';
import cors from 'cors';
import mongoose from 'mongoose';
import User from './models/User.js'; // Import User model
// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Middleware
app.use(
  cors({
    origin: "https://timetablemanage.vercel.app",
    credentials: true, // if using cookies or sessions
  })
);
app.use(express.json()); // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

// Connect to MongoDB
// connectDB();
const addUsers = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    // Define users to add
    const users = [
      {
        name: 'Admin User',
        email: 'admin@institute.edu',
        password: 'admin123',
        role: 'admin',
      },
      {
        name: 'Faculty User',
        email: 'faculty@institute.edu',
        password: 'faculty123',
        role: 'faculty',
      },
      {
        name: 'John Doe',
        email: 'john.doe@institute.edu',
        password: 'john2023',
        role: 'faculty',
      },
      {
        name: 'Jane Smith',
        email: 'jane.smith@institute.edu',
        password: 'jane2023',
        role: 'admin',
      },
    ];

    // Check for existing users to avoid duplicates
    for (const userData of users) {
      const existingUser = await User.findOne({ email: userData.email });
      if (existingUser) {
        console.log(`User with email ${userData.email} already exists. Skipping...`);
        continue;
      }

      // Create new user
      const user = new User(userData);
      await user.save();
      console.log(`User ${userData.email} added successfully`);
    }

    console.log('All users processed successfully');
  } catch (error) {
    console.error('Error adding users:', error);
  } 
};

addUsers();

// API Routes
app.use('/api', routes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({ message: 'Time Table Management System API' });
});

// Error Handling Middleware
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});