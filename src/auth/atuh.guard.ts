import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext) {
    // if false, block the request
    const gglContext = GqlExecutionContext.create(context).getContext();
    const user = gglContext['user'];
    if (!user) {
      return false;
    }
    return true;
  }
}
