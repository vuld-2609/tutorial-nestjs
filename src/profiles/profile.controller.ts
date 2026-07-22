import { Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse } from '@nestjs/swagger';

import { JwtAuthGuard } from '@/guards/jwt-auth.guard';
import { CurrentUser } from '@/passport/current-user.decorator';
import type { TAuthenticatedUser } from '@/types/users.type';

import { ProfileResponseWrapperDto } from './dto/response-profile.dto';
import { ProfileService } from './profile.service';

@Controller('profiles')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOkResponse({ type: ProfileResponseWrapperDto })
  @Post('/:username/follow')
  async followUser(
    @Param('username') username: string,
    @CurrentUser() currentUser: TAuthenticatedUser,
  ) {
    return this.profileService.follow(username, currentUser.id);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOkResponse({ type: ProfileResponseWrapperDto })
  @Delete('/:username/unfollow')
  async unfollowUser(
    @Param('username') username: string,
    @CurrentUser() currentUser: TAuthenticatedUser,
  ) {
    return this.profileService.unfollow(username, currentUser.id);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOkResponse({ type: ProfileResponseWrapperDto })
  @Get('/:username')
  async getUserProfile(
    @Param('username') username: string,
    @CurrentUser() currentUser: TAuthenticatedUser,
  ) {
    return this.profileService.getProfile(username, currentUser.id);
  }
}
