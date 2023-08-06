import { Injectable } from '@nestjs/common';
import {
  Ability,
  AbilityBuilder,
  AbilityClass,
  ExtractSubjectType,
  InferSubjects,
} from '@casl/ability';

import { HydratedUserDocument } from '@/modules/users/schemas/user.schema';

import { ROLE } from '@/modules/users/users.constant';

import { Action } from './casl.constant';
import { Types } from 'mongoose';
type Subjects = InferSubjects<typeof HydratedUserDocument> | 'all';

export type AppAbility = Ability<[Action, Subjects]>;
export type RequestUser = {
  _id: Types.ObjectId;
  fullname: string;
  email: string;
  role: ROLE;
};
@Injectable()
export class CaslAbilityFactory {
  createForUser(user: RequestUser) {
    const { can, cannot, build } = new AbilityBuilder<
      Ability<[Action, Subjects]>
    >(Ability as AbilityClass<AppAbility>);
    switch (user.role) {
      case ROLE.ADMIN:
        can(Action.Manage, 'all'); // read-write access to everything
        break;

      case ROLE.USER:
        can(Action.Read, HydratedUserDocument, { _id: user._id }); // read-only access to User itself
        can(Action.Update, HydratedUserDocument, { _id: user._id }); // read-write access to User itself
        break;

      default:
        break;
    }

    // can(Action.Update, Article, { authorId: user.id });
    // cannot(Action.Delete, Article, { isPublished: true });

    return build({
      // Read https://casl.js.org/v5/en/guide/subject-type-detection#use-classes-as-subject-types for details
      detectSubjectType: item =>
        item.constructor as ExtractSubjectType<Subjects>,
    });
  }
}
