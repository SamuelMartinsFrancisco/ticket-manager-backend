import { ConfigService } from '@nestjs/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { DatabaseService } from './database.service';
import { schema } from './schema';

jest.mock('drizzle-orm/node-postgres', () => ({
  drizzle: jest.fn(),
}));

jest.mock('pg', () => ({
  Pool: jest.fn(),
}));

jest.mock('@nestjs/config');

describe('DatabaseService', () => {
  // Mocks
  const mockPool = {
    end: jest.fn().mockResolvedValue(undefined),
  };

  const mockDrizzleClient = { __drizzle: true };

  let mockConfigService: { get: jest.Mock };
  let service: DatabaseService;

  beforeEach(() => {
    jest.clearAllMocks();

    jest.mocked(Pool).mockReturnValue(mockPool as any);
    jest.mocked(drizzle).mockReturnValue(mockDrizzleClient as any);

    mockConfigService = {
      get: jest.fn(),
    };

    service = new DatabaseService(mockConfigService as unknown as ConfigService);
  });

  describe('onModuleInit', () => {
    it('should initialise the pool and Drizzle client with a valid DATABASE_URL', () => {
      const databaseUrl = 'postgres://user:pass@localhost:5432/db';
      mockConfigService.get.mockReturnValue(databaseUrl);

      service.onModuleInit();

      expect(Pool).toHaveBeenCalledWith({
        connectionString: databaseUrl,
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
      });
      expect(drizzle).toHaveBeenCalledWith(mockPool, { schema });
      expect(service.db).toBe(mockDrizzleClient);
    });

    it('should throw an error when DATABASE_URL is missing', () => {
      mockConfigService.get.mockReturnValue(undefined);

      expect(() => service.onModuleInit()).toThrow('🔴 No database URL provided');
      expect(Pool).not.toHaveBeenCalled();
      expect(service.db).toBeUndefined();
    });

    it('should reassign the client without closing the old pool when called multiple times', () => {
      mockConfigService.get.mockReturnValue('postgres://...');
      service.onModuleInit(); // first call

      const firstPool = mockPool;
      const firstClient = mockDrizzleClient;

      // Create fresh mocks for the second initialisation
      const secondPool = { end: jest.fn() };
      const secondClient = { __drizzle: false, second: true };
      jest.mocked(Pool).mockReturnValue(secondPool as any);
      jest.mocked(drizzle).mockReturnValue(secondClient as any);

      service.onModuleInit(); // second call

      // Old pool is not closed (potential memory leak – current behaviour)
      expect(firstPool.end).not.toHaveBeenCalled();
      // A new pool is created
      expect(Pool).toHaveBeenCalledTimes(2);
      // The exposed client is the latest one
      expect(service.db).toBe(secondClient);
      expect(service.db).not.toBe(firstClient);
    });
  });

  describe('db getter', () => {
    it('should return the active Drizzle client', () => {
      mockConfigService.get.mockReturnValue('postgres://...');
      service.onModuleInit();

      expect(service.db).toBe(mockDrizzleClient);
    });
  });

  describe('onModuleDestroy', () => {
    it('should close the connection pool and log the event', async () => {
      mockConfigService.get.mockReturnValue('postgres://...');
      service.onModuleInit();
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => { });

      await service.onModuleDestroy();

      expect(mockPool.end).toHaveBeenCalledTimes(1);
      expect(consoleSpy).toHaveBeenCalledWith('💤 Database connection closed');
      consoleSpy.mockRestore();
    });
  });
});