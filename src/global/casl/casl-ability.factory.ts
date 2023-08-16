import { Injectable } from '@nestjs/common';
import {
  Ability,
  AbilityBuilder,
  AbilityClass,
  ExtractSubjectType,
  InferSubjects,
} from '@casl/ability';
import { Types } from 'mongoose';

import { ROLE } from '@/modules/users/users.constant';
import { HydratedUserDocument } from '@/modules/users/schemas/user.schema';

import { Action } from './casl.constant';

type Subjects = InferSubjects<typeof HydratedUserDocument> | 'all';
export type AppAbility = Ability<[Action, Subjects]>;
export type RequestUser = {
  _id: Types.ObjectId;
  fullname: string;
  email: string;
  role: ROLE;
};

/**
 * @note Admin can not create, read, update or delete superadmin
 * @note Admin can not create, update or delete other admin
 * @note Admin can not delete himself
 * @note Superadmin can not be updated or deleted by himself
 * @note Superadmin can manage all other users
 */
@Injectable()
export class CaslAbilityFactory {
  createForUser(user: RequestUser) {
    const { can, cannot, build } = new AbilityBuilder<
      Ability<[Action, Subjects]>
    >(Ability as AbilityClass<AppAbility>);
    switch (user.role) {
      case ROLE.SUPERADMIN:
        can(Action.Create, HydratedUserDocument, {
          role: { $ne: ROLE.SUPERADMIN },
        });
        can(Action.Read, HydratedUserDocument);
        break;

      case ROLE.ADMIN:
        can(Action.Create, HydratedUserDocument, {
          role: { $nin: [ROLE.SUPERADMIN, ROLE.ADMIN] },
        });
        can(Action.Read, HydratedUserDocument, {
          role: { $ne: ROLE.SUPERADMIN },
        });
        break;

      case ROLE.USER:
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
