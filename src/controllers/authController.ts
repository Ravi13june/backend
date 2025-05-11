import { Request, Response } from 'express';
import User from '../models/User';
import CandidateProfile from '../models/Profile';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

export const register = async (req: Request, res: Response) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { fullName, email, password, role } = req.body;

    // Validate required fields
    if (!fullName || !email || !password || !role) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        details: { fullName, email, role }
      });
    }

    // Validate role
    if (!['candidate', 'employer'].includes(role)) {
      return res.status(400).json({ 
        error: 'Invalid role',
        details: { role }
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create user
    const user = await User.create([{ 
      fullName, 
      email, 
      password: hashedPassword, 
      role 
    }], { session });

    // If user is a candidate, create a profile
    if (role === 'candidate') {
      await CandidateProfile.create([{
        userId: user[0]._id,
        fullName,
        title: 'New Candidate',
        bio: '',
        skills: [],
        experience: [],
        education: [],
        location: '',
        resumeEmbedding: [],
        resume: ''
      }], { session });
    }

    await session.commitTransaction();

    const token = jwt.sign(
      { id: user[0]._id, role: user[0].role }, 
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '1d' }
    );

    return res.status(201).json({ token, user: user[0] });
  } catch (err: any) {
    await session.abortTransaction();
    console.error('Registration error:', err);
    
    if (err.code === 11000) {
      return res.status(400).json({ 
        error: 'Email already registered',
        details: err
      });
    }

    return res.status(500).json({ 
      error: 'Registration failed', 
      details: err.message || err 
    });
  } finally {
    session.endSession();
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ error: 'Invalid credentials' });

    const token = jwt.sign(
      { id: user._id, role: user.role }, 
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '1d' }
    );

    return res.json({ token, user });
  } catch (err) {
    return res.status(500).json({ error: 'Login failed', details: err });
  }
};
