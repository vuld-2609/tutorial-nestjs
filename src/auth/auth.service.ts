import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import * as bcrypt from 'bcrypt';

import { Prisma } from '@generated/prisma/client';

import { CreateUserDto } from '@/auth/dto/create-user.dto';
import { UserResponseDto, UserResponseWrapperDto } from '@/auth/dto/user-response.dto';
import { PrismaService } from '@/prisma/prisma.service';
import { TUSer } from '@/types/users.type';
import { t } from '@/utils/i18n.util';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prismaService: PrismaService,
  ) {}

  async create(dto: CreateUserDto): Promise<UserResponseWrapperDto> {
    try {
      const hashedPassword = await bcrypt.hash(dto.password, 10);
      const user = await this.prismaService.user.create({
        data: {
          ...dto,
          password: hashedPassword,
        },
      });
      return this.buildUserResponse(user);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          const target = this.getUniqueConstraintFields(error.meta);
          throw new ConflictException(
            t('common.errors.already_exists', {
              args: { field: target ? target.join(', ') : 'Data' },
            }),
          );
        }
      }

      throw new InternalServerErrorException(t('common.errors.internal_server_error'));
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
    if (!user) {
      throw new NotFoundException(t('common.errors.not_found', { args: { entity: 'User' } }));
    }

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

  async login(user: TUSer): Promise<UserResponseWrapperDto> {
    return this.buildUserResponse(user);
  }

  private buildUserResponse(user: TUSer): UserResponseWrapperDto {
    const token = this.jwtService.sign({ email: user.email, sub: user.id });
    return { user: new UserResponseDto(user, token) };
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
