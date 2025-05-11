import { Request, Response } from "express";
import Job from "../models/Job";
import { generateEmbedding } from '../helper/embeded';

// Helper function to parse salary text
const parseSalaryText = (salaryText: string) => {
  try {
    // Handle different formats:
    // 1. "120000-180000 USD"
    // 2. "$120000-$180000"
    // 3. "120000 - 180000"
    // 4. "120000"
    
    // Remove currency symbols and normalize spaces
    const normalized = salaryText.replace(/[$€£]/g, '').trim();
    
    // Extract currency if present
    const currencyMatch = normalized.match(/\s*([A-Z]{3})$/);
    const currency = currencyMatch ? currencyMatch[1] : 'USD';
    
    // Remove currency from string
    const numbersOnly = normalized.replace(/\s*[A-Z]{3}$/, '').trim();
    
    // Split by any separator (dash, space, etc)
    const [minStr, maxStr] = numbersOnly.split(/[\s-]+/);
    
    const min = parseInt(minStr.replace(/[^0-9]/g, ''));
    const max = maxStr ? parseInt(maxStr.replace(/[^0-9]/g, '')) : min;
    
    if (isNaN(min) || isNaN(max)) {
      throw new Error('Invalid salary format');
    }
    
    return {
      min,
      max,
      currency
    };
  } catch (error) {
    console.error('Error parsing salary:', error);
    return {
      min: 0,
      max: 0,
      currency: 'USD'
    };
  }
};

export const createJob = async (req: Request, res: Response) => {
  try {
    const { employerId, title, description, requirements, location, salaryText } = req.body;
    
    if (!employerId) {
      return res.status(400).json({ error: 'Employer ID is required' });
    }

    // Parse salary text into structured format
    const salary = parseSalaryText(salaryText);

    // Generate embedding for job description and requirements
    const jobText = `${title} ${description} ${requirements.join(' ')}`;
    const jobEmbedding = await generateEmbedding(jobText);
    
    const job = await Job.create({
      employerId,
      title,
      description,
      requirements,
      location,
      salary,
      jobEmbedding,
      status: 'active'
    });

    return res.status(201).json(job);
  } catch (error: any) {
    console.error('Error creating job:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: 'Failed to create job', details: error });
    }
    return res.status(500).json({ error: 'Failed to create job', details: error });
  }
};

export const updateJob = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    // Handle salary text if provided
    if (updates.salaryText) {
      updates.salary = parseSalaryText(updates.salaryText);
      delete updates.salaryText;
    }
    
    // Regenerate embedding if job details are updated
    if (updates.title || updates.description || updates.requirements) {
      const jobText = `${updates.title || ''} ${updates.description || ''} ${updates.requirements || ''}`;
      updates.jobEmbedding = await generateEmbedding(jobText);
    }

    const job = await Job.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true }
    );

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    return res.json(job);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to update job', details: error });
  }
};

export const getJob = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const job = await Job.findById(id);
    
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    return res.json(job);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch job', details: error });
  }
};

export const deleteJob = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const job = await Job.findByIdAndDelete(id);
    
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    return res.json({ message: 'Job deleted successfully' });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to delete job', details: error });
  }
};

export const getEmployerJobs = async (req: Request, res: Response) => {
  try {
    const { employerId } = req.params;
    const jobs = await Job.find({ employerId });
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch employer jobs', details: error });
  }
};

export const getAllJobs = async (_req: Request, res: Response) => {
  try {
    const jobs = await Job.find({ status: 'active' });
    return res.json(jobs);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch jobs', details: error });
  }
};
