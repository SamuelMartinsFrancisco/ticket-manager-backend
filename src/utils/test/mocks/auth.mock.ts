import { RegisterDTO } from "@/modules/auth/auth.dto";
import { UserDTO, UserRole } from "@/modules/users/user.dto";

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

export const createUserRegisterDTO = (user?: UserDTO): Omit<RegisterDTO, 'userId'> => {
  const mockUser = user ?? createFakeUser();
  const { id, createdAt, updatedAt, ...rest } = mockUser;

  return {
    ...rest,
    password: 'supersecret_123',
  }
};