import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

import { User } from '@/modules/users/schemas/user.schema';

@Schema()
export class Post {
  @Prop({ required: true, minLength: 1, maxLength: 500 })
  title: string;

  @Prop({ required: true, minLength: 1, maxLength: 50000 })
  content: string;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  author_id: User;

  @Prop({ maxLength: 256 })
  images: string[];

  @Prop({ type: Types.ObjectId, ref: 'User' })
  likes: User[];

  @Prop({ default: Date.now() })
  created_at: Date;

  @Prop({ default: Date.now() })
  updated_at: Date;
}
export type PostDocument = HydratedDocument<Post>;
export const PostSchema = SchemaFactory.createForClass(Post);
