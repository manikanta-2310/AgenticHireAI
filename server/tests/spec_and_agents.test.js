import specLoader from '../src/config/specLoader.js';
import resumeParserAgent from '../src/agents/parserAgent.js';
import matchingAgent from '../src/agents/matchingAgent.js';
import shortlistingAgent from '../src/agents/shortlistingAgent.js';
import embeddingService from '../src/rag/embeddingService.js';
import vectorStore from '../src/config/qdrant.js';

describe('Spec-Driven Multi-Agent Recruitment Pipeline Tests', () => {
  test('specLoader loads hiring specs and scoring rubrics accurately', () => {
    const hiringSpec = specLoader.getHiringSpec('frontend-developer');
    expect(hiringSpec).toBeDefined();
    expect(hiringSpec.role).toBe('Frontend Developer');
    expect(hiringSpec.required_skills).toContain('React');

    const rubric = specLoader.getScoringRubric();
    expect(rubric.weights.required_skills).toBe(0.4);
    expect(rubric.decision_thresholds.shortlist).toBe(80);
  });

  test('embeddingService generates 384-dimensional unit vector', async () => {
    const vec = await embeddingService.generateEmbedding('Senior React and JavaScript engineer');
    expect(vec).toHaveLength(384);
    
    // Check normalization (length approx 1)
    let norm = 0;
    for (const v of vec) norm += v * v;
    expect(Math.sqrt(norm)).toBeCloseTo(1, 1);
  });

  test('resumeParserAgent parses raw text into valid structured JSON', async () => {
    const rawResume = `John Doe\njohn@example.com\nSenior Frontend Developer with 4 years experience in React, Next.js, and CSS.`;
    const result = await resumeParserAgent.parseResumeText(rawResume);
    expect(result.success).toBe(true);
    expect(result.data.email).toBe('john@example.com');
    expect(result.data.skills).toContain('React');
  });

  test('matchingAgent calculates spec-weighted match score', async () => {
    const hiringSpec = specLoader.getHiringSpec('frontend-developer');
    const candidateData = {
      name: 'John Doe',
      skills: ['React', 'JavaScript', 'CSS', 'HTML', 'Next.js'],
      experience_years: 4,
      projects: [{ name: 'Project 1' }],
      education: [{ degree: 'B.S.' }],
    };

    const matchResult = await matchingAgent.execute({ candidateData, hiringSpec });
    expect(matchResult.success).toBe(true);
    expect(matchResult.data.match_score).toBeGreaterThanOrEqual(75);
    expect(matchResult.data.matched_skills).toContain('REACT');
  });

  test('shortlistingAgent applies dynamic thresholds without hardcoding', async () => {
    const hiringSpec = specLoader.getHiringSpec('frontend-developer');
    
    const highScoreResult = await shortlistingAgent.execute({ matchScore: 88, hiringSpec });
    expect(highScoreResult.data.decision).toBe('shortlist');
    expect(highScoreResult.data.requires_human_approval).toBe(true);

    const midScoreResult = await shortlistingAgent.execute({ matchScore: 68, hiringSpec });
    expect(midScoreResult.data.decision).toBe('hold');

    const lowScoreResult = await shortlistingAgent.execute({ matchScore: 45, hiringSpec });
    expect(lowScoreResult.data.decision).toBe('reject');
    expect(lowScoreResult.data.requires_human_approval).toBe(false);
  });
});
