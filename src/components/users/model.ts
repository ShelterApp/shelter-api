import mongoose, { Schema, Model as MongooseModel } from 'mongoose';
import { User, UserRole, AccountProvider } from '@shelter/core/dist';
import { CustomMongooseDocument } from '@shelter/core/dist/utils/mongoose';

import { NAME, PLATFORM_TYPE, ACCOUNT_PROVIDERS, USER_ROLES } from './constants';

type Document = CustomMongooseDocument & User;
type Model = MongooseModel<Document>;

const schema = new Schema({
  displayName: {
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
  roles: [{
    type: String,
    trim: true,
    enum: USER_ROLES,
    default: UserRole.Default,
  }],
  devices: [{
    platform: {
      type: String,
      enum: PLATFORM_TYPE,
    },
    token: {
      type: String,
      trim: true,
    },
    link: {
      type: String,
      trim: true,
    },
    deviceId: {
      type: String,
      trim: true,
    },
  }],
  favoriteServices: [{
    type: Schema.Types.ObjectId,
    ref: 'Service',
  }],
  lastMethod: {
    type: String,
    enum: ACCOUNT_PROVIDERS,
    default: AccountProvider.Local,
  },
  lastSignedIn: Date,
  totalServices: {
    type: Number,
    min: 1,
    default: 3,
  },
});

export default mongoose.model<Document, Model>(NAME, schema);
export { Model, Document };
