import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, SchemaTypes, Types } from 'mongoose';

import { winstonLogger } from '@/config/logger.config';
import { TOKEN_TYPE } from '../auth.constant';
import { ConfigService } from '@nestjs/config';

export type TokenDocument = HydratedDocument<Token>;

@Schema({
  timestamps: true,
})
export class Token {
  @Prop({ required: true, index: true })
  token: string;

  @Prop({
    type: SchemaTypes.ObjectId,
    index: true,
    ref: 'User',
    required: true,
  })
  user: Types.ObjectId;

  @Prop({ required: true })
  type: TOKEN_TYPE;

  @Prop({ required: true })
  expiresAt: Date;

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
