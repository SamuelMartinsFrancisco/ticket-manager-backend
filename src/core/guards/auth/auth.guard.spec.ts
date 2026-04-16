import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from './auth.guard';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let reflector: jest.Mocked<Reflector>;
  let jwtService: jest.Mocked<JwtService>;

  const createMockExecutionContext = (headers?: Record<string, string>): ExecutionContext => {
    const request = {
      headers: headers || {},
    } as any;

    return {
      switchToHttp: () => ({
        getRequest: () => request,
      }),
      getHandler: jest.fn(),
      getClass: jest.fn(),
    } as any;
  };

  beforeEach(async () => {
    reflector = { getAllAndOverride: jest.fn() } as any;

    jwtService = { verifyAsync: jest.fn() } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthGuard,
        { provide: Reflector, useValue: reflector },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    guard = module.get<AuthGuard>(AuthGuard);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('canActivate', () => {
    it('should grant access without token when route is public', async () => {
      reflector.getAllAndOverride.mockReturnValue(true);
      const context = createMockExecutionContext();

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
      expect(jwtService.verifyAsync).not.toHaveBeenCalled();
    });

    it('should validate Bearer token and attach payload to request', async () => {
      reflector.getAllAndOverride.mockReturnValue(false);
      const token = 'valid.jwt.token';
      const payload = { userId: 123, role: 'user' };
      const context = createMockExecutionContext({
        authorization: `Bearer ${token}`,
      });

      jwtService.verifyAsync.mockResolvedValue(payload);

      const result = await guard.canActivate(context);

      const request = context.switchToHttp().getRequest();
      expect(jwtService.verifyAsync).toHaveBeenCalledWith(token);
      expect(request['user']).toEqual(payload);
      expect(result).toBe(true);
    });

    it('should throw UnauthorizedException when Authorization header is missing', async () => {
      reflector.getAllAndOverride.mockReturnValue(false);
      const context = createMockExecutionContext();

      await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
      expect(jwtService.verifyAsync).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when Authorization header is not Bearer', async () => {
      reflector.getAllAndOverride.mockReturnValue(false);
      const context = createMockExecutionContext({
        authorization: 'Basic someBase64String',
      });

      await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
      expect(jwtService.verifyAsync).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when JWT verification fails', async () => {
      reflector.getAllAndOverride.mockReturnValue(false);
      const token = 'expired.token.here';
      const context = createMockExecutionContext({
        authorization: `Bearer ${token}`,
      });

      jwtService.verifyAsync.mockRejectedValue(new Error('TokenExpiredError'));

      await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
      expect(jwtService.verifyAsync).toHaveBeenCalledWith(token);
      const request = context.switchToHttp().getRequest();
      expect(request['user']).toBeUndefined();
    });

    it('should throw UnauthorizedException when token is empty after Bearer scheme', async () => {
      reflector.getAllAndOverride.mockReturnValue(false);
      const context = createMockExecutionContext({
        authorization: 'Bearer ',
      });

      await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
      expect(jwtService.verifyAsync).not.toHaveBeenCalled();
    });

    it('should reject lowercase bearer scheme due to case sensitivity', async () => {
      reflector.getAllAndOverride.mockReturnValue(false);
      const context = createMockExecutionContext({
        authorization: 'bearer lowercase.jwt.token',
      });

      await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
      expect(jwtService.verifyAsync).not.toHaveBeenCalled();
    });

    it('should overwrite existing request.user with verified payload', async () => {
      reflector.getAllAndOverride.mockReturnValue(false);
      const token = 'valid.jwt.token';
      const payload = { userId: 123, role: 'user' };
      const context = createMockExecutionContext({
        authorization: `Bearer ${token}`,
      });
      const request = context.switchToHttp().getRequest();
      request['user'] = { old: 'value' };

      jwtService.verifyAsync.mockResolvedValue(payload);

      const result = await guard.canActivate(context);

      expect(request['user']).toEqual(payload);
      expect(result).toBe(true);
    });

    it('should treat route as protected when IS_PUBLIC metadata is not found', async () => {
      reflector.getAllAndOverride.mockReturnValue(false);
      const context = createMockExecutionContext();

      await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
    });

    it('should propagate unexpected errors from Reflector', async () => {
      const error = new Error('Reflector internal failure');
      reflector.getAllAndOverride.mockImplementation(() => {
        throw error;
      });
      const context = createMockExecutionContext();

      await expect(guard.canActivate(context)).rejects.toThrow(error);
    });
  });
});