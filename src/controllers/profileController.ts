// controllers/candidateController.ts
import { Request, Response } from 'express';
import fs from 'fs';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import path from 'path';
import CandidateProfile from "../models/Profile";
import { generateEmbedding } from '../helper/embeded';
import User from "../models/User";

export const createProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Get user details to get fullName
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { title, bio, skills, experience, education, location } = req.body;
    const resume = req.file?.path;

    // Generate embedding for resume if provided
    const resumeEmbedding = resume ? await generateEmbedding(resume) : undefined;
    
    const profile = await CandidateProfile.create({
      userId,
      fullName: user.fullName,
      title,
      bio,
      skills: Array.isArray(skills) ? skills : JSON.parse(skills),
      experience: Array.isArray(experience) ? experience : JSON.parse(experience),
      education: Array.isArray(education) ? education : JSON.parse(education),
      location,
      resume,
      resumeEmbedding
    });

    res.status(201).json(profile);
  } catch (error) {
    console.error('Profile creation error:', error);
    res.status(500).json({ error: 'Failed to create profile', details: error });
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const updates = req.body;
    
    if (updates.resume) {
      updates.resumeEmbedding = await generateEmbedding(updates.resume);
    }

    const profile = await CandidateProfile.findOneAndUpdate(
      { userId },
      { $set: updates },
      { new: true }
    );

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    res.json(profile);
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Failed to update profile', details: error });
  }
};

export const getProfile = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const profile = await CandidateProfile.findById(id);
    
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    res.json(profile);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch profile', details: error });
  }
};

export const deleteProfile = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const profile = await CandidateProfile.findByIdAndDelete(id);
    
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    res.json({ message: 'Profile deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete profile', details: error });
  }
};

export const getCandidateProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id; // Get from auth middleware
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const profile = await CandidateProfile.findOne({ userId });
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    res.json(profile);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch profile', details: error });
  }
};
