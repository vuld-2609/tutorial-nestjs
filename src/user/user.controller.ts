import { Body, Controller, Get, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse } from '@nestjs/swagger';

import { UserProfileWrapperDto } from '@/auth/dto/user-response.dto';
import { JwtAuthGuard } from '@/guards/jwt-auth.guard';
import { CurrentUser } from '@/passport/current-user.decorator';
import type { TAuthenticatedUser } from '@/types/users.type';

import { RefreshTokenDto } from './dto/refresh-token.dto';
import { UpdateUserWrapperDto } from './dto/update-user.dto';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Get()
  me(@CurrentUser() user: TAuthenticatedUser) {
    return this.userService.toUserProfile(user);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Put()
  @ApiOkResponse({ type: UserProfileWrapperDto })
  updateUser(
    @CurrentUser() user: TAuthenticatedUser,
    @Body() updateUser: UpdateUserWrapperDto,
  ): Promise<UserProfileWrapperDto> {
    return this.userService.update(user.id, updateUser.user);
  }

  @Post('refresh-token')
  refreshToken(@Body() dto: RefreshTokenDto) {
    return this.userService.refreshToken(dto.refreshToken);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Post('logout')
  logout(@CurrentUser() user: TAuthenticatedUser) {
    return this.userService.logout(user.id, user.token);
  }
}
