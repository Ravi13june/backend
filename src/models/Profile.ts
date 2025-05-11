import mongoose, { Document, Schema, Types } from 'mongoose';

interface Experience {
  title: string;
  company: string;
  startDate: Date;
  endDate?: Date;
  description: string;
}

interface Education {
  institution: string;
  degree: string;
  field: string;
  startDate: Date;
  endDate?: Date;
}

export interface ICandidateProfile extends Document {
  userId: Types.ObjectId;
  fullName: string;
  title: string;
  bio: string;
  skills: string[];
  experience: Experience[];
  education: Education[];
  location: string;
  resumeEmbedding: number[];
  resume: string;
}

const CandidateProfileSchema = new Schema<ICandidateProfile>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    fullName: { type: String, required: true },
    title: { type: String, default: 'New Candidate' },
    bio: { type: String, default: '' },
    skills: [{ type: String }],
    experience: [{
      title: { type: String, required: true },
      company: { type: String, required: true },
      startDate: { type: Date, required: true },
      endDate: { type: Date },
      description: { type: String, default: '' }
    }],
    education: [{
      institution: { type: String, required: true },
      degree: { type: String, required: true },
      field: { type: String, required: true },
      startDate: { type: Date, required: true },
      endDate: { type: Date }
    }],
    location: { type: String, default: '' },
    resumeEmbedding: [Number],
    resume: String
  },
  { timestamps: true }
);

export default mongoose.model<ICandidateProfile>('CandidateProfile', CandidateProfileSchema);
