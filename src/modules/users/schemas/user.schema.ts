import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { ApiProperty } from '@nestjs/swagger';
import * as bcrypt from 'bcrypt';

import { winstonLogger } from '@/config/logger.config';

import { GENDER, ROLE, SALT_ROUNDS } from '../users.constant';

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
  phoneNumber: {
    value: string;
    isHidden: boolean;
  };
  gender: {
    value: string;
    isHidden: boolean;
  };
}
@Schema({
  timestamps: false,
  id: false,
})
class CanHideProperty {
  value: any;
  isHidden: boolean;
}

@Schema({
  timestamps: false,
  id: false,
})
class PhoneNumber extends CanHideProperty {
  @ApiProperty({
    example: '+84123456789',
    type: String,
  })
  @Prop({ default: null, index: true, unique: true })
  value: string;

  @ApiProperty({
    example: true,
    type: Boolean,
  })
  @Prop({ default: true })
  isHidden: boolean;
}

class Gender extends CanHideProperty {
  @ApiProperty({
    example: GENDER.MALE,
    type: String,
  })
  @Prop({
    default: null,
    type: String,
  })
  value: GENDER;

  @ApiProperty({
    example: true,
    type: Boolean,
  })
  @Prop({ default: true })
  isHidden: boolean;
}

@Schema({
  timestamps: true,
})
export class User {
  @ApiProperty({
    example: 'Dang Duc Bao Dung',
    type: String,
    required: true,
    maxLength: 50,
    minLength: 1,
  })
  @Prop({ required: true, maxLength: 50, minLength: 1 })
  fullname: string;

  @ApiProperty({
    example: 'example@hotmail.com',
    type: String,
    required: true,
    maxLength: 256,
    minLength: 1,
  })
  @Prop({
    required: true,
    maxLength: 256,
    minLength: 1,
    index: true,
  })
  email: string;

  @ApiProperty({
    example: 'hashedPassword',
    type: String,
    required: true,
  })
  @Prop({ required: true })
  password: string;

  @ApiProperty({
    enum: ROLE,
    default: ROLE.USER,
  })
  @Prop({ default: ROLE.USER, index: true })
  role: ROLE;

  @ApiProperty({
    example: 'https://example.com/avatar.png',
    type: String,
    maxLength: 256,
  })
  @Prop({ maxLength: 256 })
  avatar: string;

  @ApiProperty({
    example: 'I am a student',
    type: String,
  })
  @Prop({ maxLength: 500 })
  bio: string;

  @ApiProperty({
    type: Boolean,
    default: false,
  })
  @Prop({ default: false })
  isVerified: boolean;

  @ApiProperty({ type: PhoneNumber })
  phoneNumber: PhoneNumber;

  @ApiProperty({ type: Gender })
  gender: Gender;
}

export const UserSchema = SchemaFactory.createForClass(User);

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
