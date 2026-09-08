const mongoose = require('mongoose');

const labAttemptSchema = new mongoose.Schema({
  user_id: {
    type: String,
    required: true,
    index: true,
    trim: true
  },
  lab_id: {
    type: String,
    required: true,
    index: true,
    trim: true,
    ref: 'Lab'
  },
  course_context: {
    type: String,
    default: '',
    trim: true
  },
  status: {
    type: String,
    enum: ['in_progress', 'completed'],
    default: 'in_progress'
  },
  final_code: {
    type: String,
    default: ''
  },
  tasks_completed: [{
    type: String,
    trim: true
  }],
  score: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  started_at: {
    type: Date,
    default: Date.now
  },
  completed_at: {
    type: Date,
    default: null
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  collection: 'lab_attempts'
});

labAttemptSchema.index({ user_id: 1, lab_id: 1 });

module.exports = mongoose.model('LabAttempt', labAttemptSchema);
