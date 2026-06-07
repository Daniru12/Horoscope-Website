import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  email: string;
  password?: string;
  name: string;
  googleId?: string;
  image?: string;
  role: 'user' | 'admin';
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: false,
    },
    name: {
      type: String,
      required: true,
    },
    googleId: {
      type: String,
      required: false,
    },
    image: {
      type: String,
      required: false,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
