const mongoose = require('mongoose');

const labAttemptSchema = new mongoose.Schema({
  user_id: {
    type: String,
    required: true,
    index: true
  },
  lab_id: {
    type: String,
    required: true,
    index: true
  },
  course_id: {
    type: String,
    required: true
  },
  started_at: {
    type: Date,
    default: Date.now
  },
  completed_at: {
    type: Date
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
    type: String
  }],
  score: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  }
}, {
  timestamps: true,
  collection: 'lab_attempts'
});

labAttemptSchema.index({ user_id: 1, lab_id: 1 });

module.exports = mongoose.model('LabAttempt', labAttemptSchema);
