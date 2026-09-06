const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  validation_type: {
    type: String,
    enum: ['output_contains', 'variable_equals', 'function_returns'],
    required: true
  },
  validation_config: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, { _id: false });

const labSchema = new mongoose.Schema({
  lab_id: {
    type: String,
    required: true,
    unique: true,
    index: true,
    trim: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['python_sandbox'],
    default: 'python_sandbox'
  },
  course_id: {
    type: String,
    required: true,
    index: true
  },
  competency_ids: [{
    type: String
  }],
  config: {
    starter_code: {
      type: String,
      default: ''
    },
    instructions: {
      type: String,
      default: ''
    },
    tasks: [taskSchema],
    expected_packages: [{
      type: String
    }]
  }
}, {
  timestamps: true,
  collection: 'labs'
});

module.exports = mongoose.model('Lab', labSchema);
