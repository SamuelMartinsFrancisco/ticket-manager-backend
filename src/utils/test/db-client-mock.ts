// src/utils/test/database-mock.ts
import { DatabaseService } from '@/infrastructure/database/database.service';

/**
 * Options to extend the database mock with additional methods.
 */
type DbMethodOverrides = Partial<Record<keyof DatabaseService['db'], jest.Mock>>;

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

  const base = {
    select: jest.fn().mockReturnValue({
      from: jest.fn().mockReturnValue({ where: selectWhereMock }),
    }),
    insert: jest.fn().mockReturnValue({
      values: jest.fn().mockReturnValue({ returning: insertReturningMock }),
    }),
  };

  const dbMock: typeof base & Record<string, jest.Mock> = {
    ...base,
    ...overrides,
  };

  const dbServiceMock = { db: dbMock as Partial<DatabaseService> };

  return {
    dbServiceMock,
    dbMock,
    selectWhereMock,
    insertReturningMock,
  };
};