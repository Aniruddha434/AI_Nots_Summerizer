import express from 'express';
import { Transcript, Summary } from '../models/index.js';
import { validateSummaryGeneration, validateSummaryUpdate } from '../middleware/validation.js';
import { aiGenerationLimiter } from '../middleware/security.js';
import aiService from '../services/ai.js';
import Logger from '../utils/logger.js';

const router = express.Router();

// POST /api/generate - Generate AI summary with enhanced processing
router.post('/generate', aiGenerationLimiter, validateSummaryGeneration, async (req, res) => {
  try {
    const { transcriptId, prompt } = req.body;

    Logger.info('Summary generation requested', { transcriptId, promptLength: prompt.length });

    // Find the transcript
    const transcript = await Transcript.findById(transcriptId);
    if (!transcript || !transcript.isActive) {
      return res.status(404).json({
        error: 'Transcript not found',
        message: 'The specified transcript does not exist or has been deleted'
      });
    }

    // Check if a summary already exists for this transcript and prompt combination
    const existingSummary = await Summary.findOne({
      transcriptId,
      prompt: prompt.trim(),
      isActive: true
    });

    if (existingSummary) {
      Logger.info('Returning existing summary', { summaryId: existingSummary._id });
      return res.json({
        success: true,
        data: existingSummary,
        message: 'Summary already exists for this transcript and prompt'
      });
    }

    // Generate summary using AI service
    const aiResult = await aiService.generateSummary({
      transcript: transcript.text,
      prompt: prompt.trim()
    });

    if (!aiResult.success) {
      throw new Error('AI service failed to generate summary');
    }

    // Create and save summary with enhanced metadata
    const summaryData = {
      transcriptId,
      prompt: prompt.trim(),
      generatedContent: aiResult.content,
      metadata: {
        aiModel: aiResult.metadata.model,
        generationTime: aiResult.metadata.generationTime,
        wordCount: aiResult.metadata.wordCount,
        characterCount: aiResult.content.length,
        qualityScore: aiResult.metadata.qualityScore,
        enhancedProcessing: true,
        features: [
          'Advanced action item extraction',
          'Decision tracking with rationale',
          'Risk and opportunity identification',
          'Professional formatting',
          'Quality scoring',
          'Comprehensive analysis'
        ]
      },
      createdBy: (req.user?.id) || req.body.userId || 'anonymous'
    };

    const summary = new Summary(summaryData);
    await summary.save();

    // Populate transcript reference
    await summary.populate('transcript', 'metadata uploadedAt originalFilename');

    Logger.info('Enhanced summary generated and saved', {
      summaryId: summary._id,
      transcriptId,
      generationTime: aiResult.metadata.generationTime,
      outputLength: aiResult.content.length,
      qualityScore: aiResult.metadata.qualityScore,
      enhancedProcessing: true
    });

    res.status(201).json({
      success: true,
      data: summary,
      message: 'AI summary generated successfully with enhanced processing'
    });

  } catch (error) {
    Logger.error('Error generating summary', error);

    // Handle AI service specific errors
    if (error.message.includes('AI service')) {
      return res.status(503).json({
        error: 'AI service unavailable',
        message: error.message
      });
    }

    // Handle validation errors
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        error: 'Validation failed',
        details: Object.values(error.errors).map(err => err.message)
      });
    }

    res.status(500).json({
      error: 'Failed to generate summary',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// GET /api/summaries/:id - Get specific summary
router.get('/:id', async (req, res) => {
  try {
    const summary = await Summary.findById(req.params.id)
      .populate('transcript', 'metadata uploadedAt originalFilename uploadMethod');

    if (!summary || !summary.isActive) {
      return res.status(404).json({
        error: 'Summary not found',
        message: 'The requested summary does not exist'
      });
    }

    // Check if user has access to this summary
    const currentUserId = req.user ? req.user.id : 'anonymous';
    if (summary.createdBy !== currentUserId) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You do not have permission to access this summary'
      });
    }

    Logger.info('Summary retrieved', {
      id: summary._id,
      userId: currentUserId
    });

    res.json({
      success: true,
      data: summary
    });

  } catch (error) {
    Logger.error('Error retrieving summary', error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        error: 'Invalid summary ID',
        message: 'The provided summary ID is not valid'
      });
    }

    res.status(500).json({
      error: 'Failed to retrieve summary',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// PUT /api/summaries/:id - Update/edit summary
router.put('/:id', validateSummaryUpdate, async (req, res) => {
  try {
    const { editedContent } = req.body;
    const summaryId = req.params.id;

    Logger.info('Summary update requested', { summaryId, contentLength: editedContent.length });

    const summary = await Summary.findById(summaryId);
    if (!summary || !summary.isActive) {
      return res.status(404).json({
        error: 'Summary not found',
        message: 'The requested summary does not exist'
      });
    }

    // Check if user has access to this summary
    const currentUserId = req.user ? req.user.id : 'anonymous';
    if (summary.createdBy !== currentUserId) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You do not have permission to edit this summary'
      });
    }

    // Update the summary with edited content
    await summary.addEdit(editedContent);

    // Populate transcript reference
    await summary.populate('transcript', 'metadata uploadedAt originalFilename');

    Logger.info('Summary updated successfully', {
      summaryId,
      newVersion: summary.currentVersion,
      contentLength: editedContent.length
    });

    res.json({
      success: true,
      data: summary,
      message: 'Summary updated successfully'
    });

  } catch (error) {
    Logger.error('Error updating summary', error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        error: 'Invalid summary ID',
        message: 'The provided summary ID is not valid'
      });
    }

    if (error.name === 'ValidationError') {
      return res.status(400).json({
        error: 'Validation failed',
        details: Object.values(error.errors).map(err => err.message)
      });
    }

    res.status(500).json({
      error: 'Failed to update summary',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// GET /api/summaries - Get all summaries (with pagination and filtering)
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const query = { isActive: true };

    // Filter by current user - this is the key fix for data isolation
    if (req.user) {
      // Authenticated user - show only their summaries
      query.createdBy = req.user.id;
    } else {
      // Anonymous user - show only anonymous summaries
      query.createdBy = 'anonymous';
    }

    // Add additional filters
    if (req.query.transcriptId) {
      query.transcriptId = req.query.transcriptId;
    }
    if (req.query.status) {
      query.status = req.query.status;
    }
    // Remove the createdBy filter from query params since we handle it above
    // if (req.query.createdBy) {
    //   query.createdBy = req.query.createdBy;
    // }

    const summaries = await Summary.find(query)
      .populate('transcript', 'metadata uploadedAt originalFilename uploadMethod')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Summary.countDocuments(query);

    Logger.info('Summaries list retrieved', {
      page,
      limit,
      total,
      returned: summaries.length,
      userId: req.user ? req.user.id : 'anonymous',
      filters: req.query
    });

    res.json({
      success: true,
      data: summaries,
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
    Logger.error('Error retrieving summaries list', error);

    res.status(500).json({
      error: 'Failed to retrieve summaries',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// GET /api/summaries/:id/versions - Get all versions of a summary
router.get('/:id/versions', async (req, res) => {
  try {
    const summary = await Summary.findById(req.params.id);

    if (!summary || !summary.isActive) {
      return res.status(404).json({
        error: 'Summary not found',
        message: 'The requested summary does not exist'
      });
    }

    // Check if user has access to this summary
    const currentUserId = req.user ? req.user.id : 'anonymous';
    if (summary.createdBy !== currentUserId) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You do not have permission to access this summary'
      });
    }

    Logger.info('Summary versions retrieved', {
      summaryId: summary._id,
      versionCount: summary.versions.length
    });

    res.json({
      success: true,
      data: {
        summaryId: summary._id,
        currentVersion: summary.currentVersion,
        versions: summary.versions.sort((a, b) => b.versionNumber - a.versionNumber)
      }
    });

  } catch (error) {
    Logger.error('Error retrieving summary versions', error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        error: 'Invalid summary ID',
        message: 'The provided summary ID is not valid'
      });
    }

    res.status(500).json({
      error: 'Failed to retrieve summary versions',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// DELETE /api/summaries/:id - Soft delete summary
router.delete('/:id', async (req, res) => {
  try {
    const summary = await Summary.findById(req.params.id);

    if (!summary || !summary.isActive) {
      return res.status(404).json({
        error: 'Summary not found',
        message: 'The requested summary does not exist'
      });
    }

    // Check if user has access to this summary
    const currentUserId = req.user ? req.user.id : 'anonymous';
    if (summary.createdBy !== currentUserId) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You do not have permission to delete this summary'
      });
    }

    await summary.softDelete();

    Logger.info('Summary soft deleted', { id: summary._id });

    res.json({
      success: true,
      message: 'Summary deleted successfully'
    });

  } catch (error) {
    Logger.error('Error deleting summary', error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        error: 'Invalid summary ID',
        message: 'The provided summary ID is not valid'
      });
    }

    res.status(500).json({
      error: 'Failed to delete summary',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

export default router;
