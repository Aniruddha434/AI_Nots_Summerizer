import { body, validationResult } from 'express-validator';

// Validation middleware to check for errors
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array()
    });
  }
  next();
};

// Transcript validation rules
export const validateTranscript = [
  body('text')
    .notEmpty()
    .withMessage('Transcript text is required')
    .isLength({ min: 10, max: 50000 })
    .withMessage('Transcript must be between 10 and 50,000 characters'),
  handleValidationErrors
];

// Summary generation validation rules
export const validateSummaryGeneration = [
  body('transcriptId')
    .notEmpty()
    .withMessage('Transcript ID is required')
    .isMongoId()
    .withMessage('Invalid transcript ID format'),
  body('prompt')
    .notEmpty()
    .withMessage('Prompt is required')
    .isLength({ min: 5, max: 1000 })
    .withMessage('Prompt must be between 5 and 1,000 characters'),
  handleValidationErrors
];

// Summary update validation rules
export const validateSummaryUpdate = [
  body('editedContent')
    .notEmpty()
    .withMessage('Edited content is required')
    .isLength({ min: 10, max: 100000 })
    .withMessage('Edited content must be between 10 and 100,000 characters'),
  handleValidationErrors
];

// Email sharing validation rules
export const validateEmailShare = [
  body('summaryId')
    .notEmpty()
    .withMessage('Summary ID is required')
    .isMongoId()
    .withMessage('Invalid summary ID format'),
  body('recipients')
    .isArray({ min: 1 })
    .withMessage('At least one recipient email is required'),
  body('recipients.*')
    .isEmail()
    .withMessage('Invalid email format'),
  body('subject')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Subject must be less than 200 characters'),
  body('message')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Message must be less than 1,000 characters'),
  handleValidationErrors
];
