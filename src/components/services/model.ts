import mongoose, { Schema, Model as MongooseModel } from 'mongoose';
import { Service } from '@shelter/core/dist';
import { CustomMongooseDocument } from '@shelter/core/dist/utils/mongoose';

import { NAME, SCHEDULE_CATEGORY_TYPE, SERVICE_TYPE } from './constants';
import UserModel from '../users/model';

type Document = CustomMongooseDocument & Service;
type Model = MongooseModel<Document>;

const schema = new Schema({
  name: {
    type: String,
    trim: true,
    index: true,
    required: true,
  },
  description: {
    type: String,
    trim: true,
  },
  address1: {
    type: String,
    trim: true,
    index: true,
  },
  address2: {
    type: String,
    trim: true,
    index: true,
  },
  country: {
    type: String,
    trim: true,
  },
  city: {
    type: String,
    trim: true,
    index: true,
  },
  state: {
    type: String,
    trim: true,
    index: true,
  },
  isApproved: {
    type: Boolean,
    default: false,
  },
  approvedAt: Date,
  category: [{
    type: String,
    trim: true,
    enum: SCHEDULE_CATEGORY_TYPE,
    index: true,
  }],
  schedules: {
    type: Schema.Types.Mixed,
  },
  closeSchedules: {
    type: Schema.Types.Mixed,
  },
  likes: {
    type: Number,
    default: 0,
  },
  location: {
    type: {
      type: String,
      default: 'Point',
    },
    coordinates: {
      type: [Number],
      default: [0, 0],
      index: true,
    },
  },
  isSelectedAll: {
    type: Boolean,
    default: false,
  },
  type: [{
    type: String,
    trim: true,
    enum: SERVICE_TYPE,
    index: true,
  }],
  serviceSummary: {
    type: String,
    trim: true,
    index: true,
    text: true,
  },
  isShowFlag: {
    type: Boolean,
    default: false,
  },
  isShowDonate: {
    type: Boolean,
    default: false,
  },
  isContact: {
    type: Boolean,
    default: false,
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: UserModel,
  },
  contactEmail: {
    type: String,
    trim: true,
    index: true,
  },
  website: {
    type: String,
    trim: true,
  },
  facebook: {
    type: String,
    trim: true,
  },
  twitter: {
    type: String,
    trim: true,
  },
  instagram: {
    type: String,
    trim: true,
  },
  youtube: {
    type: String,
    trim: true,
  },
  zip: {
    type: String,
    trim: true,
    index: true,
  },
  phone: {
    type: String,
    trim: true,
    index: true,
  },
  age: {
    type: String,
    trim: true,
    index: true,
  },
  userEmail: {
    type: String,
    trim: true,
    index: true,
  },
  totalBeds: {
    type: Number,
    default: 0,
  },
  availableBeds: {
    type: Number,
    default: 0,
  },
  // * for critical
  isCriticalHeader: {
    type: Boolean,
    default: false,
  },
  criticalDescription: {
    type: String,
    trim: true,
  },
  criticalExpiredAt: {
    type: Date,
  },
  isCriticalNeverExpire: {
    type: Boolean,
    default: false,
  },
  nextSteps: [{
    type: String,
    trim: true,
  }],
});

schema.index({
  location: '2dsphere',
});

schema.index({
  serviceSummary: 'text', // * For search text in chat bot
});

export default mongoose.model<Document, Model>(NAME, schema);
export { Model, Document };
