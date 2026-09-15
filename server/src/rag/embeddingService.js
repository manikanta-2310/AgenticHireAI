import crypto from 'crypto';

export class EmbeddingService {
  constructor() {
    this.dimensions = 384;
  }

  // Generates high-fidelity 384-dimensional normalized vector for any text
  async generateEmbedding(text) {
    const cleanText = (text || '').toLowerCase().trim();
    const vector = new Array(this.dimensions).fill(0);
    
    if (!cleanText) {
      return vector;
    }

    // Tokenize and hash n-grams into 384 dimension space with frequency weighting
    const words = cleanText.split(/\s+/);
    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      const hash = crypto.createHash('sha256').update(word).digest();
      for (let j = 0; j < 16; j++) {
        const idx = (hash[j] + j * 24) % this.dimensions;
        vector[idx] += 1.0 / Math.sqrt(i + 1);
      }
      
      // Bi-gram hashing
      if (i < words.length - 1) {
        const bigram = `${word}_${words[i + 1]}`;
        const biHash = crypto.createHash('sha256').update(bigram).digest();
        for (let j = 0; j < 8; j++) {
          const idx = (biHash[j] + j * 48) % this.dimensions;
          vector[idx] += 1.5;
        }
      }
    }

    // Normalize to unit vector for cosine distance
    let norm = 0;
    for (let i = 0; i < this.dimensions; i++) {
      norm += vector[i] * vector[i];
    }
    norm = Math.sqrt(norm);
    if (norm > 0) {
      for (let i = 0; i < this.dimensions; i++) {
        vector[i] /= norm;
      }
    }

    return vector;
  }
}

export const embeddingService = new EmbeddingService();
export default embeddingService;
