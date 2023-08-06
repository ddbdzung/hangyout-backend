import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';

import { winstonLogger } from '@/config/logger.config';

import { ROLE } from '../users.constant';

export type UserDocument = HydratedDocument<User>;

export class HydratedUserDocument {
  constructor(partial: Partial<HydratedUserDocument>) {
    Object.assign(this, partial);
  }
  _id: Types.ObjectId;
  fullname: string;
  email: string;
  role: ROLE;
  avatar: string;
  bio: string;
  isVerified: boolean;
}

@Schema({
  timestamps: true,
})
export class User {
  @Prop({ required: true, maxLength: 50, minLength: 1 })
  fullname: string;

  @Prop({
    required: true,
    unique: true,
    maxLength: 256,
    minLength: 1,
    index: true,
  })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ default: ROLE.USER })
  role: ROLE;

  @Prop({ maxLength: 256 })
  avatar: string;

  @Prop({ maxLength: 500 })
  bio: string;

  @Prop({ default: false })
  isVerified: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);

export const SALT_ROUNDS = 10;

export const UserFactory = () => {
  const schema = UserSchema;
  const config = new ConfigService();
  if (config.get('NODE_ENV') !== 'test') {
    winstonLogger.log(`Collection ${User.name} created!`);
  }
  schema.pre('save', async function (next) {
    const user = this as UserDocument;
    if (!user.isModified('password')) return next();

    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    const prePassword = user.password;
    user.password = await bcrypt.hash(prePassword, salt);

    next();
  });

  return schema;
};
