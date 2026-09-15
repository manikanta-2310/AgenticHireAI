import { Resend } from 'resend';
import specLoader from '../config/specLoader.js';
import logger from '../utils/logger.js';

export class EmailService {
  constructor() {
    this.resendKey = process.env.RESEND_API_KEY;
    this.resend = this.resendKey ? new Resend(this.resendKey) : null;
  }

  _interpolate(template, variables) {
    let result = template;
    for (const [key, val] of Object.entries(variables)) {
      const reg = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
      result = result.replace(reg, String(val ?? ''));
    }
    return result;
  }

  async sendEmail({ templateName, to, variables = {} }) {
    const templates = specLoader.getEmailTemplates();
    const template = templates[templateName];

    if (!template) {
      throw new Error(`Email template '${templateName}' not found in specifications`);
    }

    const subject = this._interpolate(template.subject, variables);
    const bodyText = this._interpolate(template.body_text, variables);
    const bodyHtml = this._interpolate(template.body_html || template.body_text, variables);

    logger.info(`[Email Service] Sending '${templateName}' email to: ${to} | Subject: "${subject}"`);

    if (this.resend) {
      try {
        const response = await this.resend.emails.send({
          from: 'AI Recruitment Org <recruitment@resend.dev>',
          to: [to],
          subject,
          text: bodyText,
          html: bodyHtml,
        });
        logger.info(`Email delivered via Resend API: ${response.id || 'ok'}`);
        return { success: true, provider: 'resend', id: response.id };
      } catch (err) {
        logger.warn(`Resend API failed: ${err.message}. Logging locally.`);
      }
    }

    // Local simulation / fallback for offline dev
    return {
      success: true,
      provider: 'simulated',
      to,
      subject,
      content: bodyText,
      timestamp: new Date().toISOString(),
    };
  }
}

export const emailService = new EmailService();
export default emailService;
