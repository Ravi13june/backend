import express from 'express';
import { findJobMatches, findCandidateMatches } from '../controllers/matchingController';

const router = express.Router();

router.get('/job/:jobId', findJobMatches);
router.get('/candidate/:candidateId', findCandidateMatches);

export default router; 