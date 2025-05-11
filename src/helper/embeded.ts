import { pipeline } from '@xenova/transformers';

let embeddingPipeline: any = null;

async function initializeEmbeddingPipeline() {
  if (!embeddingPipeline) {
    embeddingPipeline = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
  }
  return embeddingPipeline;
}

export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const pipeline = await initializeEmbeddingPipeline();
    const result = await pipeline(text, { pooling: 'mean', normalize: true });
    return Array.from(result.data);
  } catch (error) {
    console.error('Error generating embedding:', error);
    throw new Error('Failed to generate embedding');
  }
}

export async function calculateSimilarity(embedding1: number[], embedding2: number[]): Promise<number> {
  try {
    // Calculate cosine similarity
    const dotProduct = embedding1.reduce((sum, val, i) => sum + val * embedding2[i], 0);
    const magnitude1 = Math.sqrt(embedding1.reduce((sum, val) => sum + val * val, 0));
    const magnitude2 = Math.sqrt(embedding2.reduce((sum, val) => sum + val * val, 0));
    return dotProduct / (magnitude1 * magnitude2);
  } catch (error) {
    console.error('Error calculating similarity:', error);
    throw new Error('Failed to calculate similarity');
  }
}