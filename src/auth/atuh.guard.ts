import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { resolveSoa } from 'dns';
import { JwtService } from 'src/jwt/jwt.service';
import { User } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';
import { AllowedRoles } from './role.decorator';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwtService: JwtService,
    private readonly userService: UsersService,
  ) {}
  async canActivate(context: ExecutionContext) {
    // if false, block the request
    const roles = this.reflector.get<AllowedRoles>(
      'roles',
      context.getHandler(),
    );
    if (!roles) {
      // doesn't have a metadata
      return true;
    }

    // console.log(gqlContext.token);
    // WS --> undefined
    // 누가 gaurad에게 context를 주었을까?
    // HTTP request -> jwt-middle ware -> take token from header, and find user
    // jwt put in req -> gql find user

    const gqlContext = GqlExecutionContext.create(context).getContext();
    const token = gqlContext.token;

    if (token) {
      const decoded = this.jwtService.verify(token.toString());
      if (typeof decoded === 'object' && decoded.hasOwnProperty('id')) {
        const { user } = await this.userService.findById(decoded['id']);
        // attach the user to request object
        if (!user) {
          // invalid token. can't go ahead...
          return false;
        }
        // guard가 user를 gqlcontext에 추가
        gqlContext['user'] = user;
        if (roles.includes('Any')) {
          return true;
        }
        // done
        return roles.includes(user.role);
      } else {
        return false;
      }
    } else {
      return false;
    }
  }
}
