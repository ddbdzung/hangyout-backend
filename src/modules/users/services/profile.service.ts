import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { I18nCustomService } from '@/global/i18n/i18n.service';
import { RequestUser } from '@/global/casl/casl-ability.factory';
import { ElasticsearchCustomService } from '@/global/elasticsearch/elasticsearch.service';
import { Types, isObjectIdOrHexString } from 'mongoose';
import {
  IUserProfile,
  IUserProfileResponse,
} from '@/global/elasticsearch/interfaces/IUserProfile';

import { UserRepository } from '../repositories/user.repository';
import { UpdatePersonalInfoDto } from '../dtos/update-personal-info.dto';
import { ProfileRepository } from '../repositories/profile.repository';
import { UserDocument } from '../schemas/user.schema';

@Injectable()
export class ProfileService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly profileRepository: ProfileRepository,
    private readonly i18n: I18nCustomService,
    private readonly elasticsearchService: ElasticsearchCustomService,
    private readonly configService: ConfigService,
  ) {}

  private _transformObjectId(id: any) {
    if (!isObjectIdOrHexString(id)) {
      throw new Error(
        'Must be a valid ObjectId or string of 24 hex characters',
      );
    }

    return new Types.ObjectId(id);
  }

  async updatePersonalInfo(
    requestUser: RequestUser,
    updatePersonalInfoDto: UpdatePersonalInfoDto,
  ) {
    const preUpdateDocument: UpdatePersonalInfoDto & { isVerified?: boolean } =
      Object.assign({ isVerified: true }, updatePersonalInfoDto);
    if (
      updatePersonalInfoDto.email &&
      requestUser.email !== updatePersonalInfoDto.email
    ) {
      preUpdateDocument.isVerified = false;
    }
    try {
      const updatedUser = await this.profileRepository.atomicUpdate(
        { _id: requestUser._id },
        preUpdateDocument,
        {
          projection: '-password',
          new: true,
        },
      );

      return updatedUser;
    } catch (error) {
      if (error.code === 11000 || error?.codeName === 'DuplicateKey') {
        throw new BadRequestException(
          this.i18n.translate('profile.UPDATE_PERSONAL_INFO.EMAIL_IS_TAKEN', {
            args: { email: preUpdateDocument.email },
          }),
        );
      }
      throw error;
    }
  }

  async searchProfile(q: string) {
    const {
      hits: { hits },
    } = await this.elasticsearchService.searchMultiFields<IUserProfileResponse>(
      q,
      ['email', 'fullname'],
    );
    const ids = hits
      .filter(hit => hit._source.isDeactivated === false)
      .map(hit => hit._source.id);

    const profiles = this.profileRepository.getUsersByIds(
      ids.map(this._transformObjectId),
      '_id fullname email avatar',
    );
    return profiles;
  }

  async syncUserToElasticsearch(user: UserDocument) {
    const userProfile: IUserProfile = {
      id: user._id.toString(),
      isDeactivated: user.isDeactivated,
      email: user.email,
      fullname: user.fullname,
      role: user.role,
      isVerified: user.isVerified,
    };

    await this.elasticsearchService.insertOneDocument(
      this.configService.get('searchEngine.elasticsearch.indices.userProfile'),
      userProfile,
      user._id.toString(),
    );
  }
}
