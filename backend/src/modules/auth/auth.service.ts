import { HttpException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { RegisterDto } from './dto/register.dto';
import { User } from '../users/entities/user.entity';
import { ErrorCode } from 'src/common/errors/error-codes';
import { LoginDto } from './dto/login.dto';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { RefreshToken } from './entities/refresh-token.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    @InjectRepository(RefreshToken)
    private readonly refreshRepo: Repository<RefreshToken>
  ) { }

async register(dto: RegisterDto) {
  const existingEmail = await this.usersService.findByEmail(dto.email);
  if (existingEmail) {
    throw new UnauthorizedException({
      code: ErrorCode.EMAIL_ALREADY_EXISTS,
      message: 'Email already in use',
    });
  }

  const existingUsername = await this.usersService.findByUsername(dto.username);
  if (existingUsername) {
    throw new UnauthorizedException({
      code: ErrorCode.USERNAME_ALREADY_EXISTS,
      message: 'Username already in use',
    });
  }
  const hashed = await bcrypt.hash(dto.password, 10);

  const newUser = await this.usersService.create({
    email: dto.email,
    password: hashed,
    Firstname: dto.firstName,
    Lastname: dto.lastName,
    Username: dto.username,
  });

  const { password, ...result } = newUser;
  return result;
}


  async login(dto: LoginDto) {
      const user = await this.usersService.findByEmail(dto.email);
      // if (user && user.provider !== 'local') {
      if (!user || !(await bcrypt.compare(dto.password, user.password))) {
        throw new UnauthorizedException({
          code: ErrorCode.INVALID_CREDENTIALS,
          message: 'Invalid email or password',
        });
      }

      const accessToken = await this.generateAccessToken(user);
      const refreshToken = await this.generateRefreshToken(user);

      // await this.saveInDB(user, refreshToken);

      return { accessToken, refreshToken };
  }


async googleLogin(googleUser: any) {
  if (!googleUser) {
    throw new UnauthorizedException('No user from Google');
  }

  let user = await this.usersService.findByEmail(googleUser.email);

  if (!user) {
    user = await this.usersService.create({
      email: googleUser.email,
      Firstname: googleUser.firstName,
      Lastname: googleUser.lastName,
      Username: googleUser.email.split('@')[0],
      googleId: googleUser.googleId,
    });
  }

    const accessToken = await this.generateAccessToken(user);
    const refreshToken = await this.generateRefreshToken(user);

  return {
    accessToken,
    refreshToken,
  };
}


  async refresh(rawToken: string) {
    if (!rawToken) {
      throw new UnauthorizedException('Missing refresh token');
    }
  
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');



    const tokenEntity = await this.refreshRepo.findOne({
      where: { hashedToken },
      relations: ['user'],
    });

    if (!tokenEntity || tokenEntity.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    await this.refreshRepo.delete({ id: tokenEntity.id });

    const accessToken = await this.generateAccessToken(tokenEntity.user);
    const newRefreshToken = await this.generateRefreshToken(tokenEntity.user);

    return { accessToken, newRefreshToken };
  }



  private async generateAccessToken(user: User): Promise<string> {
    return this.jwtService.signAsync(
      {
        sub: user.id,
        email: user.email,
        role: user.role,
      },
      {
        secret: this.config.getOrThrow('JWT_SECRET'),
        expiresIn: this.config.getOrThrow('JWT_EXPIRES_IN'),
      },
    );
  }


   private async generateRefreshToken(user: User): Promise<string> {
    const rawToken = crypto.randomBytes(32).toString('hex');

    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

    const expiresAt = new Date();
    expiresAt.setDate(
      expiresAt.getDate() + Number(this.config.getOrThrow('REFRESH_TOKEN_EXPIRES_DAYS')),
    );

    const refreshToken = this.refreshRepo.create({
      hashedToken,
      user,
      expiresAt,
    });

    await this.refreshRepo.save(refreshToken);

    return rawToken;
  }
  
  
  async logout(userId: string) {
    await this.refreshRepo.delete({ user: { id: userId } });
  }
  // private async generateRefreshToken(user: User): Promise<string> {
  //   return crypto.randomBytes(32).toString('hex');
  // }

  // private async saveInDB(user: User, rawToken: string) {
  //   const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

  //   const expiresAt = new Date();
  //   expiresAt.setDate(
  //     expiresAt.getDate() + Number(this.config.getOrThrow('REFRESH_TOKEN_EXPIRES_DAYS')),
  //   );

  //   const refreshToken = this.refreshRepo.create({
  //     hashedToken,
  //     user,
  //     expiresAt,
  //   });

  //   await this.refreshRepo.save(refreshToken);
  // }


}

