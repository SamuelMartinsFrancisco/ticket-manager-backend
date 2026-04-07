export enum UserRole {
  TECHNICIAN = 'technician',
  CLIENT = 'client',
  ADMIN = 'admin',
};

export interface UserDTO {
  id: string,
  name: string,
  lastName: string,
  email: string,
  role: UserRole,
  createdAt: string,
  updatedAt?: string | null
};

export type CreateUserDTO = Omit<UserDTO, 'id' | 'createdAt' | 'updatedAt'>