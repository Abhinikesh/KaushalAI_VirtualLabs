const Lab = require('../models/Lab');
const LabAttempt = require('../models/LabAttempt');

/**
 * GET /api/labs/:labId
 * Retrieves lab instructions, starter code, and task definitions.
 * Enforces token scope: req.params.labId MUST match req.labAccess.lab_id.
 */
async function getLabById(req, res, next) {
  try {
    const { labId } = req.params;

    // Enforce token scope: prevent a user with a token for lab-A from loading lab-B
    if (labId !== req.labAccess.lab_id) {
      return res.status(403).json({
        error: 'Forbidden',
        code: 'TOKEN_SCOPE_MISMATCH',
        message: `Token scope mismatch: your access token was issued for '${req.labAccess.lab_id}', but you requested '${labId}'.`
      });
    }

    const lab = await Lab.findOne({ lab_id: labId });
    if (!lab) {
      return res.status(404).json({
        error: 'NotFound',
        message: `Lab '${labId}' not found in database.`
      });
    }

    // NOTE ON TASK VALIDATION CONFIG:
    // In this client-side Pyodide sandbox architecture, task validation configs
    // (variable names, expected values, and test inputs) are provided to the browser
    // so Pyodide can execute automated checks directly inside the learner's WebAssembly sandbox.
    res.status(200).json({
      status: 'ok',
      lab: {
        lab_id: lab.lab_id,
        title: lab.title,
        description: lab.description,
        type: lab.type,
        course_id: lab.course_id,
        competency_ids: lab.competency_ids,
        config: {
          starter_code: lab.config?.starter_code || '',
          schema_sql: lab.config?.schema_sql || '',
          starter_query: lab.config?.starter_query || '',
          instructions: lab.config?.instructions || '',
          tasks: lab.config?.tasks || [],
          expected_packages: lab.config?.expected_packages || []
        }
      }
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/lab-attempts
 * Records student attempt progress, completed tasks, and score.
 * Derives user_id, lab_id, and course_id strictly from the verified JWT.
 */
async function saveLabAttempt(req, res, next) {
  try {
    const { final_code, tasks_completed, score } = req.body;
    const { user_id, lab_id, course_id } = req.labAccess;

    const completedScore = Number(score) || 0;
    const isCompleted = completedScore >= 100 || (Array.isArray(tasks_completed) && tasks_completed.length > 0);

    const attempt = await LabAttempt.findOneAndUpdate(
      { user_id, lab_id },
      {
        $set: {
          user_id,
          lab_id,
          course_id,
          final_code: String(final_code || ''),
          tasks_completed: Array.isArray(tasks_completed) ? tasks_completed : [],
          score: completedScore,
          status: isCompleted ? 'completed' : 'in_progress',
          completed_at: isCompleted ? new Date() : null
        },
        $setOnInsert: {
          started_at: new Date()
        }
      },
      { upsert: true, new: true }
    );

    console.log(`[LabAttempt] Recorded attempt for user ${user_id} on ${lab_id} (Score: ${completedScore}%, Status: ${attempt.status})`);

    // If lab is completed, notify the main KaushalAI app via server-to-server webhook
    if (isCompleted && course_id) {
      notifyMainAppLabCompletion({
        user_id: attempt.user_id,
        course_id: attempt.course_id,
        lab_id: attempt.lab_id,
        score: attempt.score,
        completed_at: attempt.completed_at || new Date()
      }).catch((err) => {
        console.error('[Labs Webhook] Async dispatch error:', err.message);
      });
    }

    res.status(200).json({
      status: 'ok',
      attempt: {
        id: attempt._id,
        lab_id: attempt.lab_id,
        user_id: attempt.user_id,
        status: attempt.status,
        score: attempt.score,
        tasks_completed: attempt.tasks_completed,
        completed_at: attempt.completed_at
      }
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Helper to dispatch completion webhook back to KaushalAI main backend.
 * Protected with X-Labs-Webhook-Secret.
 * Isolated in try/catch to never fail student attempt submission.
 */
async function notifyMainAppLabCompletion({ user_id, course_id, lab_id, score, completed_at }) {
  try {
    const rawUrl = process.env.MAIN_APP_API_URL || 'http://localhost:5000';
    const baseUrl = rawUrl.replace(/\/api\/?$/, '');
    const webhookUrl = `${baseUrl}/api/labs/webhook/completion`;
    const webhookSecret = process.env.LABS_WEBHOOK_SECRET || 'kaushalai_webhook_secret_s2s_secure_98e1f0ba72c448a';

    console.log(`[Labs Webhook] Dispatching completion webhook to ${webhookUrl} for user ${user_id}, course ${course_id}, lab ${lab_id}`);

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Labs-Webhook-Secret': webhookSecret
      },
      body: JSON.stringify({
        user_id,
        course_id,
        lab_id,
        score,
        completed_at
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.warn(`[Labs Webhook] Main app returned error status (${response.status}): ${errText}`);
    } else {
      const data = await response.json();
      console.log(`[Labs Webhook] Confirmation received from main app:`, data.message || 'ok');
    }
  } catch (err) {
    console.error(`[Labs Webhook] Failed to connect to main app webhook: ${err.message}. Attempt is safely persisted locally.`);
  }
}

module.exports = {
  getLabById,
  saveLabAttempt,
  notifyMainAppLabCompletion
};

