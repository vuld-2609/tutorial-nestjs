import { Body, Controller, Get, Post, Put, UseGuards } from '@nestjs/common';
import { ApiOkResponse } from '@nestjs/swagger';

import { UserProfileWrapperDto } from '@/auth/dto/user-response.dto';
import { JwtAuthGuard } from '@/guards/jwt-auth.guard';
import { CurrentUser } from '@/passport/current-user.decorator';
import type { TUSer } from '@/types/users.type';

import { UpdateUserWrapperDto } from './dto/update-user.dto';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  me(@CurrentUser() user: TUSer) {
    return this.userService.toUserProfile(user);
  }

  @UseGuards(JwtAuthGuard)
  @Put()
  @ApiOkResponse({ type: UserProfileWrapperDto })
  updateUser(
    @CurrentUser() user: TUSer,
    @Body() updateUser: UpdateUserWrapperDto,
  ): Promise<UserProfileWrapperDto> {
    return this.userService.update(user.id, updateUser.user);
  }

  @Post('refresh-token')
  refreshToken(@Body('refreshToken') refreshToken: string) {
    return this.userService.refreshToken(refreshToken);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  logout(@CurrentUser() user: TUSer) {
    return this.userService.logout(user.id);
  }
}
