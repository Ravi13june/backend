import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  fullName: string;
  email: string;
  password: string;
  role: 'candidate' | 'employer';
}

const UserSchema = new Schema<IUser>(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['candidate', 'employer'], required: true },
  },
  { timestamps: true }
);

export default mongoose.model<IUser>('User', UserSchema);
