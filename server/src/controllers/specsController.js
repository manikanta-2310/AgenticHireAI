import specLoader from '../config/specLoader.js';

export const getHiringSpecs = (req, res, next) => {
  try {
    const specs = specLoader.listHiringSpecs();
    res.status(200).json({ success: true, data: specs });
  } catch (err) {
    next(err);
  }
};

export const getHiringSpecById = (req, res, next) => {
  try {
    const spec = specLoader.getHiringSpec(req.params.id);
    res.status(200).json({ success: true, data: spec });
  } catch (err) {
    next(err);
  }
};

export const getWorkflowSpec = (req, res, next) => {
  try {
    const spec = specLoader.getWorkflowSpec(req.params.name || 'default-hiring-workflow');
    res.status(200).json({ success: true, data: spec });
  } catch (err) {
    next(err);
  }
};

export const getScoringRubric = (req, res, next) => {
  try {
    const rubric = specLoader.getScoringRubric();
    res.status(200).json({ success: true, data: rubric });
  } catch (err) {
    next(err);
  }
};
