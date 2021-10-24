import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { resolveSoa } from 'dns';
import { User } from 'src/users/entities/user.entity';
import { AllowedRoles } from './role.decorator';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}
  canActivate(context: ExecutionContext) {
    // if false, block the request
    const roles = this.reflector.get<AllowedRoles>(
      'roles',
      context.getHandler(),
    );
    if (!roles) {
      // doesn't have a metadata
      return true;
    }

    const gqlContext = GqlExecutionContext.create(context).getContext();
    //console.log(gqlContext);
    // WS --> undefined
    // 누가 gaurad에게 context를 주었을까?
    // HTTP request -> jwt-middle ware -> take token from header, and find user
    // jwt put in req -> gql find user
    const user: User = gqlContext['user'];
    if (!user) {
      // invalid token. can't go ahead...
      return false;
    }
    if (roles.includes('Any')) {
      return true;
    }

    return roles.includes(user.role);
  }
}
