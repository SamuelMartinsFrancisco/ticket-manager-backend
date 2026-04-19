import { RegisterDTO } from "@/modules/auth/auth.dto";
import { TokenPayload } from "@/modules/auth/auth.types";
import { IssueStatus, TicketDTO } from "@/modules/tickets/ticket.dto"
import { UserDTO, UserRole } from "@/modules/users/user.dto";
import { ExecutionContext } from '@nestjs/common';

export const createFakeTicket = (overrides?: Partial<TicketDTO>): TicketDTO => ({
  id: 12345,
  title: 'New Ticket',
  description: 'description...',
  authorId: '18a567cb',
  status: IssueStatus.NEW,
  category: 23132,
  impact: 2,
  urgency: 2,
  priority: 4,
  createdAt: new Date(1774224143781).toISOString(),
  ...overrides,
});

export const createFakeUser = (overrides?: Partial<UserDTO>): UserDTO => ({
  id: 'cb07f8e9-048a-4d33-a73f-bd71d2154d63',
  name: 'João',
  lastName: 'Silva',
  email: 'novo.usuario@empresa.com',
  role: UserRole.TECHNICIAN,
  createdAt: '2026-04-14T01:40:24.803Z',
  updatedAt: null,
  ...overrides,
});

export const createFakeTokenPayload = (overrides?: Partial<TokenPayload>): TokenPayload => ({
  sub: 'cb0777e9-048a-4d33-a73f-bd7172154d63',
  username: 'Alexandre',
  email: 'alex@test.com',
  role: UserRole.CLIENT,
  ...overrides,
});

export const createUserRegisterDTO = (user?: UserDTO): Omit<RegisterDTO, 'userId'> => {
  const mockUser = user ?? createFakeUser();
  const { id, createdAt, updatedAt, ...rest } = mockUser;

  return {
    ...rest,
    password: 'supersecret_123',
  }
};

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

export const createDbClientMock = () => {
  const insertFn = jest.fn();
  const valuesFn = jest.fn();
  const returningFn = jest.fn();

  insertFn.mockReturnValue({
    values: valuesFn,
  });

  valuesFn.mockReturnValue({
    returning: returningFn,
  });

  returningFn.mockResolvedValue([createFakeTicket()]);

  return {
    dbClientMock: {
      db: {
        insert: insertFn,
      }
    },
    spies: {
      insertFn,
      valuesFn,
      returningFn,
    },
  };
};