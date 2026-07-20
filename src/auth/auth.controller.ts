import { Body, Controller, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBody, ApiOkResponse } from '@nestjs/swagger';

import { CurrentUser } from '@/passport/current-user.decorator';
import type { TUSer } from '@/types/users.type';

import { LocalAuthGuard } from '../guards/local-auth.guard';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
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
  @ApiBody({ type: LoginDto })
  @ApiOkResponse({ type: UserResponseWrapperDto })
  login(@CurrentUser() user: TUSer): Promise<UserResponseWrapperDto> {
    return this.authService.login(user);
  }
}
