const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('./config/database');
const authMiddleware = require('./middleware/auth');
const userRoutes = require('./routes/users');
const taskRoutes = require('./routes/tasks');

// Load environment variables from .env file
require('dotenv').config();

const app = express();

// Middleware
app.use(bodyParser.json());

// Routes
app.use('/users', userRoutes);
app.use('/tasks', authMiddleware, taskRoutes); // Auth middleware protects task routes

// Register a new user
app.post('/register', async (req, res) => {
    const { username, password } = req.body;
  
    try {
      // Check if password is provided
      if (!username || !password) {
         return res.status(400).json({ error: 'Username and password are required' }); 
        }
  
      // Hash the password before storing it
      const saltRounds = 10; // You can adjust this value as needed
      const hashedPassword = await bcrypt.hash(password, saltRounds);
  
      // Insert the user into the database with hashed password
      const [result] = await db.query(
        'INSERT INTO users (username, password) VALUES (?, ?)',
        [username, hashedPassword]
      );
  
      res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
      console.error('Error registering user:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  

// Login user and generate JWT token
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    // Fetch user from database
    const [rows] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
    const user = rows[0];

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user.id, username: user.username }, process.env.JWT_SECRET, {
      expiresIn: '1h'
    });

    res.status(200).json({ token });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
