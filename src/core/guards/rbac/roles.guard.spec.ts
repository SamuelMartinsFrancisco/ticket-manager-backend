import { Reflector } from '@nestjs/core';
import { UserRole } from '@/modules/users/user.dto';
import { RolesGuard } from './roles.guard';
import { ROUTE_REQUIRED_ROLES } from './roles.decorator';
import { IS_PUBLIC } from '../auth/public.decorator';
import { createFakeTokenPayload, createMockExecutionContext } from '@/utils/test/mocks/commons.mock';
import { TokenPayload } from '@/modules/auth/auth.types';

interface ContextSetup {
  user?: TokenPayload;
  requiredRoles?: UserRole[];
  isPublic?: boolean;
}

let rolesGuard: RolesGuard;
let reflectorMock: jest.Mocked<Reflector>;

const setupContext = ({ user, isPublic = false, requiredRoles }: ContextSetup) => {
  const { contextMock, getRequestMock } = createMockExecutionContext();

  reflectorMock.getAllAndOverride.mockImplementation((metadataKey) => {
    if (metadataKey === IS_PUBLIC) return isPublic;
    if (metadataKey === ROUTE_REQUIRED_ROLES) return requiredRoles;
    return undefined;
  });

  getRequestMock.mockReturnValue({ user });
  return contextMock;
};

describe('RolesGuard', () => {
  beforeEach(() => {
    reflectorMock = { getAllAndOverride: jest.fn() } as any;
    rolesGuard = new RolesGuard(reflectorMock);
  });


  it('should allow access when route is public', () => {
    const context = setupContext({ user: undefined, isPublic: true });
    expect(rolesGuard.canActivate(context)).toBe(true);
    expect(reflectorMock.getAllAndOverride).toHaveBeenCalledWith(IS_PUBLIC, expect.anything());
  });

  it('should allow access when no required roles are defined (empty array)', () => {
    const user = createFakeTokenPayload();
    const context = setupContext({ user, requiredRoles: [] });
    expect(rolesGuard.canActivate(context)).toBe(true);
  });

  it('should allow access when no required roles are defined (undefined)', () => {
    const user = createFakeTokenPayload();
    const context = setupContext({ user, requiredRoles: undefined });
    expect(rolesGuard.canActivate(context)).toBe(true);
  });

  it('should allow access when user role matches a required role', () => {
    const user = createFakeTokenPayload({ role: UserRole.ADMIN });
    const context = setupContext({ user, requiredRoles: [UserRole.ADMIN] });
    expect(rolesGuard.canActivate(context)).toBe(true);
  });

  it('should allow access when user role matches any of multiple required roles', () => {
    const user = createFakeTokenPayload({ role: UserRole.TECHNICIAN });
    const context = setupContext({ user, requiredRoles: [UserRole.ADMIN, UserRole.TECHNICIAN] });
    expect(rolesGuard.canActivate(context)).toBe(true);
  });

  it('should deny access when user role does not match any required role', () => {
    const user = createFakeTokenPayload({ role: UserRole.CLIENT });
    const context = setupContext({ user, requiredRoles: [UserRole.ADMIN, UserRole.TECHNICIAN] });
    expect(rolesGuard.canActivate(context)).toBe(false);
  });

  it('should deny access when user is missing (undefined) and required roles exist', () => {
    const context = setupContext({ user: undefined, requiredRoles: [UserRole.ADMIN] });
    expect(rolesGuard.canActivate(context)).toBe(false);
  });

  it('should call reflector with correct handler and class for both metadata keys', () => {
    const user = createFakeTokenPayload();
    const context = setupContext({ user });
    const handler = context.getHandler();
    const classType = context.getClass();

    rolesGuard.canActivate(context);

    expect(reflectorMock.getAllAndOverride).toHaveBeenCalledWith(IS_PUBLIC, [handler, classType]);
    expect(reflectorMock.getAllAndOverride).toHaveBeenCalledWith(ROUTE_REQUIRED_ROLES, [handler, classType]);
  });
});