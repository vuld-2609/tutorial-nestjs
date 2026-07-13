import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from '../guards/local-auth.guard';
import { RegisterDto } from './dto/create-user.dto';
import { CurrentUser } from 'src/passport/current-user.decorator';
import type { TUSer } from 'src/types/users.type';

@Controller('users')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post()
  createUser(@Body() createUser: RegisterDto) {
    return this.authService.create(createUser.user);
  }

  @UseGuards(LocalAuthGuard)
  @Post('/login')
  async login(@CurrentUser() user: TUSer) {
    return this.authService.login(user);
  }
}
