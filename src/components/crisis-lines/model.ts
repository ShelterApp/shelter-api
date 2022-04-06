import mongoose, { Schema, Model as MongooseModel } from 'mongoose';
import { CrisisLine } from '@shelter/core/dist';
import { CustomMongooseDocument } from '@shelter/core/dist/utils/mongoose';

import { NAME } from './constants';

type Document = CustomMongooseDocument & CrisisLine;
type Model = MongooseModel<Document>;

const schema = new Schema({
  name: {
    type: String,
    trim: true,
    index: true,
  },
  description: {
    type: String,
    trim: true,
    index: true,
  },
  area: {
    type: String,
    trim: true,
    index: true,
  },
  chatWebLink: {
    type: String,
    trim: true,
    index: true,
  },
  time: {
    type: String,
    trim: true,
    index: true,
  },
  phone: {
    type: String,
    trim: true,
    index: true,
  },
  text: {
    type: String,
    trim: true,
    index: true,
  },
  website: {
    type: String,
    trim: true,
    index: true,
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
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  ranking: {
    type: Number,
    default: 0,
  },
});

schema.index({
  location: '2dsphere',
});

schema.index({
  code: 'text',
});

export default mongoose.model<Document, Model>(NAME, schema);
export { Model, Document };
