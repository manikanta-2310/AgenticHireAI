import specLoader from '../config/specLoader.js';
import ragService from '../rag/ragService.js';
import llmClient from '../utils/llm.js';
import logger from '../utils/logger.js';

export class MatchingAgent {
  async execute({ candidateData, hiringSpec, jobDetails }) {
    logger.info(`[MatchingAgent] Matching candidate '${candidateData?.name}' against spec '${hiringSpec?.role || jobDetails?.title}'`);

    const rubric = specLoader.getScoringRubric();
    const prompts = specLoader.getAgentPrompts();
    const systemPrompt = prompts.matching_agent?.system || 'You are an AI Talent Matching Specialist.';

    // Retrieve relevant organizational hiring policies via RAG
    const ragContext = await ragService.queryContext(
      `Hiring criteria for ${hiringSpec?.role || jobDetails?.title}: ${(hiringSpec?.required_skills || []).join(' ')}`,
      'policies',
      3
    );

    // Dynamic spec-driven deterministic calculation fallback
    const fallbackMatcher = () => {
      const candidateSkills = (candidateData?.skills || []).map(s => s.toLowerCase());
      const requiredSkills = (hiringSpec?.required_skills || jobDetails?.required_skills || []).map(s => s.toLowerCase());
      const preferredSkills = (hiringSpec?.preferred_skills || jobDetails?.preferred_skills || []).map(s => s.toLowerCase());

      const matchedRequired = requiredSkills.filter(req => 
        candidateSkills.some(cs => cs.includes(req) || req.includes(cs))
      );
      const missingRequired = requiredSkills.filter(req => 
        !candidateSkills.some(cs => cs.includes(req) || req.includes(cs))
      );

      const matchedPreferred = preferredSkills.filter(pref => 
        candidateSkills.some(cs => cs.includes(pref) || pref.includes(cs))
      );

      // Calculate component scores
      const reqSkillScore = requiredSkills.length > 0 ? (matchedRequired.length / requiredSkills.length) * 100 : 100;
      const prefSkillScore = preferredSkills.length > 0 ? (matchedPreferred.length / preferredSkills.length) * 100 : 75;
      
      const reqExp = hiringSpec?.min_experience_years || jobDetails?.min_experience || 2;
      const candExp = candidateData?.experience_years || 2;
      const expScore = Math.min(100, Math.max(20, (candExp / reqExp) * 100));

      const projScore = (candidateData?.projects && candidateData.projects.length > 0) ? 90 : 60;
      const eduScore = candidateData?.education?.length > 0 ? 85 : 70;

      // Spec-weighted overall score
      const overallScore = Math.round(
        (reqSkillScore * rubric.weights.required_skills) +
        (prefSkillScore * rubric.weights.preferred_skills) +
        (expScore * rubric.weights.experience_years) +
        (projScore * rubric.weights.project_relevance) +
        (eduScore * rubric.weights.education)
      );

      const minScore = hiringSpec?.minimum_score || 75;
      const recommendation = overallScore >= minScore ? 'Shortlist' : (overallScore >= (hiringSpec?.hold_threshold || 60) ? 'Hold' : 'Reject');

      return {
        match_score: overallScore,
        matched_skills: matchedRequired.map(s => s.toUpperCase()),
        missing_skills: missingRequired.map(s => s.toUpperCase()),
        matched_preferred_skills: matchedPreferred.map(s => s.toUpperCase()),
        category_scores: {
          required_skills: Math.round(reqSkillScore),
          preferred_skills: Math.round(prefSkillScore),
          experience: Math.round(expScore),
          projects: Math.round(projScore),
          education: Math.round(eduScore),
        },
        recommendation,
        rationale: `Candidate scored ${overallScore}% based on ${matchedRequired.length}/${requiredSkills.length} required skills and ${candExp} years experience.`,
        rag_context_used: ragContext,
      };
    };

    const userPrompt = `Evaluate Candidate:
Candidate Skills: ${(candidateData?.skills || []).join(', ')}
Candidate Experience Years: ${candidateData?.experience_years || 0}
Candidate Projects: ${JSON.stringify(candidateData?.projects || [])}
Hiring Spec:
Role: ${hiringSpec?.role || jobDetails?.title}
Required Skills: ${(hiringSpec?.required_skills || jobDetails?.required_skills || []).join(', ')}
Preferred Skills: ${(hiringSpec?.preferred_skills || jobDetails?.preferred_skills || []).join(', ')}
Min Experience: ${hiringSpec?.min_experience_years || jobDetails?.min_experience || 1}
Scoring Weights: ${JSON.stringify(rubric.weights)}
RAG Organizational Policies:
${ragContext.join('\n')}`;

    const matchData = await llmClient.invokeJson(systemPrompt, userPrompt, fallbackMatcher);

    return {
      success: true,
      data: matchData,
    };
  }
}

export const matchingAgent = new MatchingAgent();
export default matchingAgent;
