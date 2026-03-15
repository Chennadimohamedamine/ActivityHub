import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {

        constructor(private reflector: Reflector,
        private jwtService: JwtService,
    ) {
        super();
    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const isPublic = this.reflector.getAllAndOverride<boolean>(
            IS_PUBLIC_KEY,
            [
                context.getHandler(),
                context.getClass(),
            ],
        );

        if (isPublic) {
            return true;
        }

        const request = context.switchToHttp().getRequest();
        const token = this.extractTokenFromHeader(request);
        if (!token) {
            throw new UnauthorizedException('TOKEN_EXPIRED');
        }

        try {
            const payload = await this.jwtService.verifyAsync(token);
            request['user'] = payload;
        } catch {
            throw new UnauthorizedException('TOKEN_EXPIRED');
        }


        /*
            if response in frontend is : 401 and TOKEN_EXPIRED   -> should call /auth/refresh 
        */

        return true;





        
    }
        private extractTokenFromHeader(request: Request) {
        return request.cookies['access_token'];
    }
}



// import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
// import { Reflector } from "@nestjs/core";
// import { JwtService } from "@nestjs/jwt";
// import { Request } from 'express';
// import { IS_PUBLIC_KEY } from "../../shared/decorators/public.decorator";

// @Injectable()
// export class Auth_Guard implements CanActivate {
//     constructor (
//         private jwtService: JwtService,
//         private reflector: Reflector
//     ) {}

//     async canActivate(context: ExecutionContext): Promise<boolean> {

//         const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
//             context.getHandler(),
//             context.getClass()
//         ])

//         if (isPublic) return true;
        

//         const request = context.switchToHttp().getRequest();
//         const token = this.extractTokenFromHeader(request);
//         if (!token) {
//             throw new UnauthorizedException('TOKEN_EXPIRED');
//         }

//         try {
//             const payload = await this.jwtService.verifyAsync(token);
//             request['user'] = payload;
//         } catch {
//             throw new UnauthorizedException('TOKEN_EXPIRED');
//         }

//         return true;
        
//     }

//     private extractTokenFromHeader(request: Request) {
//         return request.cookies['access_token'];
//     }
// }