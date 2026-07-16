import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';

import * as bcrypt from 'bcrypt';

import { Prisma } from '@generated/prisma/client';

import { AuthService } from '@/auth/auth.service';
import { UserProfileDto, UserProfileWrapperDto } from '@/auth/dto/user-response.dto';
import { PrismaService } from '@/prisma/prisma.service';
import { RedisService } from '@/redis/redis.service';
import { TUSer } from '@/types/users.type';
import { t } from '@/utils/i18n.util';

import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly authService: AuthService,
    private readonly redisService: RedisService,
  ) {}

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

  async refreshToken(refreshToken: string) {
    const payload = await this.authService.verifyRefreshTokenPayload(refreshToken);
    const user = await this.authService.findById(payload.sub);

    if (!user?.refreshToken) {
      throw new UnauthorizedException(t('common.errors.access_denied'));
    }

    const isMatched = await bcrypt.compare(refreshToken, user.refreshToken);

    if (!isMatched) {
      throw new UnauthorizedException(t('common.errors.access_denied'));
    }

    const tokens = await this.authService.getTokens(user.id, user.email);
    await this.authService.setRefreshToken(user.id, tokens.refreshToken);

    return tokens;
  }

  async logout(userId: number, token: string) {
    const decoded = await this.authService.decodeToken(token);
    if (!decoded || !decoded.exp) {
      throw new UnauthorizedException(t('common.errors.unauthorized'));
    }

    const nowInSeconds = Math.floor(Date.now() / 1000);
    const remainingTTL = decoded.exp - nowInSeconds;
    if (remainingTTL > 0) {
      await this.redisService.set(`blacklist:${token}`, 'true', remainingTTL);
    }

    await this.authService.setRefreshToken(userId, null);

    return { success: true };
  }
}
