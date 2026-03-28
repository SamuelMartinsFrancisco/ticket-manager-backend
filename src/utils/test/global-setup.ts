// // This runs before any test files are loaded

// // Mock Drizzle ORM at the module level
// jest.mock('drizzle-orm/node-postgres', () => {
//   const mockDb = {
//     select: jest.fn().mockReturnThis(),
//     from: jest.fn().mockReturnThis(),
//     where: jest.fn().mockReturnThis(),
//     insert: jest.fn().mockReturnThis(),
//     update: jest.fn().mockReturnThis(),
//     delete: jest.fn().mockReturnThis(),
//     values: jest.fn().mockReturnThis(),
//     returning: jest.fn().mockReturnThis(),
//     execute: jest.fn().mockResolvedValue([]),
//   };

//   return {
//     drizzle: jest.fn(() => mockDb),
//   };
// });

// jest.mock('pg', () => ({
//   Pool: jest.fn().mockImplementation(() => ({
//     connect: jest.fn(),
//     query: jest.fn(),
//     end: jest.fn(),
//     on: jest.fn(),
//   })),
//   Client: jest.fn().mockImplementation(() => ({
//     connect: jest.fn(),
//     query: jest.fn(),
//     end: jest.fn(),
//   })),
// }));

jest.mock('src/infrastructure/database/database.service.ts', () => ({
  DatabaseService: {},
}));