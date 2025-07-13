const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const http = require('http');

// Load .env variables early
dotenv.config();

const app = express();
const server = http.createServer(app);
const io = require('socket.io')(server, {
  cors: {
    origin: '*',
  },
});

// Middleware
app.use(cors());
app.use(express.json());

// Attach socket.io to each request
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Routes
const sensorRoutes = require('./routes/sensorRoutes');
const actuatorRoutes = require('./routes/actuatorRoutes');

app.use('/api', sensorRoutes);
app.use('/api', actuatorRoutes);

// ✅ Validate MONGO_URI before connecting
const mongoURI = process.env.MONGO_URI;

if (!mongoURI) {
  console.error('❌ MONGO_URI is not defined in the .env file');
  process.exit(1); // Exit the app if no URI is set
}

// Connect to MongoDB
mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('✅ MongoDB Connected'))
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1); // Exit if Mongo fails to connect
  });

// Start server
const PORT = process.env.PORT || 5003;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
