import express from 'express';
import { Summary } from '../models/index.js';
import { validateEmailShare } from '../middleware/validation.js';
import { emailSharingLimiter } from '../middleware/security.js';
import emailService from '../services/email.js';
import Logger from '../utils/logger.js';

const router = express.Router();

// POST /api/share - Share summary via email
router.post('/', emailSharingLimiter, validateEmailShare, async (req, res) => {
  try {
    const { summaryId, recipients, subject, message } = req.body;

    Logger.info('Summary sharing requested', {
      summaryId,
      recipientCount: recipients.length,
      hasCustomSubject: !!subject,
      hasCustomMessage: !!message
    });

    // Find the summary and populate transcript data
    const summary = await Summary.findById(summaryId)
      .populate('transcript', 'originalFilename metadata uploadedAt');

    if (!summary || !summary.isActive) {
      return res.status(404).json({
        error: 'Summary not found',
        message: 'The specified summary does not exist or has been deleted'
      });
    }

    // Check if user has access to this summary
    const currentUserId = req.user ? req.user.id : 'anonymous';
    if (summary.createdBy !== currentUserId) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You do not have permission to share this summary'
      });
    }

    // Prepare email metadata
    const emailMetadata = {
      originalFilename: summary.transcript?.originalFilename,
      aiModel: summary.metadata?.aiModel,
      generatedAt: summary.createdAt,
      wordCount: summary.metadata?.wordCount,
      summaryId: summary._id
    };

    // Send email using email service
    const emailResult = await emailService.sendSummary({
      summaryContent: summary.currentContent,
      recipients,
      subject,
      message,
      summaryMetadata: emailMetadata
    });

    if (!emailResult.success) {
      throw new Error('Failed to send email');
    }

    // Update summary with sharing information
    await summary.shareWith(recipients);

    Logger.info('Summary shared successfully', {
      summaryId,
      messageId: emailResult.messageId,
      recipientCount: recipients.length,
      accepted: emailResult.accepted.length,
      rejected: emailResult.rejected.length
    });

    res.json({
      success: true,
      data: {
        summaryId: summary._id,
        messageId: emailResult.messageId,
        recipients: recipients.length,
        accepted: emailResult.accepted,
        rejected: emailResult.rejected,
        sharedAt: new Date().toISOString()
      },
      message: `Summary shared successfully with ${emailResult.accepted.length} recipient(s)`
    });

  } catch (error) {
    Logger.error('Error sharing summary', error);

    // Handle email service specific errors
    if (error.message.includes('Email service')) {
      return res.status(503).json({
        error: 'Email service unavailable',
        message: error.message
      });
    }

    // Handle authentication errors
    if (error.message.includes('authentication') || error.message.includes('API key')) {
      return res.status(503).json({
        error: 'Email service configuration error',
        message: 'Email service is not properly configured'
      });
    }

    // Handle quota errors
    if (error.message.includes('quota') || error.message.includes('limit')) {
      return res.status(429).json({
        error: 'Email service quota exceeded',
        message: 'Please try again later'
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
      error: 'Failed to share summary',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// GET /api/share/status - Get email service status
router.get('/status', async (req, res) => {
  try {
    const status = emailService.getStatus();
    const connectionTest = await emailService.testConnection();

    Logger.info('Email service status requested', { configured: status.configured, connected: connectionTest });

    res.json({
      success: true,
      data: {
        ...status,
        connected: connectionTest,
        ready: status.configured && connectionTest
      }
    });

  } catch (error) {
    Logger.error('Error checking email service status', error);

    res.status(500).json({
      error: 'Failed to check email service status',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// GET /api/share/history/:summaryId - Get sharing history for a summary
router.get('/history/:summaryId', async (req, res) => {
  try {
    const { summaryId } = req.params;

    const summary = await Summary.findById(summaryId);
    if (!summary || !summary.isActive) {
      return res.status(404).json({
        error: 'Summary not found',
        message: 'The specified summary does not exist or has been deleted'
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

    Logger.info('Sharing history requested', {
      summaryId,
      userId: currentUserId
    });

    res.json({
      success: true,
      data: {
        summaryId: summary._id,
        isShared: summary.sharing.isShared,
        shareCount: summary.sharing.shareCount,
        sharedAt: summary.sharing.sharedAt,
        sharedWith: summary.sharing.sharedWith.map(share => ({
          email: share.email,
          sharedAt: share.sharedAt
        }))
      }
    });

  } catch (error) {
    Logger.error('Error retrieving sharing history', error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        error: 'Invalid summary ID',
        message: 'The provided summary ID is not valid'
      });
    }

    res.status(500).json({
      error: 'Failed to retrieve sharing history',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// POST /api/share/test - Test email service (development only)
router.post('/test', async (req, res) => {
  // Only allow in development environment
  if (process.env.NODE_ENV !== 'development') {
    return res.status(403).json({
      error: 'Forbidden',
      message: 'Test endpoint is only available in development mode'
    });
  }

  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        error: 'Email required',
        message: 'Please provide an email address for testing'
      });
    }

    Logger.info('Email service test requested', { email });

    const testResult = await emailService.sendSummary({
      summaryContent: 'This is a test summary to verify the email service is working correctly.',
      recipients: [email],
      subject: 'Test Email - AI Meeting Notes',
      message: 'This is a test email from the AI Meeting Notes application.',
      summaryMetadata: {
        originalFilename: 'test-transcript.txt',
        aiModel: 'gemini-1.5-flash'
      }
    });

    res.json({
      success: true,
      data: testResult,
      message: 'Test email sent successfully'
    });

  } catch (error) {
    Logger.error('Email service test failed', error);

    res.status(500).json({
      error: 'Test email failed',
      message: error.message
    });
  }
});

export default router;
