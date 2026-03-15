import { Body, Controller, Get, HttpException, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Public } from 'src/common/decorators/public.decorator';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import type { Request, Response } from 'express';
import { User } from '../users/entities/user.entity';
import { AuthGuard } from '@nestjs/passport';
import { Console } from 'console';
import type { AuthUser } from 'src/common/interfaces/auth-user.interface';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) { }


@Public()
@Get('google/login')
@UseGuards(AuthGuard('google'))
googleAuth() {
}

  @Public()
 @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleRedirect(
    @CurrentUser() googleUser: any,
    @Res() res: Response,
  ) {
    const { accessToken, refreshToken } =
      await this.authService.googleLogin(googleUser);

    res.cookie('access_token', accessToken, {
      httpOnly: true,
      sameSite: 'strict',
      secure: false,
    });

    //Refresh Token
    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      sameSite: 'strict',
      secure: false,
      path: '/auth/refresh',
    });

    return res.redirect('https://localhost/dashboard');
  }



  @Public()
  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }


  @Public()
  @Post('login')
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { accessToken, refreshToken } =
      await this.authService.login(dto);


    //  Access Token 
    res.cookie('access_token', accessToken, {
      httpOnly: true,
      sameSite: 'strict',
      secure: false,
    });

    //Refresh Token
    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      sameSite: 'strict',
      secure: false,
      path: '/auth/refresh',
    });

    return { success: true };
  }

  
  @Public()
  @Post('refresh')
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = req.cookies?.refresh_token;
    
    const { accessToken, newRefreshToken } =
    await this.authService.refresh(refreshToken);


  // Access Token
  res.cookie('access_token', accessToken, {
    httpOnly: true,
    sameSite: 'lax',
    secure: false,
  });

  //  Refresh Token
  res.cookie('refresh_token', newRefreshToken, {
    httpOnly: true,
    sameSite: 'lax',
    secure: false,
    path: '/auth/refresh',
});

  return { success: true };
}

  @Get('me')
  getMe(@CurrentUser() user: AuthUser) {
    return user;
  }

  @Post('logout')
  async logout(
    @CurrentUser() user: any,
    @Res({ passthrough: true }) res: Response,
  ) {

    await this.authService.logout(user.sub);

    res.clearCookie('access_token' , { path: '/' });
    res.clearCookie('refresh_token', { path: '/auth/refresh' });

    return { success: true };
  } 

}