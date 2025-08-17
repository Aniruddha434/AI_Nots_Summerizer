import mongoose from 'mongoose';

const summaryVersionSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
    trim: true
  },
  versionNumber: {
    type: Number,
    required: true,
    min: 1
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  isGenerated: {
    type: Boolean,
    default: false // true for AI-generated, false for user-edited
  }
}, { _id: true });

const summarySchema = new mongoose.Schema({
  transcriptId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Transcript',
    required: [true, 'Transcript ID is required'],
    index: true
  },
  prompt: {
    type: String,
    required: [true, 'Prompt is required'],
    minlength: [5, 'Prompt must be at least 5 characters long'],
    maxlength: [1000, 'Prompt cannot exceed 1,000 characters'],
    trim: true
  },
  generatedContent: {
    type: String,
    required: [true, 'Generated content is required'],
    trim: true
  },
  editedContent: {
    type: String,
    default: null,
    trim: true
  },
  versions: [summaryVersionSchema],
  currentVersion: {
    type: Number,
    default: 1,
    min: 1
  },
  status: {
    type: String,
    enum: ['generated', 'edited', 'shared'],
    default: 'generated'
  },
  metadata: {
    aiModel: {
      type: String,
      default: 'gemini-1.5-flash'
    },
    generationTime: {
      type: Number, // in milliseconds
      default: 0
    },
    wordCount: {
      type: Number,
      default: 0
    },
    characterCount: {
      type: Number,
      default: 0
    }
  },
  sharing: {
    isShared: {
      type: Boolean,
      default: false
    },
    sharedAt: {
      type: Date,
      default: null
    },
    sharedWith: [{
      email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
      },
      sharedAt: {
        type: Date,
        default: Date.now
      }
    }],
    shareCount: {
      type: Number,
      default: 0
    }
  },
  createdBy: {
    type: String,
    default: 'anonymous',
    trim: true
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

// Virtual for current content (edited if available, otherwise generated)
summarySchema.virtual('currentContent').get(function() {
  return this.editedContent || this.generatedContent;
});

// Virtual for transcript reference
summarySchema.virtual('transcript', {
  ref: 'Transcript',
  localField: 'transcriptId',
  foreignField: '_id',
  justOne: true
});

// Pre-save middleware to manage versions and metadata
summarySchema.pre('save', function(next) {
  // Update metadata when content changes
  const currentContent = this.currentContent;
  if (currentContent) {
    this.metadata.characterCount = currentContent.length;
    this.metadata.wordCount = currentContent.split(/\s+/).filter(word => word.length > 0).length;
  }

  // Add version when content is edited
  if (this.isModified('editedContent') && this.editedContent) {
    const newVersion = {
      content: this.editedContent,
      versionNumber: this.currentVersion + 1,
      isGenerated: false
    };
    this.versions.push(newVersion);
    this.currentVersion = newVersion.versionNumber;
    this.status = 'edited';
  }

  // Add initial version for generated content
  if (this.isNew && this.generatedContent) {
    const initialVersion = {
      content: this.generatedContent,
      versionNumber: 1,
      isGenerated: true
    };
    this.versions.push(initialVersion);
  }

  next();
});

// Indexes for performance
summarySchema.index({ transcriptId: 1, createdAt: -1 });
summarySchema.index({ createdBy: 1, createdAt: -1 });
summarySchema.index({ status: 1 });
summarySchema.index({ 'sharing.isShared': 1 });
summarySchema.index({ isActive: 1 });

// Instance methods
summarySchema.methods.addEdit = function(newContent) {
  this.editedContent = newContent;
  return this.save();
};

summarySchema.methods.shareWith = function(emails) {
  const newShares = emails.map(email => ({ email }));
  this.sharing.sharedWith.push(...newShares);
  this.sharing.isShared = true;
  this.sharing.sharedAt = new Date();
  this.sharing.shareCount += emails.length;
  this.status = 'shared';
  return this.save();
};

summarySchema.methods.getVersion = function(versionNumber) {
  return this.versions.find(v => v.versionNumber === versionNumber);
};

summarySchema.methods.softDelete = function() {
  this.isActive = false;
  return this.save();
};

// Static methods
summarySchema.statics.findActive = function() {
  return this.find({ isActive: true });
};

summarySchema.statics.findByTranscript = function(transcriptId) {
  return this.find({ transcriptId, isActive: true }).sort({ createdAt: -1 });
};

summarySchema.statics.findShared = function() {
  return this.find({ 'sharing.isShared': true, isActive: true }).sort({ 'sharing.sharedAt': -1 });
};

const Summary = mongoose.model('Summary', summarySchema);

export default Summary;
