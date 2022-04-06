import mongoose, { Schema, Model as MongooseModel } from 'mongoose';
import { Feedback } from '@shelter/core/dist';
import { CustomMongooseDocument } from '@shelter/core/dist/utils/mongoose';

import { NAME, FEEDBACK_TYPE } from './constants';

type Document = CustomMongooseDocument & Feedback;
type Model = MongooseModel<Document>;

const schema = new Schema({
  name: {
    type: String,
    trim: true,
    index: true,
  },
  phone: {
    type: String,
    trim: true,
    index: true,
  },
  email: {
    type: String,
    trim: true,
    index: true,
  },
  message: {
    type: String,
    trim: true,
    required: true,
    index: true,
  },
  files: [{
    type: String,
    trim: true,
  }],
  service: {
    type: Schema.Types.ObjectId,
    ref: 'Service',
  },
  serviceOwner: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  isArchive: {
    type: Boolean,
    default: false,
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
  subject: {
    type: String,
    trim: true,
    required: true,
    index: true,
  },
  type: {
    type: String,
    required: true,
    enum: FEEDBACK_TYPE,
    index: true,
  },
});

schema.index({ code: 'text' });

export default mongoose.model<Document, Model>(NAME, schema);
export { Model, Document };
