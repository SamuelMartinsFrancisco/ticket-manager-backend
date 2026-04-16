import { Injectable, CanActivate, ExecutionContext, Type } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '@/modules/users/user.dto';
import { ROUTE_REQUIRED_ROLES } from './roles.decorator';
import { IS_PUBLIC } from '../auth/public.decorator';
import { TokenPayload as RequestUser } from '@/modules/auth/auth.types';

type TargetHandlerDetails = [
  Function,
  Type<unknown>,
]

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) { }

  private hasRequiredRole(
    user: RequestUser,
    targetHandler: TargetHandlerDetails,
  ): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROUTE_REQUIRED_ROLES,
      targetHandler
    );

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    return requiredRoles.some((role) => user?.role === role);
  }

  canActivate(context: ExecutionContext): boolean {
    const targetHandler: TargetHandlerDetails = [
      context.getHandler(),
      context.getClass()
    ];

    const isPublic = this.reflector.getAllAndOverride<boolean>(
      IS_PUBLIC,
      targetHandler
    );

    if (isPublic) return true;

    const { user } = context.switchToHttp().getRequest();
    return this.hasRequiredRole(user, targetHandler);
  }
}