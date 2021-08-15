import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

export const AuthUser = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const gglContext = GqlExecutionContext.create(context).getContext();
    const user = gglContext['user'];
    return user;
  },
);
