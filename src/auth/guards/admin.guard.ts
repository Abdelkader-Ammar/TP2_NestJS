import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { UserEntity } from '../../user/entities/user.entity';
import { isAdmin } from '../../user/roles';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const { user } = context.switchToHttp().getRequest<{ user?: UserEntity }>();
    return !!user && isAdmin(user);
  }
}
