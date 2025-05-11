// Add to backend/src/helper/textProcessor.ts
import natural from 'natural';
import { removeStopwords, eng } from 'stopword';
import { cosineSimilarity } from './similarity';

const tokenizer = new natural.WordTokenizer();
const tfidf = new natural.TfIdf();

export const preprocessText = (text: string): string[] => {
  // Convert to lowercase
  const lowerText = text.toLowerCase();
  
  // Tokenize
  const tokens = tokenizer.tokenize(lowerText) || [];
  
  // Remove stopwords
  const filteredTokens = removeStopwords(tokens, eng);
  
  // Stem words
  const stemmer = natural.PorterStemmer;
  const stemmedTokens = filteredTokens.map(token => stemmer.stem(token));
  
  return stemmedTokens;
};

export const calculateSimilarity = (text1: string, text2: string): number => {
  // Preprocess both texts
  const tokens1 = preprocessText(text1);
  const tokens2 = preprocessText(text2);
  
  // Create TF-IDF vectors
  tfidf.addDocument(tokens1);
  tfidf.addDocument(tokens2);
  
  // Calculate cosine similarity
  const vector1: number[] = [];
  const vector2: number[] = [];
  
  tfidf.tfidfs(tokens1, (_i, measure) => {
    vector1.push(measure);
  });
  
  tfidf.tfidfs(tokens2, (_i, measure) => {
    vector2.push(measure);
  });
  
  return cosineSimilarity(vector1, vector2);
};

export const extractKeywords = (text: string): string[] => {
  const tokens = preprocessText(text);
  
  // Calculate TF-IDF scores
  tfidf.addDocument(tokens);
  const scores: number[] = [];
  tfidf.tfidfs(tokens, (_i, measure) => {
    scores.push(measure);
  });
  
  // Get top keywords
  const keywordScores = tokens.map((token, i) => ({
    keyword: token,
    score: scores[i]
  }));
  
  return keywordScores
    .sort((a, b) => b.score - a.score)
    .slice(0, 10)
    .map(k => k.keyword);
};

export const calculateCosineSimilarity = (vec1: number[], vec2: number[]): number => {
  if (vec1.length !== vec2.length) {
    throw new Error('Vectors must have the same length');
  }
  
  const dotProduct = vec1.reduce((sum, val, i) => sum + val * vec2[i], 0);
  const magnitude1 = Math.sqrt(vec1.reduce((sum, val) => sum + val * val, 0));
  const magnitude2 = Math.sqrt(vec2.reduce((sum, val) => sum + val * val, 0));
  
  return dotProduct / (magnitude1 * magnitude2);
};

export const analyzeJobRequirements = (requirements: string[]): {
  technicalSkills: string[];
  softSkills: string[];
  experience: string[];
} => {
  const technicalKeywords = [
    'programming', 'coding', 'software', 'development', 'database',
    'api', 'framework', 'language', 'algorithm', 'system'
  ];
  
  const softKeywords = [
    'communication', 'teamwork', 'leadership', 'problem-solving',
    'collaboration', 'time management', 'adaptability'
  ];
  
  const experienceKeywords = [
    'years', 'experience', 'senior', 'junior', 'entry', 'level',
    'expert', 'proficient', 'familiar'
  ];
  
  const technicalSkills: string[] = [];
  const softSkills: string[] = [];
  const experience: string[] = [];
  
  requirements.forEach(req => {
    const tokens = preprocessText(req);
    
    if (tokens.some(token => technicalKeywords.includes(token))) {
      technicalSkills.push(req);
    }
    if (tokens.some(token => softKeywords.includes(token))) {
      softSkills.push(req);
    }
    if (tokens.some(token => experienceKeywords.includes(token))) {
      experience.push(req);
    }
  });
  
  return {
    technicalSkills,
    softSkills,
    experience
  };
};