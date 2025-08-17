import express from 'express';
import { Transcript } from '../models/index.js';
import upload, { handleUploadError } from '../middleware/upload.js';
import { validateTranscript } from '../middleware/validation.js';
import { uploadLimiter } from '../middleware/security.js';
import Logger from '../utils/logger.js';

const router = express.Router();

// POST /api/transcripts - Upload transcript (file or text)
router.post('/', uploadLimiter, upload.single('file'), handleUploadError, async (req, res) => {
  try {
    let transcriptData = {};
    
    // Handle file upload
    if (req.file) {
      Logger.info('Processing file upload', {
        filename: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype
      });

      // Read file content from memory buffer
      const fileContent = req.file.buffer.toString('utf-8');

      transcriptData = {
        text: fileContent.trim(),
        originalFilename: req.file.originalname,
        fileSize: req.file.size,
        uploadMethod: 'file'
      };

      // No need to clean up files since we're using memory storage
      Logger.debug('File processed from memory buffer');
    }
    // Handle text input
    else if (req.body.text) {
      Logger.info('Processing text input', { 
        textLength: req.body.text.length 
      });

      transcriptData = {
        text: req.body.text.trim(),
        uploadMethod: 'text'
      };
    }
    // No valid input provided
    else {
      return res.status(400).json({
        error: 'No transcript provided',
        message: 'Please provide either a file upload or text content'
      });
    }

    // Validate transcript length
    if (transcriptData.text.length < 10) {
      return res.status(400).json({
        error: 'Transcript too short',
        message: 'Transcript must be at least 10 characters long'
      });
    }

    if (transcriptData.text.length > 50000) {
      return res.status(400).json({
        error: 'Transcript too long',
        message: 'Transcript cannot exceed 50,000 characters'
      });
    }

    // Add uploader ID if available from auth or request
    if (req.user?.id) {
      transcriptData.uploaderId = req.user.id;
    } else if (req.body.uploaderId) {
      transcriptData.uploaderId = req.body.uploaderId;
    }

    // Create and save transcript
    const transcript = new Transcript(transcriptData);
    await transcript.save();

    Logger.info('Transcript created successfully', { 
      id: transcript._id,
      method: transcript.uploadMethod,
      wordCount: transcript.metadata.wordCount
    });

    // Return transcript data (without full text for performance)
    res.status(201).json({
      success: true,
      data: {
        id: transcript._id,
        uploadMethod: transcript.uploadMethod,
        originalFilename: transcript.originalFilename,
        fileSize: transcript.fileSize,
        metadata: transcript.metadata,
        uploadedAt: transcript.uploadedAt,
        preview: transcript.getPreview(200)
      },
      message: 'Transcript uploaded successfully'
    });

  } catch (error) {
    Logger.error('Error uploading transcript', error);

    // No file cleanup needed since we're using memory storage

    // Handle validation errors
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        error: 'Validation failed',
        details: Object.values(error.errors).map(err => err.message)
      });
    }

    res.status(500).json({
      error: 'Failed to upload transcript',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// GET /api/transcripts/:id - Get specific transcript
router.get('/:id', async (req, res) => {
  try {
    const transcript = await Transcript.findById(req.params.id);

    if (!transcript || !transcript.isActive) {
      return res.status(404).json({
        error: 'Transcript not found',
        message: 'The requested transcript does not exist'
      });
    }

    // Check if user has access to this transcript
    const currentUserId = req.user ? req.user.id : 'anonymous';
    if (transcript.uploaderId !== currentUserId) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You do not have permission to access this transcript'
      });
    }

    Logger.info('Transcript retrieved', {
      id: transcript._id,
      userId: currentUserId
    });

    res.json({
      success: true,
      data: transcript
    });

  } catch (error) {
    Logger.error('Error retrieving transcript', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        error: 'Invalid transcript ID',
        message: 'The provided transcript ID is not valid'
      });
    }

    res.status(500).json({
      error: 'Failed to retrieve transcript',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// GET /api/transcripts - Get all transcripts (with pagination)
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const query = { isActive: true };

    // Filter by current user - this ensures data isolation
    if (req.user) {
      // Authenticated user - show only their transcripts
      query.uploaderId = req.user.id;
    } else {
      // Anonymous user - show only anonymous transcripts
      query.uploaderId = 'anonymous';
    }

    // Remove the uploaderId filter from query params since we handle it above
    // if (req.query.uploaderId) {
    //   query.uploaderId = req.query.uploaderId;
    // }

    const transcripts = await Transcript.find(query)
      .select('-text') // Exclude full text for performance
      .sort({ uploadedAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('summaryCount');

    const total = await Transcript.countDocuments(query);

    Logger.info('Transcripts list retrieved', {
      page,
      limit,
      total,
      returned: transcripts.length,
      userId: req.user ? req.user.id : 'anonymous'
    });

    res.json({
      success: true,
      data: transcripts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });

  } catch (error) {
    Logger.error('Error retrieving transcripts list', error);
    
    res.status(500).json({
      error: 'Failed to retrieve transcripts',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// DELETE /api/transcripts/:id - Soft delete transcript
router.delete('/:id', async (req, res) => {
  try {
    const transcript = await Transcript.findById(req.params.id);

    if (!transcript || !transcript.isActive) {
      return res.status(404).json({
        error: 'Transcript not found',
        message: 'The requested transcript does not exist'
      });
    }

    // Check if user has access to this transcript
    const currentUserId = req.user ? req.user.id : 'anonymous';
    if (transcript.uploaderId !== currentUserId) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You do not have permission to delete this transcript'
      });
    }

    await transcript.softDelete();

    Logger.info('Transcript soft deleted', { id: transcript._id });

    res.json({
      success: true,
      message: 'Transcript deleted successfully'
    });

  } catch (error) {
    Logger.error('Error deleting transcript', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        error: 'Invalid transcript ID',
        message: 'The provided transcript ID is not valid'
      });
    }

    res.status(500).json({
      error: 'Failed to delete transcript',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

export default router;
