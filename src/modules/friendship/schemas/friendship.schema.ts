import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, SchemaTypes, Types } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { ApiProperty } from '@nestjs/swagger';

import { winstonLogger } from '@/config/logger.config';

export type FriendshipDocument = HydratedDocument<Friendship>;

@Schema({
  timestamps: true,
})
export class Friendship {
  @ApiProperty({
    example: '60b9b0b9e1b9f3b3e0b9b0b9',
    type: SchemaTypes.ObjectId,
    required: true,
  })
  @Prop({
    type: SchemaTypes.ObjectId,
    index: true,
    ref: 'User',
    required: true,
  })
  requester: Types.ObjectId;

  @ApiProperty({
    example: '60b9b0b9e1b9f3b3e0b9b0b9',
    type: SchemaTypes.ObjectId,
    required: true,
  })
  @Prop({
    type: SchemaTypes.ObjectId,
    index: true,
    ref: 'User',
    required: true,
  })
  addressee: Types.ObjectId;

  @ApiProperty({
    type: Boolean,
    default: false,
  })
  @Prop({ default: false })
  isRequesterBlocked: boolean;

  @ApiProperty({
    type: Boolean,
    default: true,
  })
  @Prop({ default: true })
  isRequesting: boolean;
}

export const FriendshipSchema = SchemaFactory.createForClass(Friendship);

export const FriendshipFactory = () => {
  const schema = FriendshipSchema;
  const config = new ConfigService();
  if (config.get('NODE_ENV') !== 'test') {
    winstonLogger.log(`Collection ${Friendship.name} created!`);
  }

  return schema;
};
