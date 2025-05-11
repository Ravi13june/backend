import express from "express";
import { createJob, getEmployerJobs } from "../controllers/jobController";

const router = express.Router();

// Create a job posting (Authenticated)
router.post("/job", createJob);

// Get all job postings for the logged-in employer
router.get("/jobs", getEmployerJobs);

export default router;
