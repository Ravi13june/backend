import express from 'express';
import { createJob, updateJob, getJob, deleteJob, getEmployerJobs, getAllJobs } from '../controllers/jobController';

const router = express.Router();

router.post('/', createJob);
router.put('/:id', updateJob);
router.get('/:id', getJob);
router.delete('/:id', deleteJob);
router.get('/employer/:employerId', getEmployerJobs);
router.get('/', getAllJobs);

export default router; 