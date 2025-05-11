import mongoose, { Document, Schema } from 'mongoose';

export interface IJobPosting extends Document {
  employerId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  location: string;
  requirements: string[];
  salary: number;
  type: 'full-time' | 'part-time' | 'contract';
  createdAt: Date;
  updatedAt: Date;
}

const jobPostingSchema = new Schema<IJobPosting>(
  {
    employerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    requirements: [{
      type: String,
      required: true,
    }],
    salary: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      enum: ['full-time', 'part-time', 'contract'],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const JobPosting = mongoose.model<IJobPosting>('JobPosting', jobPostingSchema); 