import configuration from './configuration';
import { getSecret } from './utils/file-secrets-reader';

jest.mock('./utils/file-secrets-reader');

const mockGetSecret = jest.mocked(getSecret);

describe('Configuration', () => {
  const ORIGINAL_ENV = process.env;

  beforeEach(() => {
    process.env = { ...ORIGINAL_ENV };
    mockGetSecret.mockReset();
    jest.spyOn(console, 'log').mockImplementation(() => { });
    jest.spyOn(console, 'warn').mockImplementation(() => { });
    jest.spyOn(console, 'error').mockImplementation(() => { });
  });

  afterEach(() => {
    process.env = ORIGINAL_ENV;
    jest.restoreAllMocks();
  });

  const setBasicDbEnv = () => {
    process.env.DB_NAME = 'demo';
    process.env.DB_HOST = 'localhost';
    process.env.DB_USER = 'root';
    process.env.DB_PORT = '5432';
  };

  const setAdminIdentityEnv = () => {
    process.env.ADMIN_EMAIL = 'admin@example.com';
    process.env.ADMIN_NAME = 'Admin';
    process.env.ADMIN_LASTNAME = 'User';
  };

  test('builds config successfully with all secrets from files', () => {
    setBasicDbEnv();
    setAdminIdentityEnv();
    process.env.SERVER_PORT = '3000';
    process.env.BLIND_INDEX_SECRET_FILE = '/secrets/blind';
    process.env.ENCRYPTION_SECRET_FILE = '/secrets/enc';
    process.env.JWT_SECRET_FILE = '/secrets/jwt';
    process.env.DB_PASSWORD_FILE = '/secrets/db-pass';
    process.env.ADMIN_PASSWORD_FILE = '/secrets/admin-pass';

    mockGetSecret.mockImplementation((path) => {
      if (path === '/secrets/blind') return 'blind-from-file';
      if (path === '/secrets/enc') return 'enc-secret-from-file';
      if (path === '/secrets/jwt') return 'jwt-secret-from-file';
      if (path === '/secrets/db-pass') return 'db-pass-from-file';
      if (path === '/secrets/admin-pass') return 'admin-pass-from-file';
      return undefined;
    });

    const config = configuration();

    expect(config.JWT_SECRET).toBe('jwt-secret-from-file');
    expect(config.ENCRYPTION_SECRET).toBe('enc-secret-from-file');
    expect(config.BLIND_INDEX_SECRET).toBe('blind-from-file');
    expect(config.DB_PASSWORD).toBe('db-pass-from-file');
    expect(config.ADMIN_PASSWORD).toBe('admin-pass-from-file');
    expect(config.DB_NAME).toBe('demo');
    expect(config.DB_HOST).toBe('localhost');
    expect(config.DB_USER).toBe('root');
    expect(config.DB_PORT).toBe('5432');
    expect(config.SERVER_PORT).toBe(3000);
    expect(config.DATABASE_URL).toBe('postgres://root:db-pass-from-file@localhost:5432/demo');
  });

  test('falls back to environment variable when secret file is missing', () => {
    setBasicDbEnv();
    process.env.BLIND_INDEX_SECRET_FILE = '/secrets/blind';
    process.env.ENCRYPTION_SECRET_FILE = '/secrets/enc';
    process.env.JWT_SECRET_FILE = '/secrets/jwt';
    process.env.DB_PASSWORD_FILE = '/secrets/db-pass';
    process.env.JWT_SECRET = 'env-jwt-secret';

    mockGetSecret.mockImplementation((path) => {
      if (path === '/secrets/blind') return 'blind-from-file';
      if (path === '/secrets/enc') return 'enc-secret-from-file';
      if (path === '/secrets/jwt') return undefined; // missing file
      if (path === '/secrets/db-pass') return 'db-pass-from-file';
      return undefined;
    });

    const config = configuration();

    expect(config.JWT_SECRET).toBe('env-jwt-secret');
    expect(config.ENCRYPTION_SECRET).toBe('enc-secret-from-file');
    expect(config.BLIND_INDEX_SECRET).toBe('blind-from-file');
    expect(config.DB_PASSWORD).toBe('db-pass-from-file');
  });

  test('throws validation error when required secret is completely missing', () => {
    setBasicDbEnv();
    process.env.JWT_SECRET_FILE = '/secrets/jwt';
    process.env.ENCRYPTION_SECRET_FILE = '/secrets/enc';
    process.env.DB_PASSWORD_FILE = '/secrets/db-pass';

    mockGetSecret.mockImplementation((path) => {
      if (path === '/secrets/jwt') return 'jwt-secret';
      if (path === '/secrets/enc') return 'enc-secret';
      if (path === '/secrets/db-pass') return 'db-pass';
      return undefined;
    });

    expect(() => configuration()).toThrow(/BLIND_INDEX_SECRET.*required/);
  });

  test('DB_PASSWORD undefined results in "undefined" inside DATABASE_URL', () => {
    setBasicDbEnv();
    process.env.BLIND_INDEX_SECRET_FILE = '/secrets/blind';
    process.env.ENCRYPTION_SECRET_FILE = '/secrets/enc';
    process.env.JWT_SECRET_FILE = '/secrets/jwt';

    mockGetSecret.mockImplementation((path) => {
      if (path === '/secrets/blind') return 'blind-secret';
      if (path === '/secrets/enc') return 'enc-secret';
      if (path === '/secrets/jwt') return 'jwt-secret';
      return undefined;
    });

    const config = configuration();

    expect(config.DB_PASSWORD).toBeUndefined();
    expect(config.DATABASE_URL).toBe('postgres://root:undefined@localhost:5432/demo');
    expect(config).toBeDefined();
  });

  test('uses "[not-provided]" placeholder for missing DB env vars', () => {
    process.env.DB_PASSWORD_FILE = '/secrets/db-pass';
    process.env.BLIND_INDEX_SECRET_FILE = '/secrets/blind';
    process.env.ENCRYPTION_SECRET_FILE = '/secrets/enc';
    process.env.JWT_SECRET_FILE = '/secrets/jwt';

    mockGetSecret.mockImplementation((path) => {
      if (path === '/secrets/db-pass') return 'securepass';
      if (path === '/secrets/blind') return 'blind';
      if (path === '/secrets/enc') return 'enc';
      if (path === '/secrets/jwt') return 'jwt';
      return undefined;
    });

    const config = configuration();

    expect(config.DB_NAME).toBe('[not-provided]');
    expect(config.DB_HOST).toBe('[not-provided]');
    expect(config.DB_USER).toBe('[not-provided]');
    expect(config.DB_PORT).toBe('[not-provided]');
    expect(config.DATABASE_URL).toBe('postgres://[not-provided]:securepass@[not-provided]:[not-provided]/[not-provided]');
  });

  test('defaults SERVER_PORT to 8080 when env var missing', () => {
    setBasicDbEnv();
    process.env.BLIND_INDEX_SECRET_FILE = '/secrets/blind';
    process.env.ENCRYPTION_SECRET_FILE = '/secrets/enc';
    process.env.JWT_SECRET_FILE = '/secrets/jwt';
    process.env.DB_PASSWORD_FILE = '/secrets/db-pass';

    mockGetSecret.mockReturnValue('some-secret');

    const config = configuration();

    expect(config.SERVER_PORT).toBe(8080);
  });

  test('SERVER_PORT as non-numeric string results in NaN', () => {
    setBasicDbEnv();
    process.env.SERVER_PORT = 'abc';
    process.env.BLIND_INDEX_SECRET_FILE = '/secrets/blind';
    process.env.ENCRYPTION_SECRET_FILE = '/secrets/enc';
    process.env.JWT_SECRET_FILE = '/secrets/jwt';
    process.env.DB_PASSWORD_FILE = '/secrets/db-pass';

    mockGetSecret.mockReturnValue('some-secret');

    const config = configuration();

    expect(config.SERVER_PORT).toBeNaN();
    expect(config).toBeDefined();
  });

  test('admin identity env vars omitted results in undefined', () => {
    setBasicDbEnv();
    process.env.ADMIN_PASSWORD_FILE = '/secrets/admin-pass';
    process.env.BLIND_INDEX_SECRET_FILE = '/secrets/blind';
    process.env.ENCRYPTION_SECRET_FILE = '/secrets/enc';
    process.env.JWT_SECRET_FILE = '/secrets/jwt';
    process.env.DB_PASSWORD_FILE = '/secrets/db-pass';

    mockGetSecret.mockImplementation((path) => {
      if (path === '/secrets/admin-pass') return 'admin-pass-from-file';
      if (path === '/secrets/blind') return 'blind';
      if (path === '/secrets/enc') return 'enc';
      if (path === '/secrets/jwt') return 'jwt';
      if (path === '/secrets/db-pass') return 'dbpass';
      return undefined;
    });

    const config = configuration();

    expect(config.ADMIN_EMAIL).toBeUndefined();
    expect(config.ADMIN_NAME).toBeUndefined();
    expect(config.ADMIN_LASTNAME).toBeUndefined();
    expect(config.ADMIN_PASSWORD).toBe('admin-pass-from-file');
    expect(config).toBeDefined();
  });
});