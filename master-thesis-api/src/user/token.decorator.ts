import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import { UserDTO } from './dto/user.dto';

export const JwtToken = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): string | undefined => {
    const tokenPayload = ctx.switchToHttp().getRequest().headers.authorization;
    if (!tokenPayload) return null;

    const token = tokenPayload.split(' ')[1];

    return token;
  },
);

export function Token(): ParameterDecorator {
  return JwtToken();
}
