import mongoose, { Schema, Model as MongooseModel } from 'mongoose';
import { City } from '@shelter/core/dist';
import { CustomMongooseDocument } from '@shelter/core/dist/utils/mongoose';

import { NAME } from './constants';

type Document = CustomMongooseDocument & City;
type Model = MongooseModel<Document>;

const schema = new Schema({
  name: {
    type: String,
    trim: true,
    required: true,
  },
  state: {
    type: String,
    trim: true,
    required: true,
  },
  search: {
    type: String,
    trim: true,
    required: true,
    unique: true,
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
});

schema.index({ search: 'text' });

export default mongoose.model<Document, Model>(NAME, schema);
export { Model, Document };
