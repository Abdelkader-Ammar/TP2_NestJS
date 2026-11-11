import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserEntity } from '../../user/entities/user.entity';

export const GetUser = createParamDecorator((_data: unknown, ctx: ExecutionContext): UserEntity => {
  return ctx.switchToHttp().getRequest<{ user: UserEntity }>().user;
});
