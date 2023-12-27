import { HttpException, HttpStatus, Injectable, Req } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { authenticator } from 'otplib';
import { PrismaService } from 'src/prisma/prisma.service';
import { toDataURL } from 'qrcode';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  async getUser(id: string): Promise<User> {
    let user: User;
    try {
      user = await this.prisma.user.findUnique({
        where: { id },
      });
      if (!user) throw new Error('User not found');
      delete user.twoFactorsSecret;
      return user;
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async enable2fa(user: User): Promise<{ qrcodeUrl: string }> {
    try {
      if (user.isTwofactorsEnabled === false) {
        const secret = authenticator.generateSecret();
        const otpAuthUrl = authenticator.keyuri(
          user.email,
          'ft_transcendence',
          secret,
        );
        const qrcodeDataUrl = await toDataURL(otpAuthUrl);
        await this.prisma.user.update({
          where: { username: user.username },
          data: {
            twoFactorsSecret: secret,
          },
        });
        return { qrcodeUrl: qrcodeDataUrl };
      }
    } catch (error) {
      throw new Error('Failed to enable 2fa for user');
    }
  }

  async disable2fa(user: User): Promise<{ isDisable: boolean }> {
    try {
      let updatedUser: User;
      if (user.isTwofactorsEnabled === true) {
        updatedUser = await this.prisma.user.update({
          where: { username: user.username },
          data: {
            twoFactorsSecret: null,
            // qrcodeUrl: null,
            isTwofactorsEnabled: false,
          },
        });
      }
      return { isDisable: !updatedUser.isTwofactorsEnabled ? true : false };
    } catch (error) {
      throw new Error('Failed to disable 2fa for user');
    }
  }

  async verify2fa(user: User, token: string): Promise<{ isValid: boolean }> {
    try {
      const isValid = authenticator.verify({
        token: token,
        secret: user.twoFactorsSecret,
      });

      if (isValid && user.isTwofactorsEnabled === false) {
        await this.prisma.user.update({
          where: { username: user.username },
          data: {
            isTwofactorsEnabled: true,
          },
        });
      }
      return { isValid };
    } catch (error) {
      throw new Error('Failed to verify 2fa for user');
    }
  }
  async verify2fLogin(
    id: string,
    token: string,
  ): Promise<{ isValid: boolean; accessToken: string }> {
    let user: User;
    let accessToken: string = '';
    try {
      user = await this.prisma.user.findUnique({ where: { id } });

      if (!user) throw new Error('User not found for getting his secret');

      const isValid = authenticator.verify({
        token: token,
        secret: user.twoFactorsSecret,
      });

      if (isValid === true && user.isTwofactorsEnabled === true) {
        const payload = { sub: user.id, username: user.username };
        accessToken = await this.jwt.signAsync(payload, {
          secret: this.config.get('JWT_SECRET'),
        });
      }

      return { isValid, accessToken };
    } catch (error) {
      throw new Error('Failed to verify 2fa for user in first login');
    }
  }

  async getMe(id: string): Promise<User> {
    console.log('getMe id :: ', id, ' ::');
    let user: User;
    try {
      user = await this.prisma.user.findUnique({
        where: { id },
      });
      if (!user) throw new Error('User not found');
      delete user.twoFactorsSecret;
      return user;
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async updateUser({ username, avatarUrl}, user:User): Promise<User> {
    try {
      const userUpdate = await this.prisma.user.update({
        where: { username: user.username },
        data: {
          username: username,
          avatarUrl: avatarUrl,
        },
      });
      return userUpdate;
    } catch (error) {
      let errorMessage = 'An error occurred while updating the user.';
  
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          errorMessage = 'The username is already taken.';
        }
      } else if (error instanceof Prisma.PrismaClientValidationError) {
        errorMessage = 'Invalid data provided for user update.';
      }
  
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: errorMessage,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}