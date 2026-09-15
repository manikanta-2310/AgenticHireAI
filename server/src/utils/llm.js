import { ChatGroq } from '@langchain/groq';
import logger from './logger.js';

export class LLMClient {
  constructor() {
    this.groqKey = process.env.GROQ_API_KEY;
    this.openRouterKey = process.env.OPENROUTER_API_KEY;
    this.groqModel = null;
    
    if (this.groqKey) {
      try {
        this.groqModel = new ChatGroq({
          apiKey: this.groqKey,
          modelName: 'llama-3.3-70b-versatile',
          temperature: 0.1,
        });
      } catch (e) {
        logger.warn(`Could not initialize ChatGroq: ${e.message}`);
      }
    }
  }

  async invokeJson(systemPrompt, userPrompt, fallbackGenerator = null) {
    if (this.groqModel) {
      try {
        const fullPrompt = `${systemPrompt}\n\nStrict requirement: Output only a single valid JSON object without any Markdown fences or intro/outro.\n\nInput:\n${userPrompt}`;
        const response = await this.groqModel.invoke(fullPrompt);
        const text = response.content.toString().trim();
        const cleaned = text.replace(/```json/gi, '').replace(/```/g, '').trim();
        return JSON.parse(cleaned);
      } catch (err) {
        logger.warn(`Groq API invocation error: ${err.message}. Trying fallback...`);
      }
    }

    if (this.openRouterKey) {
      try {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.openRouterKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'meta-llama/llama-3.1-8b-instruct:free',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt + '\nOutput ONLY valid JSON.' }
            ],
            response_format: { type: 'json_object' }
          })
        });
        const data = await response.json();
        if (data.choices && data.choices[0]) {
          const content = data.choices[0].message.content.trim();
          const cleaned = content.replace(/```json/gi, '').replace(/```/g, '').trim();
          return JSON.parse(cleaned);
        }
      } catch (err) {
        logger.warn(`OpenRouter invocation failed: ${err.message}`);
      }
    }

    // High quality deterministic fallback generator
    if (fallbackGenerator) {
      logger.info('Using dynamic deterministic agent execution fallback.');
      return fallbackGenerator();
    }

    throw new Error('LLM service unavailable and no fallback logic provided');
  }
}

export const llmClient = new LLMClient();
export default llmClient;
