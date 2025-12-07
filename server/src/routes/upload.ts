import express from 'express';
import multer from 'multer';
import path from 'path';
import CloudinaryService from '../services/cloudinaryService';

const router = express.Router();

// Configure multer for video uploads
const videoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/videos/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const videoUpload = multer({
  storage: videoStorage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit for videos
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/avi', 'video/mov', 'video/wmv'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only video files are allowed.'));
    }
  }
});

// Video upload endpoint
router.post('/videos', videoUpload.array('videos', 5), async (req, res) => {
  try {
    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No video files provided'
      });
    }

    const uploadResult = await CloudinaryService.uploadProductVideos(req.files as Express.Multer.File[]);
    
    if (uploadResult.success && uploadResult.data) {
      res.json({
        success: true,
        data: uploadResult.data,
        message: `${uploadResult.data.length} video(s) uploaded successfully`
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Failed to upload videos',
        errors: uploadResult.errors
      });
    }
  } catch (error) {
    console.error('Video upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during video upload',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Single video upload endpoint
router.post('/video', videoUpload.single('video'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No video file provided'
      });
    }

    const uploadResult = await CloudinaryService.uploadVideo(req.file);
    
    if (uploadResult.success && uploadResult.data) {
      res.json({
        success: true,
        data: uploadResult.data,
        message: 'Video uploaded successfully'
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Failed to upload video',
        error: uploadResult.error
      });
    }
  } catch (error) {
    console.error('Video upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during video upload',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
