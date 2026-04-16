// roles.decorator.ts
import { SetMetadata } from '@nestjs/common';
import { UserRole } from '@/modules/users/user.dto';

export const ROUTE_REQUIRED_ROLES = 'roles';
export const Roles = (...roles: UserRole[]) => SetMetadata(ROUTE_REQUIRED_ROLES, roles);