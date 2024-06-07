import { ExecutionContext, createParamDecorator } from '@nestjs/common';

export const BasicUser = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): { sub: string } | undefined => {
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
