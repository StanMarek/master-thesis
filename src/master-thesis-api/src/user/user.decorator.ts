import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import { UserDTO } from './dto/user.dto';

export const BasicUser = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): UserDTO | undefined => {
    const tokenPayload = ctx.switchToHttp().getRequest().user;
    const user = tokenPayload;

    if (!user) return;

    return {
      sub: user.sub,
    };
  },
);

export function User(): ParameterDecorator {
  return BasicUser();
}
