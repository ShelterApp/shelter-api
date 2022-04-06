import mongoose, { Schema, Model as MongooseModel } from 'mongoose';
import { StaticPage } from '@shelter/core/dist';
import { CustomMongooseDocument } from '@shelter/core/dist/utils/mongoose';

import { NAME } from './constants';

type Document = CustomMongooseDocument & StaticPage;
type Model = MongooseModel<Document>;

const schema = new Schema({
  code: {
    type: String,
    trim: true,
    unique: true,
    required: true,
  },
  name: {
    type: String,
    trim: true,
    required: true,
  },
  content: {
    type: String,
    trim: true,
    required: true,
  },
});

export default mongoose.model<Document, Model>(NAME, schema);
export { Model, Document };
