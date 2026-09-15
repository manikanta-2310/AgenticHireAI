import ragService from '../rag/ragService.js';
import logger from '../utils/logger.js';

export class EmbeddingAgent {
  async execute({ candidateId, resumeText, candidateData }) {
    logger.info(`[EmbeddingAgent] Executing vector storage for candidate: ${candidateId}`);
    
    const chunksIndexed = await ragService.indexResume(candidateId, resumeText, {
      name: candidateData?.name,
      email: candidateData?.email,
      skills: candidateData?.skills || [],
    });

    return {
      success: true,
      data: {
        candidateId,
        chunksIndexed,
        collection: 'resumes',
        status: 'indexed',
      },
    };
  }
}

export const embeddingAgent = new EmbeddingAgent();
export default embeddingAgent;
