// Add to backend/src/helper/matching.ts

import { cosineSimilarity } from "./similarity";

export const findMatches = async (jobEmbedding: number[], candidateEmbeddings: number[][]) => {
  const similarities = candidateEmbeddings.map(embedding => 
    cosineSimilarity(jobEmbedding, embedding)
  );
  return similarities;
};