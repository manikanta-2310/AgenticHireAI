import emailService from '../services/emailService.js';
import logger from '../utils/logger.js';

export class EmailAgent {
  async execute({ candidate, job, decision, matchScore }) {
    logger.info(`[EmailAgent] Dispatching email to '${candidate?.email}' for decision '${decision}'`);

    let templateName = 'rejection';
    if (decision === 'shortlist' || decision === 'approved') {
      templateName = 'shortlist_invitation';
    } else if (decision === 'hold') {
      templateName = 'hold';
    }

    const variables = {
      candidate_name: candidate?.name || 'Applicant',
      job_title: job?.title || 'Open Role',
      match_score: matchScore ?? candidate?.match_score ?? 0,
    };

    const emailResult = await emailService.sendEmail({
      templateName,
      to: candidate?.email,
      variables,
    });

    return {
      success: true,
      data: {
        to: candidate?.email,
        template: templateName,
        subject: emailResult.subject,
        provider: emailResult.provider,
        sent_at: new Date().toISOString(),
      },
    };
  }
}

export const emailAgent = new EmailAgent();
export default emailAgent;
