import mongoose, { Document, Schema } from 'mongoose';

interface Experience {
  title: string;
  company: string;
  startDate: string;
  endDate?: string;
  description: string;
}

interface Education {
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate?: string;
  description?: string;
}

export interface ICandidateProfile extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  bio: string;
  location: string;
  skills: string[];
  experience: Experience[];
  education: Education[];
  createdAt: Date;
  updatedAt: Date;
}

const candidateProfileSchema = new Schema<ICandidateProfile>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    bio: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    skills: [{
      type: String,
      required: true,
    }],
    experience: [{
      title: {
        type: String,
        required: true,
      },
      company: {
        type: String,
        required: true,
      },
      startDate: {
        type: String,
        required: true,
      },
      endDate: {
        type: String,
      },
      description: {
        type: String,
        required: true,
      },
    }],
    education: [{
      institution: {
        type: String,
        required: true,
      },
      degree: {
        type: String,
        required: true,
      },
      field: {
        type: String,
        required: true,
      },
      startDate: {
        type: String,
        required: true,
      },
      endDate: {
        type: String,
      },
      description: {
        type: String,
      },
    }],
  },
  {
    timestamps: true,
  }
);

export const CandidateProfile = mongoose.model<ICandidateProfile>('CandidateProfile', candidateProfileSchema); 