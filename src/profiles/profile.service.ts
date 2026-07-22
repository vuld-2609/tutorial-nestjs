import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { Prisma } from '@generated/prisma/client';

import { PrismaService } from '@/prisma/prisma.service';
import { t } from '@/utils/i18n.util';

import { ProfileResponseDto } from './dto/response-profile.dto';

@Injectable()
export class ProfileService {
  constructor(private readonly prismaService: PrismaService) {}

  async getProfile(username: string, currentUserId: number) {
    const user = await this.prismaService.user.findUnique({
      where: { username },
    });
    if (!user) {
      throw new NotFoundException(t('common.errors.not_found', { args: { entity: 'User' } }));
    }

    const following = await this.isFollowing(currentUserId, user.id);

    return { profile: new ProfileResponseDto(user, following) };
  }

  async follow(username: string, currentUserId: number) {
    const targetUser = await this.prismaService.user.findUnique({
      where: { username },
    });
    if (!targetUser) {
      throw new NotFoundException(t('common.errors.not_found', { args: { entity: 'User' } }));
    }

    if (currentUserId === targetUser.id) {
      throw new BadRequestException(t('common.errors.cannot_follow_self'));
    }

    try {
      await this.prismaService.follow.create({
        data: {
          followerId: currentUserId,
          followingId: targetUser.id,
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException(t('common.errors.already_following'));
      }
      throw error;
    }

    return { profile: new ProfileResponseDto(targetUser, true) };
  }

  async unfollow(username: string, currentUserId: number) {
    const targetUser = await this.prismaService.user.findUnique({
      where: { username },
    });
    if (!targetUser) {
      throw new NotFoundException(t('common.errors.not_found', { args: { entity: 'User' } }));
    }

    if (currentUserId === targetUser.id) {
      throw new BadRequestException(t('common.errors.cannot_unfollow_self'));
    }

    try {
      await this.prismaService.follow.delete({
        where: {
          followerId_followingId: {
            followerId: currentUserId,
            followingId: targetUser.id,
          },
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new NotFoundException(t('common.errors.not_following'));
      }
      throw error;
    }

    return { profile: new ProfileResponseDto(targetUser, false) };
  }

  private async isFollowing(followerId: number, followingId: number): Promise<boolean> {
    const follow = await this.prismaService.follow.findUnique({
      where: { followerId_followingId: { followerId, followingId } },
      select: { followerId: true },
    });

    return !!follow;
  }
}
