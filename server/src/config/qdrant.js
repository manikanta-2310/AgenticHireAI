import { QdrantClient } from '@qdrant/js-client-rest';
import logger from '../utils/logger.js';

const QDRANT_URL = process.env.QDRANT_URL || 'http://localhost:6333';

export class VectorStoreManager {
  constructor() {
    this.client = new QdrantClient({ url: QDRANT_URL });
    this.isQdrantAvailable = false;
    this.inMemoryVectors = new Map(); // collectionName -> Array of { id, vector, payload }
  }

  async init() {
    try {
      await this.client.getCollections();
      this.isQdrantAvailable = true;
      logger.info(`Qdrant connected at ${QDRANT_URL}`);
      await this.ensureCollection('resumes', 384);
      await this.ensureCollection('policies', 384);
    } catch (error) {
      this.isQdrantAvailable = false;
      logger.warn(`Qdrant not reachable at ${QDRANT_URL}. Falling back to in-memory vector storage for local operation.`);
      if (!this.inMemoryVectors.has('resumes')) this.inMemoryVectors.set('resumes', []);
      if (!this.inMemoryVectors.has('policies')) this.inMemoryVectors.set('policies', []);
    }
  }

  async ensureCollection(name, size = 384) {
    if (!this.isQdrantAvailable) {
      if (!this.inMemoryVectors.has(name)) this.inMemoryVectors.set(name, []);
      return;
    }
    try {
      const collections = await this.client.getCollections();
      const exists = collections.collections.some(c => c.name === name);
      if (!exists) {
        await this.client.createCollection(name, {
          vectors: { size, distance: 'Cosine' },
        });
        logger.info(`Created Qdrant collection: ${name}`);
      }
    } catch (err) {
      logger.warn(`Could not ensure Qdrant collection ${name}: ${err.message}`);
    }
  }

  async upsert(collectionName, points) {
    if (this.isQdrantAvailable) {
      try {
        await this.client.upsert(collectionName, {
          wait: true,
          points: points.map(p => ({
            id: p.id,
            vector: p.vector,
            payload: p.payload,
          })),
        });
        return true;
      } catch (err) {
        logger.error(`Qdrant upsert failed: ${err.message}`);
      }
    }

    // In-memory fallback
    if (!this.inMemoryVectors.has(collectionName)) {
      this.inMemoryVectors.set(collectionName, []);
    }
    const store = this.inMemoryVectors.get(collectionName);
    for (const p of points) {
      const existingIdx = store.findIndex(item => item.id === p.id);
      if (existingIdx >= 0) {
        store[existingIdx] = p;
      } else {
        store.push(p);
      }
    }
    return true;
  }

  // Cosine similarity calculation helper
  _cosineSimilarity(vecA, vecB) {
    let dot = 0.0;
    let normA = 0.0;
    let normB = 0.0;
    for (let i = 0; i < vecA.length; i++) {
      dot += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }
    if (normA === 0 || normB === 0) return 0;
    return dot / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  async search(collectionName, queryVector, limit = 5, scoreThreshold = 0.5) {
    if (this.isQdrantAvailable) {
      try {
        const results = await this.client.search(collectionName, {
          vector: queryVector,
          limit,
          score_threshold: scoreThreshold,
        });
        return results.map(r => ({
          id: r.id,
          score: r.score,
          payload: r.payload,
        }));
      } catch (err) {
        logger.error(`Qdrant search failed, falling back to in-memory: ${err.message}`);
      }
    }

    const store = this.inMemoryVectors.get(collectionName) || [];
    const scored = store.map(item => ({
      id: item.id,
      score: this._cosineSimilarity(queryVector, item.vector),
      payload: item.payload,
    }));

    return scored
      .filter(item => item.score >= scoreThreshold)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }
}

export const vectorStore = new VectorStoreManager();
export default vectorStore;
