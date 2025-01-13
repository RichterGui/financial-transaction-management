import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { AuthService } from './auth.service';
import { JwtPayloadInterface } from './jwtPayload.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      jwtFromRequest: (req) => {
        const authHeader = req?.headers?.authorization;
        if (!authHeader) {
          throw new Error('No authorization header');
        }
        return authHeader.split(' ')[1];
      },
      secretOrKey: process.env.SECRET,
    });
  }

  async validate(payload: JwtPayloadInterface) {
    return this.authService.validateUser(payload.userId);
  }
}
