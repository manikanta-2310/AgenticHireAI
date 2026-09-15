import embeddingService from './embeddingService.js';
import vectorStore from '../config/qdrant.js';
import specLoader from '../config/specLoader.js';
import logger from '../utils/logger.js';

export class RAGService {
  constructor() {
    this.initialized = false;
  }

  async initPolicies() {
    if (this.initialized) return;
    try {
      await vectorStore.init();
      
      // Index specs as organizational policies
      const rubric = specLoader.getScoringRubric();
      const hiringSpecs = specLoader.listHiringSpecs();
      
      const policyChunks = [
        {
          id: 'policy-scoring-weights',
          text: `Recruitment Scoring Policy: Required skills carry ${rubric.weights.required_skills * 100}% weight, Preferred skills ${rubric.weights.preferred_skills * 100}%, Experience ${rubric.weights.experience_years * 100}%, Projects ${rubric.weights.project_relevance * 100}%, Education ${rubric.weights.education * 100}%. Candidates scoring >= ${rubric.decision_thresholds.shortlist} are shortlisted, between ${rubric.decision_thresholds.hold} and ${rubric.decision_thresholds.shortlist - 1} are put on hold.`,
          metadata: { type: 'scoring_policy' }
        },
        ...hiringSpecs.map(spec => ({
          id: `policy-role-${spec.id}`,
          text: `Hiring Policy for ${spec.role}: Minimum experience required is ${spec.min_experience_years || 2} years. Required skills: ${(spec.required_skills || []).join(', ')}. Preferred skills: ${(spec.preferred_skills || []).join(', ')}. Passing threshold: ${spec.minimum_score || 75}%. Auto-advance threshold: ${spec.auto_advance_score || 85}%.`,
          metadata: { type: 'hiring_spec', role: spec.role }
        }))
      ];

      const points = [];
      for (const chunk of policyChunks) {
        const vector = await embeddingService.generateEmbedding(chunk.text);
        points.push({
          id: chunk.id,
          vector,
          payload: { text: chunk.text, metadata: chunk.metadata },
        });
      }

      await vectorStore.upsert('policies', points);
      this.initialized = true;
      logger.info(`RAG initialized with ${points.length} policy chunks.`);
    } catch (err) {
      logger.warn(`RAG init policy warning: ${err.message}`);
    }
  }

  // Chunk text into chunks of specified maximum character length
  chunkText(text, maxChars = 500) {
    if (!text) return [];
    const chunks = [];
    let start = 0;
    while (start < text.length) {
      let end = start + maxChars;
      if (end < text.length) {
        const nextSpace = text.indexOf(' ', end);
        if (nextSpace !== -1 && nextSpace - end < 50) {
          end = nextSpace;
        }
      }
      chunks.push(text.slice(start, end).trim());
      start = end;
    }
    return chunks.filter(c => c.length > 0);
  }

  async indexResume(candidateId, resumeText, metadata = {}) {
    await this.initPolicies();
    const chunks = this.chunkText(resumeText, 500); // 500 chars spec requirement
    const points = [];
    
    for (let i = 0; i < chunks.length; i++) {
      const chunkText = chunks[i];
      const vector = await embeddingService.generateEmbedding(chunkText);
      points.push({
        id: `${candidateId}-chunk-${i}`,
        vector,
        payload: {
          candidateId,
          chunkIndex: i,
          text: chunkText,
          ...metadata,
        },
      });
    }

    await vectorStore.upsert('resumes', points);
    logger.info(`Indexed resume for candidate ${candidateId} into ${points.length} chunks.`);
    return points.length;
  }

  async queryContext(queryText, collection = 'policies', topK = 5, minSimilarity = 0.6) {
    await this.initPolicies();
    const queryVector = await embeddingService.generateEmbedding(queryText);
    const results = await vectorStore.search(collection, queryVector, topK, minSimilarity);
    return results.map(r => r.payload?.text || '').filter(Boolean);
  }
}

export const ragService = new RAGService();
export default ragService;
