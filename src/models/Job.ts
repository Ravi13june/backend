import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IJob extends Document {
  employerId: Types.ObjectId;
  title: string;
  description: string;
  requirements: string[];
  jobEmbedding: number[];
  location: string;
  salary?: {
    min: number;
    max: number;
    currency: string;
  };
  status: string;
  deadline: Date;
  applications: Types.ObjectId[];
}

const JobSchema = new Schema<IJob>(
  {
    employerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    requirements: [{ type: String, required: true }],
    jobEmbedding: [Number],
    location: { type: String },
    salary: {
      min: { type: Number },
      max: { type: Number },
      currency: { type: String, default: 'USD' }
    },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    deadline: { type: Date },
    applications: [{ type: Schema.Types.ObjectId, ref: 'Application' }]
  },
  { timestamps: true }
);

export default mongoose.model<IJob>('Job', JobSchema);
