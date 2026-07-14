import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiOkResponse } from '@nestjs/swagger';

import { CurrentUser } from '@/passport/current-user.decorator';
import type { TUSer } from '@/types/users.type';

import { LocalAuthGuard } from '../guards/local-auth.guard';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/create-user.dto';
import { UserResponseWrapperDto } from './dto/user-response.dto';

@Controller('users')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post()
  @ApiOkResponse({ type: UserResponseWrapperDto })
  createUser(@Body() createUser: RegisterDto): Promise<UserResponseWrapperDto> {
    return this.authService.create(createUser.user);
  }

  @UseGuards(LocalAuthGuard)
  @Post('/login')
  @ApiOkResponse({ type: UserResponseWrapperDto })
  login(@CurrentUser() user: TUSer): Promise<UserResponseWrapperDto> {
    return this.authService.login(user);
  }
}
