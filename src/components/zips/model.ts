import mongoose, { Schema, Model as MongooseModel } from 'mongoose';
import { Zip } from '@shelter/core/dist';
import { CustomMongooseDocument } from '@shelter/core/dist/utils/mongoose';

import { NAME } from './constants';

type Document = CustomMongooseDocument & Zip;
type Model = MongooseModel<Document>;

const schema = new Schema({
  code: {
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

schema.index({ code: 'text' });

export default mongoose.model<Document, Model>(NAME, schema);
export { Model, Document };
