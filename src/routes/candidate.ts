import express from "express";
import { upload } from "../middleware/upload";
import { createProfile } from "../controllers/profileController";


const router = express.Router();

router.post("/profile", upload.single('resume'), createProfile);

export default router;
