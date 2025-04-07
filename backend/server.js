const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();

// CORS configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Serve static files
app.use('/uploads', express.static(uploadsDir));

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://vinayd679:jaipubg123@cluster0.0xolvoa.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
mongoose.connect(MONGODB_URI)
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// User Schema
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['admin', 'student'], required: true }
});

// Course Material Schema
const courseMaterialSchema = new mongoose.Schema({
    courseName: { type: String, required: true },
    topic: { type: String, required: true },
    date: { type: Date, required: true },
    unitName: { type: String, required: true },
    extraInfo: { type: String },
    pdfPath: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);
const CourseMaterial = mongoose.model('CourseMaterial', courseMaterialSchema);

// Routes
app.post('/api/login', async (req, res) => {
    try {
        const { username, password, role } = req.body;
        console.log('Login attempt:', { username, role });

        const user = await User.findOne({ username, role });
        if (!user) {
            console.log('User not found:', { username, role });
            return res.status(401).json({ message: 'Invalid username or role' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            console.log('Password mismatch for user:', username);
            return res.status(401).json({ message: 'Invalid password' });
        }

        console.log('Login successful for user:', username);
        res.json({ 
            message: 'Login successful',
            user: {
                username: user.username,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Upload course material
app.post('/api/upload', upload.single('pdfFile'), async (req, res) => {
    try {
        const { courseName, topic, date, unitName, extraInfo } = req.body;
        
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const courseMaterial = new CourseMaterial({
            courseName,
            topic,
            date,
            unitName,
            extraInfo,
            pdfPath: req.file.path
        });

        await courseMaterial.save();
        res.json({ message: 'Course material uploaded successfully' });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ message: 'Error uploading course material', error: error.message });
    }
});

// Get all course materials
app.get('/api/course-materials', async (req, res) => {
    try {
        const materials = await CourseMaterial.find().sort({ createdAt: -1 });
        res.json(materials);
    } catch (error) {
        console.error('Error fetching course materials:', error);
        res.status(500).json({ message: 'Error fetching course materials', error: error.message });
    }
});

// Delete course material
app.delete('/api/course-materials/:id', async (req, res) => {
    try {
        const material = await CourseMaterial.findById(req.params.id);
        if (!material) {
            return res.status(404).json({ message: 'Course material not found' });
        }

        // Delete the PDF file
        if (fs.existsSync(material.pdfPath)) {
            fs.unlinkSync(material.pdfPath);
        }

        await CourseMaterial.findByIdAndDelete(req.params.id);
        res.json({ message: 'Course material deleted successfully' });
    } catch (error) {
        console.error('Delete error:', error);
        res.status(500).json({ message: 'Error deleting course material', error: error.message });
    }
});

// Update course material
app.put('/api/course-materials/:id', upload.single('pdfFile'), async (req, res) => {
    try {
        const { courseName, topic, date, unitName, extraInfo } = req.body;
        const updateData = {
            courseName,
            topic,
            date,
            unitName,
            extraInfo
        };

        // If a new file is uploaded, update the pdfPath
        if (req.file) {
            // Delete the old file
            const material = await CourseMaterial.findById(req.params.id);
            if (material && fs.existsSync(material.pdfPath)) {
                fs.unlinkSync(material.pdfPath);
            }
            updateData.pdfPath = req.file.path;
        }

        const updatedMaterial = await CourseMaterial.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        );

        if (!updatedMaterial) {
            return res.status(404).json({ message: 'Course material not found' });
        }

        res.json({ message: 'Course material updated successfully', material: updatedMaterial });
    } catch (error) {
        console.error('Update error:', error);
        res.status(500).json({ message: 'Error updating course material', error: error.message });
    }
});

// Create sample users (for testing)
const createSampleUsers = async () => {
    try {
        const adminExists = await User.findOne({ username: 'admin' });
        const studentExists = await User.findOne({ username: 'student' });

        if (!adminExists) {
            const hashedAdminPassword = await bcrypt.hash('admin123', 10);
            await User.create({
                username: 'admin',
                password: hashedAdminPassword,
                role: 'admin'
            });
        }

        if (!studentExists) {
            const hashedStudentPassword = await bcrypt.hash('student123', 10);
            await User.create({
                username: 'student',
                password: hashedStudentPassword,
                role: 'student'
            });
        }
    } catch (error) {
        console.error('Error creating sample users:', error);
    }
};

// Create sample users when server starts
createSampleUsers();

// For Vercel deployment
module.exports = app;
