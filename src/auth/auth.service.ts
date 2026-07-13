import {
  Injectable,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { I18nContext } from 'nestjs-i18n';
import { PrismaService } from 'src/prisma/prisma.service';
import { TUSer } from 'src/types/users.type';
import { CreateUserDto } from 'src/auth/dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { Prisma } from '../../generated/prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prismaService: PrismaService,
  ) {}

  async create(dto: CreateUserDto) {
    const i18n = I18nContext.current();

    try {
      const hashedPassword = await bcrypt.hash(dto.password, 10);
      return await this.prismaService.user.create({
        data: {
          ...dto,
          password: hashedPassword,
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          const target = this.getUniqueConstraintFields(error.meta);
          throw new ConflictException(
            i18n?.t('common.errors.already_exists', {
              args: { field: target ? target.join(', ') : 'Data' },
            }),
          );
        }
      }

      throw new InternalServerErrorException(
        i18n?.t('common.errors.internal_server_error'),
      );
    }
  }

  findByEmail(email: string) {
    return this.prismaService.user.findUnique({
      where: {
        email,
      },
    });
  }

  async findById(id: number) {
    const user = await this.prismaService.user.findUnique({ where: { id } });
    if (!user) return null;

    const { password: _password, ...safeUser } = user;
    return safeUser;
  }

  async validateUser(email: string, password: string) {
    const user = await this.findByEmail(email);
    if (!user) return null;

    const status = bcrypt.compareSync(password, user.password);
    if (status) return user;

    return null;
  }

  async login(user: TUSer) {
    const payload = { email: user.email, sub: user.id };

    return {
      user: {
        email: user.email,
        token: this.jwtService.sign(payload),
        username: user.username,
        bio: user.bio,
        image: user.image,
      },
    };
  }

  private getUniqueConstraintFields(
    meta: Record<string, unknown> | undefined,
  ): string[] | undefined {
    if (!meta) return undefined;

    if (Array.isArray(meta.target)) {
      return meta.target as string[];
    }

    const driverAdapterError = meta.driverAdapterError as
      { cause?: { constraint?: { fields?: string[] } } } | undefined;
    return driverAdapterError?.cause?.constraint?.fields;
  }
}
