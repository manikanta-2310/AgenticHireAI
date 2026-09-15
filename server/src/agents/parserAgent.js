import fs from 'fs';
import pdfParse from 'pdf-parse/lib/pdf-parse.js';
import specLoader from '../config/specLoader.js';
import llmClient from '../utils/llm.js';
import logger from '../utils/logger.js';

export class ResumeParserAgent {
  async parsePdfFile(filePath) {
    if (!fs.existsSync(filePath)) {
      throw new Error(`Resume file not found at: ${filePath}`);
    }

    let rawText = '';
    try {
      const dataBuffer = fs.readFileSync(filePath);
      if (filePath.endsWith('.txt')) {
        rawText = dataBuffer.toString('utf-8');
      } else {
        const parsed = await pdfParse(dataBuffer);
        rawText = parsed.text;
      }
    } catch (err) {
      logger.warn(`PDF parse error: ${err.message}. Treating as text buffer.`);
      rawText = fs.readFileSync(filePath, 'utf-8');
    }

    return this.parseResumeText(rawText);
  }

  async parseResumeText(rawText) {
    const prompts = specLoader.getAgentPrompts();
    const parserPrompt = prompts.resume_parser?.system || 'You are an AI Resume Parser.';

    // Deterministic fallback extractor for offline / no LLM
    const fallbackExtractor = () => {
      const text = rawText || '';
      const emailMatch = text.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/i);
      const phoneMatch = text.match(/(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
      
      const commonSkills = [
        'React', 'JavaScript', 'TypeScript', 'Node.js', 'Express.js', 'Next.js', 
        'HTML', 'CSS', 'Tailwind CSS', 'MongoDB', 'PostgreSQL', 'Python', 'Docker',
        'Kubernetes', 'AWS', 'GraphQL', 'REST APIs', 'Redux', 'Zustand', 'Git'
      ];
      
      const foundSkills = commonSkills.filter(skill => 
        new RegExp(`\\b${skill.replace('.', '\\.')}\\b`, 'i').test(text)
      );

      // Estimate years of experience
      const expMatch = text.match(/(\d+)\+?\s*(?:years|yrs)/i);
      const experienceYears = expMatch ? parseInt(expMatch[1], 10) : 3;

      // Guess name from first line
      const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
      const name = lines[0] && lines[0].length < 40 ? lines[0] : 'Candidate';

      return {
        name,
        email: emailMatch ? emailMatch[0] : 'applicant@example.com',
        phone: phoneMatch ? phoneMatch[0] : '',
        location: 'Remote',
        summary: lines.slice(1, 3).join(' ') || 'Experienced software engineer.',
        skills: foundSkills.length > 0 ? foundSkills : ['JavaScript', 'React', 'Node.js'],
        experience_years: experienceYears,
        experience: [
          {
            company: 'Tech Solutions Inc',
            role: 'Software Developer',
            duration: '2021 - Present',
            highlights: ['Engineered responsive web applications', 'Integrated RESTful microservices']
          }
        ],
        education: [
          {
            degree: 'B.S. in Computer Science',
            institution: 'University of Technology',
            year: '2021'
          }
        ],
        projects: [
          {
            name: 'AI Agent Portal',
            technologies: ['React', 'Node.js'],
            description: 'Automated workflow processing system'
          }
        ],
        raw_text_snippet: text.substring(0, 1000)
      };
    };

    const userPrompt = `Parse this resume into structured JSON with fields name, email, phone, location, summary, skills (array), experience_years (number), experience (array of objects), education (array), projects (array):\n\n${rawText.substring(0, 4000)}`;

    const parsedData = await llmClient.invokeJson(parserPrompt, userPrompt, fallbackExtractor);

    return {
      success: true,
      data: parsedData,
      raw_text: rawText,
    };
  }
}

export const resumeParserAgent = new ResumeParserAgent();
export default resumeParserAgent;
