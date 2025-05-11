import { Request, Response } from 'express';
import Job from '../models/Job';
import CandidateProfile from '../models/Profile';
import { findMatches } from '../helper/matching';
import { calculateSimilarity } from '../helper/textProcessor';

export const findJobMatches = async (req: Request, res: Response) => {
  try {
    const { jobId } = req.params;
    const job = await Job.findById(jobId);
    
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    const candidates = await CandidateProfile.find();
    
    // Calculate matches using both embeddings and text similarity
    const matches = await Promise.all(candidates.map(async (candidate) => {
      const similarities = await findMatches(job.jobEmbedding, [candidate.resumeEmbedding]);
      const embeddingSimilarity = similarities[0];
      const textSimilarity = calculateSimilarity(
        `${job.title} ${job.description} ${job.requirements}`,
        candidate.resume
      );
      
      // Combined score (70% embedding, 30% text similarity)
      const combinedScore = (embeddingSimilarity * 0.7) + (textSimilarity * 0.3);
      
      return {
        candidateId: candidate._id,
        userId: candidate.userId,
        score: combinedScore,
        matchPercentage: Math.round(combinedScore * 100)
      };
    }));

    // Sort by score and return top matches
    const sortedMatches = matches
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);

    return res.json(sortedMatches);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to find matches', details: error });
  }
};

export const findCandidateMatches = async (req: Request, res: Response) => {
  try {
    const { candidateId } = req.params;
    const candidate = await CandidateProfile.findOne({ userId: candidateId });
    
    if (!candidate) {
      return res.status(404).json({ error: 'Candidate not found' });
    }

    const jobs = await Job.find({ status: 'active' });
    
    // Calculate matches using both embeddings and text similarity
    const matches = await Promise.all(jobs.map(async (job) => {
      const similarities = await findMatches(job.jobEmbedding, [candidate.resumeEmbedding]);
      const embeddingSimilarity = similarities[0];
      const textSimilarity = calculateSimilarity(
        `${job.title} ${job.description} ${job.requirements}`,
        candidate.resume
      );
      
      // Combined score (70% embedding, 30% text similarity)
      const combinedScore = (embeddingSimilarity * 0.7) + (textSimilarity * 0.3);
      
      return {
        id: job._id,
        candidateId: candidate.userId,
        jobId: job._id,
        matchPercentage: Math.round(combinedScore * 100),
        job: {
          id: job._id,
          title: job.title,
          company: job.employerId,
          description: job.description,
          requirements: job.requirements,
          location: job.location,
          salary: {
            min: job.salary?.min || 0,
            max: job.salary?.max || 0,
            currency: job.salary?.currency || 'USD'
          }
        },
        createdAt: new Date().toISOString()
      };
    }));

    // Sort by score and return top matches
    const sortedMatches = matches
      .sort((a, b) => b.matchPercentage - a.matchPercentage)
      .slice(0, 10);

    return res.json(sortedMatches);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to find matches', details: error });
  }
}; 