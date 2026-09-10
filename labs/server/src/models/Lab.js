const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  validation_type: {
    type: String,
    required: true,
    trim: true
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
    enum: ['python_sandbox', 'sql_sandbox', 'js_sandbox', 'html_css_sandbox', 'spreadsheet_sandbox'],
    required: true
  },
  course_title: {
    type: String,
    default: '',
    trim: true
  },
  competency_tags: [{
    type: String,
    trim: true
  }],
  config: {
    // For python_sandbox and js_sandbox:
    starter_code: {
      type: String,
      default: ''
    },
    expected_packages: [{
      type: String,
      trim: true
    }],
    // For sql_sandbox:
    schema_sql: {
      type: String,
      default: ''
    },
    starter_query: {
      type: String,
      default: ''
    },
    // For html_css_sandbox:
    starter_html: {
      type: String,
      default: ''
    },
    starter_css: {
      type: String,
      default: ''
    },
    // For spreadsheet_sandbox:
    initial_data: {
      type: [[mongoose.Schema.Types.Mixed]],
      default: []
    },
    column_headers: [{
      type: String,
      trim: true
    }],
    // Shared:
    instructions: {
      type: String,
      default: ''
    },
    tasks: [taskSchema]
  },
  is_active: {
    type: Boolean,
    default: true,
    index: true
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  collection: 'labs'
});

module.exports = mongoose.model('Lab', labSchema);
