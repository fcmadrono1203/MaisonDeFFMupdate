require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Import routes
const bookingRoutes = require('./routes/bookingRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const promoRoutes = require('./routes/promoRoutes');
const authRoutes = require('./routes/authRoutes');
const beauticianRoutes = require('./routes/beauticianRoutes');

const app = express();

// Connect to database
connectDB();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/', (req, res) => {
  res.json({
    message: 'Maison De FFM Beauty Salon API',
    version: '1.0.0',
    endpoints: {
      bookings: '/api/bookings',
      services: '/api/services',
      promos: '/api/promos',
      auth: '/api/auth',
      beauticians: '/api/beauticians',
    },
  });
});

// API Routes
app.use('/api/bookings', bookingRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/promos', promoRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/beauticians', beauticianRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  errorHandler(res, err.status || 500, err.message || 'Internal Server Error');
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
