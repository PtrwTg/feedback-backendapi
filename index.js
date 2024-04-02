const Feedback = require('./feedbackModel');
const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const cors = require('cors');
require('dotenv').config();

// Import Feedback Model
const Feedback = require('./feedbackModel');

const app = express();
app.use(express.json());
app.use(cors());
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {});

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure Multer for file upload
const upload = multer({ dest: 'uploads/' });

// Create API endpoints
app.post('/api/feedback', upload.single('songFile'), async (req, res) => {
  try {
    const { songName, prediction, accuracy } = req.body;
    const result = await cloudinary.uploader.upload(req.file.path, {
      resource_type: 'raw',
    });

    const feedback = new Feedback({
      songName,
      songUrl: result.url,
      prediction,
      accuracy,
    });

    await feedback.save();
    res.status(201).json(feedback);
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ error: 'An error occurred' });
  }
});

app.get('/api/feedback', async (req, res) => {
  try {
    const feedbacks = await Feedback.find();
    res.json(feedbacks);
  } catch (error) {
    console.error('Error retrieving feedbacks:', error);
    res.status(500).json({ error: 'An error occurred' });
  }
});

// Start the server
const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});