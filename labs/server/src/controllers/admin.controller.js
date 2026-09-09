const Lab = require('../models/Lab');

/**
 * POST /api/admin/labs
 * Creates a new Lab record.
 */
async function createLab(req, res, next) {
  try {
    const {
      lab_id,
      title,
      description,
      type,
      course_title,
      competency_tags,
      config,
      is_active
    } = req.body;

    if (!lab_id || !title || !description || !type) {
      return res.status(400).json({
        error: 'BadRequest',
        message: 'lab_id, title, description, and type are required fields.'
      });
    }

    const existing = await Lab.findOne({ lab_id });
    if (existing) {
      return res.status(409).json({
        error: 'Conflict',
        message: `Lab with lab_id '${lab_id}' already exists.`
      });
    }

    const newLab = await Lab.create({
      lab_id,
      title,
      description,
      type,
      course_title: course_title || '',
      competency_tags: Array.isArray(competency_tags) ? competency_tags : [],
      config: config || {},
      is_active: is_active !== undefined ? Boolean(is_active) : true
    });

    console.log(`[Admin] Created new lab: [${newLab.lab_id}] "${newLab.title}"`);

    res.status(201).json({
      status: 'ok',
      message: `Lab '${newLab.lab_id}' created successfully.`,
      lab: newLab
    });
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/admin/labs/:labId
 * Updates an existing lab's details or configuration.
 */
async function updateLab(req, res, next) {
  try {
    const { labId } = req.params;
    const updates = req.body;

    // Prevent changing the unique immutable lab_id
    delete updates.lab_id;

    const lab = await Lab.findOneAndUpdate(
      { lab_id: labId },
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!lab) {
      return res.status(404).json({
        error: 'NotFound',
        message: `Lab '${labId}' not found.`
      });
    }

    console.log(`[Admin] Updated lab: [${lab.lab_id}] "${lab.title}"`);

    res.status(200).json({
      status: 'ok',
      message: `Lab '${labId}' updated successfully.`,
      lab
    });
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/admin/labs/:labId/deactivate
 * Soft-disables a lab without deleting historical attempts.
 */
async function deactivateLab(req, res, next) {
  try {
    const { labId } = req.params;

    const lab = await Lab.findOneAndUpdate(
      { lab_id: labId },
      { $set: { is_active: false } },
      { new: true }
    );

    if (!lab) {
      return res.status(404).json({
        error: 'NotFound',
        message: `Lab '${labId}' not found.`
      });
    }

    console.log(`[Admin] Soft-deactivated lab: [${lab.lab_id}]`);

    res.status(200).json({
      status: 'ok',
      message: `Lab '${labId}' has been deactivated (is_active: false).`,
      lab
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createLab,
  updateLab,
  deactivateLab
};
