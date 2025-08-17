import mongoose from 'mongoose';

const transcriptSchema = new mongoose.Schema({
  text: {
    type: String,
    required: [true, 'Transcript text is required'],
    minlength: [10, 'Transcript must be at least 10 characters long'],
    maxlength: [50000, 'Transcript cannot exceed 50,000 characters'],
    trim: true
  },
  originalFilename: {
    type: String,
    default: null,
    trim: true
  },
  fileSize: {
    type: Number,
    default: null,
    min: [0, 'File size cannot be negative']
  },
  uploadMethod: {
    type: String,
    enum: ['file', 'text'],
    required: [true, 'Upload method is required']
  },
  uploaderId: {
    type: String,
    default: 'anonymous',
    trim: true
  },
  metadata: {
    wordCount: {
      type: Number,
      default: 0
    },
    characterCount: {
      type: Number,
      default: 0
    },
    estimatedDuration: {
      type: Number, // in minutes
      default: 0
    }
  },
  uploadedAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for summary count
transcriptSchema.virtual('summaryCount', {
  ref: 'Summary',
  localField: '_id',
  foreignField: 'transcriptId',
  count: true
});

// Pre-save middleware to calculate metadata
transcriptSchema.pre('save', function(next) {
  if (this.isModified('text')) {
    this.metadata.characterCount = this.text.length;
    this.metadata.wordCount = this.text.split(/\s+/).filter(word => word.length > 0).length;
    // Estimate duration: average speaking rate is 150-160 words per minute
    this.metadata.estimatedDuration = Math.ceil(this.metadata.wordCount / 155);
  }
  next();
});

// Indexes for performance
transcriptSchema.index({ uploadedAt: -1 });
transcriptSchema.index({ uploaderId: 1, uploadedAt: -1 });
transcriptSchema.index({ isActive: 1 });

// Instance methods
transcriptSchema.methods.getPreview = function(length = 200) {
  return this.text.length > length 
    ? this.text.substring(0, length) + '...'
    : this.text;
};

transcriptSchema.methods.softDelete = function() {
  this.isActive = false;
  return this.save();
};

// Static methods
transcriptSchema.statics.findActive = function() {
  return this.find({ isActive: true });
};

transcriptSchema.statics.findByUploader = function(uploaderId) {
  return this.find({ uploaderId, isActive: true }).sort({ uploadedAt: -1 });
};

const Transcript = mongoose.model('Transcript', transcriptSchema);

export default Transcript;
