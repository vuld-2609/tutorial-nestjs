import { Injectable, NotFoundException } from '@nestjs/common';

import * as bcrypt from 'bcrypt';

import { Prisma } from '@generated/prisma/client';

import { UserProfileDto, UserProfileWrapperDto } from '@/auth/dto/user-response.dto';
import { PrismaService } from '@/prisma/prisma.service';
import { TUSer } from '@/types/users.type';
import { t } from '@/utils/i18n.util';

import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(private readonly prismaService: PrismaService) {}

  toUserProfile(user: TUSer): UserProfileWrapperDto {
    return { user: new UserProfileDto(user) };
  }

  async update(id: number, dto: UpdateUserDto): Promise<UserProfileWrapperDto> {
    const { newPassword, confirmNewPassword: _confirmNewPassword, ...rest } = dto;

    try {
      const user = await this.prismaService.user.update({
        where: { id },
        data: {
          ...rest,
          ...(newPassword && { password: await bcrypt.hash(newPassword, 10) }),
        },
      });

      return this.toUserProfile(user);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new NotFoundException(t('common.errors.not_found', { args: { entity: 'User' } }));
      }
      throw error;
    }
  }
}
