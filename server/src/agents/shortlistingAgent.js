import specLoader from '../config/specLoader.js';
import logger from '../utils/logger.js';

export class ShortlistingAgent {
  async execute({ matchScore, hiringSpec }) {
    logger.info(`[ShortlistingAgent] Processing candidate decision for score: ${matchScore}`);

    const rubric = specLoader.getScoringRubric();
    
    // Read thresholds dynamically from spec, NEVER hardcode
    const shortlistThreshold = hiringSpec?.shortlist_threshold ?? rubric.decision_thresholds.shortlist;
    const holdThreshold = hiringSpec?.hold_threshold ?? rubric.decision_thresholds.hold;

    let decision = 'reject';
    let nextAction = 'send_rejection_email';
    let requiresApproval = false;

    if (matchScore >= shortlistThreshold) {
      decision = 'shortlist';
      nextAction = 'human_approval';
      requiresApproval = true;
    } else if (matchScore >= holdThreshold) {
      decision = 'hold';
      nextAction = 'human_approval';
      requiresApproval = true;
    } else {
      decision = 'reject';
      nextAction = 'email_agent';
      requiresApproval = false;
    }

    return {
      success: true,
      data: {
        match_score: matchScore,
        decision,
        shortlist_threshold: shortlistThreshold,
        hold_threshold: holdThreshold,
        requires_human_approval: requiresApproval,
        next_step: nextAction,
        reasoning: `Score of ${matchScore}% evaluated against dynamic spec threshold (Shortlist >= ${shortlistThreshold}, Hold >= ${holdThreshold}).`,
      },
    };
  }
}

export const shortlistingAgent = new ShortlistingAgent();
export default shortlistingAgent;
