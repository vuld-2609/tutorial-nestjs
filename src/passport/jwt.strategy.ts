import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';

import { ExtractJwt, Strategy } from 'passport-jwt';

import { AuthService } from '@/auth/auth.service';
import { t } from '@/utils/i18n.util';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow('SECRET_KEY'),
    });
  }

  async validate(payload: { sub: number }) {
    try {
      return await this.authService.findById(payload.sub);
    } catch {
      throw new UnauthorizedException(t('common.errors.unauthorized'));
    }
  }
}
