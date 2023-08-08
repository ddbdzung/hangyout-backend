import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, SchemaTypes, Types } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { ApiProperty } from '@nestjs/swagger';

import { winstonLogger } from '@/config/logger.config';

import { TOKEN_TYPE } from '../auth.constant';

export type TokenDocument = HydratedDocument<Token>;

@Schema({
  timestamps: true,
})
export class Token {
  @ApiProperty({
    type: String,
    required: true,
  })
  @Prop({ required: true, index: true })
  token: string;

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
  user: Types.ObjectId;

  @ApiProperty({
    enum: TOKEN_TYPE,
    required: true,
  })
  @Prop({ required: true })
  type: TOKEN_TYPE;

  @ApiProperty({
    type: Date,
    required: true,
  })
  @Prop({ required: true })
  expiresAt: Date;

  @ApiProperty({
    type: Boolean,
    default: false,
  })
  @Prop({ default: false })
  blacklisted: boolean;
}

export const TokenSchema = SchemaFactory.createForClass(Token);

export const TokenFactory = () => {
  const schema = TokenSchema;
  schema.index({ type: 1, user: 1 });
  const config = new ConfigService();
  if (config.get('NODE_ENV') !== 'test') {
    winstonLogger.log(`Collection ${Token.name} created!`);
  }

  return schema;
};
