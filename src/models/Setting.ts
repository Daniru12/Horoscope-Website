import mongoose, { Schema, Document } from 'mongoose';

export interface ISetting extends Document {
  bankName: string;
  branchName: string;
  accountNumber: string;
  accountName: string;
  mobileNumber: string;
  email: string;
  smsNumber: string;
  smsEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const SettingSchema: Schema = new Schema(
  {
    bankName: { type: String, default: '' },
    branchName: { type: String, default: '' },
    accountNumber: { type: String, default: '' },
    accountName: { type: String, default: '' },
    mobileNumber: { type: String, default: '' },
    email: { type: String, default: '' },
    smsNumber: { type: String, default: '' },
    smsEnabled: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.models.Setting || mongoose.model<ISetting>('Setting', SettingSchema);
