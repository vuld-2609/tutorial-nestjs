import { Controller, Get, UseGuards } from '@nestjs/common';

import { JwtAuthGuard } from '@/guards/jwt-auth.guard';
import { CurrentUser } from '@/passport/current-user.decorator';
import type { TUSer } from '@/types/users.type';

import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  me(@CurrentUser() user: TUSer) {
    return { user };
  }
}
