const Lab = require('../models/Lab');
const LabAttempt = require('../models/LabAttempt');

/**
 * GET /api/labs
 * Lists all active labs in lightweight format (excluding large config/tasks/starter code payloads).
 * Open for public catalog view.
 */
async function getLabsList(req, res, next) {
  try {
    const labs = await Lab.find({ is_active: true })
      .select('lab_id title description type course_title competency_tags is_active created_at updated_at')
      .lean();

    res.status(200).json({
      status: 'ok',
      count: labs.length,
      labs
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/labs/:labId
 * Retrieves full lab details including markdown instructions, starter code / schema SQL, and task validation definitions.
 * Accessible unauthenticated for catalog view, and used by LabRunner once session is verified.
 */
async function getLabById(req, res, next) {
  try {
    const { labId } = req.params;

    const lab = await Lab.findOne({ lab_id: labId, is_active: true }).lean();
    if (!lab) {
      return res.status(404).json({
        error: 'NotFound',
        message: `Lab '${labId}' not found.`
      });
    }

    res.status(200).json({
      status: 'ok',
      lab: {
        lab_id: lab.lab_id,
        title: lab.title,
        description: lab.description,
        type: lab.type,
        course_title: lab.course_title,
        competency_tags: lab.competency_tags || [],
        is_active: lab.is_active,
        config: {
          starter_code: lab.config?.starter_code || '',
          expected_packages: lab.config?.expected_packages || [],
          schema_sql: lab.config?.schema_sql || '',
          starter_query: lab.config?.starter_query || '',
          instructions: lab.config?.instructions || '',
          tasks: lab.config?.tasks || []
        },
        created_at: lab.created_at,
        updated_at: lab.updated_at
      }
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/lab-attempts/start
 * Protected by verifyLabAccess.
 * Accepts nothing extra — uses req.labAccess.user_id and req.labAccess.lab_id.
 * Creates a new LabAttempt record (status: in_progress, started_at: now)
 * or returns an existing in_progress attempt for this user+lab combo.
 */
async function startLabAttempt(req, res, next) {
  try {
    const { user_id, lab_id, course_context } = req.labAccess;

    // Check if an in_progress attempt already exists for this user + lab (e.g. on page refresh)
    let attempt = await LabAttempt.findOne({
      user_id,
      lab_id,
      status: 'in_progress'
    });

    if (attempt) {
      return res.status(200).json({
        status: 'ok',
        attempt,
        is_existing: true
      });
    }

    // Create new attempt
    attempt = await LabAttempt.create({
      user_id,
      lab_id,
      course_context: course_context || '',
      status: 'in_progress',
      started_at: new Date()
    });

    res.status(201).json({
      status: 'ok',
      attempt,
      is_existing: false
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/lab-attempts/:attemptId/complete
 * Protected by verifyLabAccess.
 * Verifies the attempt belongs to req.labAccess.user_id.
 * Accepts: { final_code, tasks_completed, score }.
 * Updates status: 'completed', completed_at: now, plus submitted fields.
 */
async function completeLabAttempt(req, res, next) {
  try {
    const { attemptId } = req.params;
    const { user_id } = req.labAccess;
    const { final_code, tasks_completed, score } = req.body;

    const attempt = await LabAttempt.findById(attemptId);
    if (!attempt) {
      return res.status(404).json({
        error: 'NotFound',
        message: `Lab attempt '${attemptId}' not found.`
      });
    }

    // Security: verify the attempt belongs to the authenticated user
    if (attempt.user_id !== user_id) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You do not have permission to modify this attempt.'
      });
    }

    attempt.status = 'completed';
    attempt.completed_at = new Date();
    if (final_code !== undefined) {
      attempt.final_code = String(final_code);
    }
    if (tasks_completed !== undefined) {
      attempt.tasks_completed = Array.isArray(tasks_completed) ? tasks_completed : [];
    }
    if (score !== undefined) {
      attempt.score = Math.min(100, Math.max(0, Number(score) || 0));
    }

    await attempt.save();

    // TODO: Part 4 will trigger webhook call back to the main site here
    // notifyMainAppLabCompletion({ user_id: attempt.user_id, lab_id: attempt.lab_id, ... })

    res.status(200).json({
      status: 'ok',
      attempt
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getLabsList,
  getLabById,
  startLabAttempt,
  completeLabAttempt
};
