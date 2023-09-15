import { BadRequestException, Injectable } from '@nestjs/common';

import { I18nCustomService } from '@/global/i18n/i18n.service';
import { RequestUser } from '@/global/casl/casl-ability.factory';

import { UserRepository } from '../repositories/user.repository';
import { UpdatePersonalInfoDto } from '../dtos/update-personal-info.dto';
import { ProfileRepository } from '../repositories/profile.repository';

@Injectable()
export class ProfileService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly profileRepository: ProfileRepository,
    private readonly i18n: I18nCustomService,
  ) {}

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
}
