const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// MongoDB Connection
mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Resource Schema
const resourceSchema = new mongoose.Schema({
  subjectName: String,
  unitName: String,
  topic: String,
  extraInfo: String,
  pdfPath: String,
  createdAt: { type: Date, default: Date.now }
});

const Resource = mongoose.model('Resource', resourceSchema);

// Multer configuration for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Admin route to add resource
app.post('/api/resources', upload.single('pdf'), async (req, res) => {
  try {
    const { subjectName, unitName, topic, extraInfo, secretCode } = req.body;

    // Verify admin secret code
    if (secretCode !== 'jaipubg123') {
      return res.status(401).json({ message: 'Invalid admin code' });
    }

    const newResource = new Resource({
      subjectName,
      unitName,
      topic,
      extraInfo,
      pdfPath: req.file ? `/uploads/${req.file.filename}` : null
    });

    await newResource.save();
    res.status(201).json({ message: 'Resource added successfully', resource: newResource });
  } catch (error) {
    res.status(500).json({ message: 'Error adding resource', error: error.message });
  }
});

// Route to get all resources
app.get('/api/resources', async (req, res) => {
  try {
    const resources = await Resource.find().sort({ createdAt: -1 });
    res.json(resources);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching resources', error: error.message });
  }
});

// Route to delete a resource
app.delete('/api/resources/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { secretCode } = req.body;

    // Verify admin secret code
    if (secretCode !== 'jaipubg123') {
      return res.status(401).json({ message: 'Invalid admin code' });
    }

    const resource = await Resource.findById(id);
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    // Delete the PDF file if it exists
    if (resource.pdfPath) {
      const filePath = path.join(__dirname, resource.pdfPath);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await Resource.findByIdAndDelete(id);
    res.json({ message: 'Resource deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting resource', error: error.message });
  }
});

// Route to update a resource
app.put('/api/resources/:id', upload.single('pdf'), async (req, res) => {
  try {
    const { id } = req.params;
    const { subjectName, unitName, topic, extraInfo, secretCode } = req.body;

    // Verify admin secret code
    if (secretCode !== 'jaipubg123') {
      return res.status(401).json({ message: 'Invalid admin code' });
    }

    const resource = await Resource.findById(id);
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    // Update resource fields
    resource.subjectName = subjectName;
    resource.unitName = unitName;
    resource.topic = topic;
    resource.extraInfo = extraInfo;

    // If a new PDF is uploaded, update the pdfPath
    if (req.file) {
      // Delete the old PDF file if it exists
      if (resource.pdfPath) {
        const oldFilePath = path.join(__dirname, resource.pdfPath);
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
        }
      }
      resource.pdfPath = `/uploads/${req.file.filename}`;
    }

    await resource.save();
    res.json({ message: 'Resource updated successfully', resource });
  } catch (error) {
    res.status(500).json({ message: 'Error updating resource', error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
