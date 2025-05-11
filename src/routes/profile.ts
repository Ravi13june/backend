import express from 'express';
import { createProfile, updateProfile, getProfile, deleteProfile, getCandidateProfile } from '../controllers/profileController';
import { authenticate } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = express.Router();

// Candidate profile routes
router.post('/candidate', authenticate, upload.single('resume'), createProfile);
router.get('/candidate', authenticate, getCandidateProfile);
router.put('/candidate', authenticate, updateProfile);

// Generic profile routes (for future use)
router.get('/:id', authenticate, getProfile);
router.delete('/:id', authenticate, deleteProfile);

export default router; 