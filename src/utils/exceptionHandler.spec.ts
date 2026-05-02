import {
  handleException,
  handleDatabaseException,
} from './exceptionHandler';
import {
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { errorMsg } from '@/constants';

jest.mock('@/constants', () => ({
  errorMsg: { UNKNOWN: 'An unknown error occurred' },
}));

const customMessages = {
  unauthorized: 'Custom auth error',
  notFound: 'Resource missing',
  conflict: 'Duplicate entry',
  internalServerError: 'Custom server error',
};

describe('handleException', () => {
  let consoleWarnSpy: jest.SpyInstance;

  beforeAll(() => {
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => { });
  });

  afterAll(() => {
    consoleWarnSpy.mockRestore();
  });

  it('should throw UnauthorizedException with custom message when status is 401', () => {
    const error = { status: 401, message: 'Old message' };

    expect(() => handleException(error, customMessages)).toThrow(
      new UnauthorizedException('Custom auth error'),
    );
  });

  it('should throw UnauthorizedException with default message when no custom message for 401', () => {
    const error = { status: 401, message: 'Default unauthorized' };

    expect(() => handleException(error)).toThrow(
      new UnauthorizedException('Default unauthorized'),
    );
  });

  it('should throw NotFoundException with custom message when statusCode is 404', () => {
    const error = { statusCode: 404, message: 'Not found original' };

    expect(() => handleException(error, customMessages)).toThrow(
      new NotFoundException('Resource missing'),
    );
  });

  it('should throw NotFoundException with default message when status is 404 and no custom message', () => {
    const error = { status: 404, message: 'Default not found' };

    expect(() => handleException(error)).toThrow(
      new NotFoundException('Default not found'),
    );
  });

  it('should throw ConflictException with custom message when status is 409', () => {
    const error = { status: 409, message: 'Already exists' };

    expect(() => handleException(error, customMessages)).toThrow(
      new ConflictException('Duplicate entry'),
    );
  });

  it('should throw InternalServerErrorException with custom message when status is 500', () => {
    const error = { status: 500, message: 'Something broke' };

    expect(() => handleException(error, customMessages)).toThrow(
      new InternalServerErrorException('Custom server error'),
    );
  });

  it('should throw InternalServerErrorException with UNKNOWN fallback when status is missing and no custom messages', () => {
    const error = { message: 'Random error' };

    expect(() => handleException(error)).toThrow(
      new InternalServerErrorException('An unknown error occurred'),
    );
  });

  it('should throw InternalServerErrorException with UNKNOWN fallback when error has no status and no message', () => {
    const error = { someField: 'data' };

    expect(() => handleException(error)).toThrow(
      new InternalServerErrorException('An unknown error occurred'),
    );
  });
});

describe('handleDatabaseException', () => {
  let consoleWarnSpy: jest.SpyInstance;

  beforeAll(() => {
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => { });
  });

  afterAll(() => {
    consoleWarnSpy.mockRestore();
  });

  it('should throw ConflictException for Postgres unique violation code 23505', () => {
    const error = { cause: { code: '23505' } };

    expect(() => handleDatabaseException(error)).toThrow(ConflictException);
  });

  it('should throw InternalServerErrorException with fallback message for other codes', () => {
    const error = { cause: { code: '23503' } };
    const fallback = 'Foreign key violation';

    expect(() => handleDatabaseException(error, fallback)).toThrow(
      new InternalServerErrorException(fallback),
    );
  });

  it('should throw InternalServerErrorException with UNKNOWN when cause code is missing and no fallback', () => {
    const error = { cause: {} };

    expect(() => handleDatabaseException(error)).toThrow(
      new InternalServerErrorException('An unknown error occurred'),
    );
  });

  it('should throw InternalServerErrorException with UNKNOWN when error has no cause', () => {
    const error = {};

    expect(() => handleDatabaseException(error)).toThrow(
      new InternalServerErrorException('An unknown error occurred'),
    );
  });

  it('should throw InternalServerErrorException with provided fallback for unknown code', () => {
    const error = { cause: { code: 'XX000' } };
    const fallback = 'Custom DB error';

    expect(() => handleDatabaseException(error, fallback)).toThrow(
      new InternalServerErrorException(fallback),
    );
  });
});