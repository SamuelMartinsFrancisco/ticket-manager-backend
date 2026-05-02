import { DatabaseService } from "@/infrastructure/database/database.service";
import { TokenPayload } from "@/modules/auth/auth.types";
import { UserRole } from "@/modules/users/user.dto";
import { ExecutionContext } from "@nestjs/common";

type DbMethodOverrides = Partial<Record<keyof DatabaseService['db'], jest.Mock>>;

export const createMockExecutionContext = () => {
  const getRequestMock = jest.fn();

  const contextMock = {
    switchToHttp: jest.fn().mockReturnValue({
      getRequest: getRequestMock,
      getResponse: jest.fn(),
      getNext: jest.fn(),
    }),
    switchToRpc: jest.fn(),
    switchToWs: jest.fn(),
    getType: jest.fn(),
    getClass: jest.fn(),
    getHandler: jest.fn(),
    getArgs: jest.fn(),
    getArgByIndex: jest.fn(),
    getAllAndOverride: jest.fn(),
  } as ExecutionContext;

  return {
    contextMock,
    getRequestMock
  };
};

/**
 * Create a mock for DatabaseService with pre‑configured `select` and `insert` chains.
 * Pass `overrides` to add / replace other methods (e.g. `update`, `delete`).
 *
 * @example
 * const { dbServiceMock, selectWhereMock, insertReturningMock } = createDatabaseMock({
 *   update: jest.fn(),
 * });
 */
export const createDatabaseMock = (overrides: DbMethodOverrides = {}) => {
  const selectWhereMock = jest.fn();
  const insertReturningMock = jest.fn();

  const selectFromMock = jest.fn().mockReturnValue({ where: selectWhereMock });
  const insertValuesMock = jest.fn().mockReturnValue({ returning: insertReturningMock });

  const base = {
    select: jest.fn().mockReturnValue({ from: selectFromMock }),
    insert: jest.fn().mockReturnValue({ values: insertValuesMock }),
  };

  const dbMock = {
    ...base,
    ...overrides,
  } as typeof base & Record<string, jest.Mock>;

  const dbServiceMock = { db: dbMock as Partial<DatabaseService> };

  return {
    dbServiceMock,
    dbMock,
    selectWhereMock,
    insertReturningMock,
    selectFromMock,
    insertValuesMock,
  };
};

export const createFakeTokenPayload = (overrides?: Partial<TokenPayload>): TokenPayload => ({
  sub: 'cb0777e9-048a-4d33-a73f-bd7172154d63',
  username: 'Alexandre',
  email: 'alex@test.com',
  role: UserRole.CLIENT,
  ...overrides,
});