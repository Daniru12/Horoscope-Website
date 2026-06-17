import mongoose, { Schema, Document } from 'mongoose';

export interface IServiceRequest extends Document {
  user: mongoose.Types.ObjectId;
  service?: mongoose.Types.ObjectId;
  serviceName: string;
  birthDate: string;
  birthTime: string;
  birthPlace: string;
  horoscopeImageUrl?: string;
  status: 'pending' | 'completed' | 'cancelled';
  resultText?: string;
  resultImageUrls?: string[];
  resultPdfUrl?: string;
  paymentReceiptUrl?: string;
  paymentStatus: 'pending' | 'uploaded' | 'approved';
  createdAt: Date;
  updatedAt: Date;
}

const ServiceRequestSchema: Schema = new Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
      required: false,
    },
    serviceName: {
      type: String,
      default: 'ජ්‍යෝතිෂ්‍ය කියවීම',
      required: true,
    },
    birthDate: {
      type: String,
      required: true,
    },
    birthTime: {
      type: String,
      required: true,
    },
    birthPlace: {
      type: String,
      required: true,
    },
    horoscopeImageUrl: {
      type: String,
      required: false,
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'cancelled'],
      default: 'pending',
    },
    resultText: {
      type: String,
      required: false,
    },
    resultImageUrls: [{
      type: String,
    }],
    resultPdfUrl: {
      type: String,
      required: false,
    },
    paymentReceiptUrl: {
      type: String,
      required: false,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'uploaded', 'approved'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

import Service from './Service'; // Ensure Service model is registered

if (process.env.NODE_ENV === 'development' && mongoose.models.ServiceRequest) {
  delete (mongoose.models as any).ServiceRequest;
}

export default mongoose.models.ServiceRequest || mongoose.model<IServiceRequest>('ServiceRequest', ServiceRequestSchema);
