import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { UserRepository } from './user.repository';
import { CreateUserDTO, UserDTO, UserRole } from './user.dto';
import { createFakeUser } from '@/utils/test/mocks/auth.mock';

const mockUserRepository = {
  findByEmail: jest.fn(),
  create: jest.fn(),
};

describe('UserService', () => {
  let service: UserService;
  let repository: jest.Mocked<UserRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: UserRepository,
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    repository = module.get(UserRepository) as jest.Mocked<UserRepository>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findByEmail', () => {
    const email = 'existing@example.com';

    it('should return a user when email exists', async () => {
      const expectedUser: UserDTO = createFakeUser({ email });
      repository.findByEmail.mockResolvedValue(expectedUser);

      const result = await service.findByEmail(email);

      expect(result).toEqual(expectedUser);
      expect(repository.findByEmail).toHaveBeenCalledTimes(1);
      expect(repository.findByEmail).toHaveBeenCalledWith(email);
    });

    it('should propagate repository errors', async () => {
      const dbError = new Error('Database connection failed');
      repository.findByEmail.mockRejectedValue(dbError);

      await expect(service.findByEmail(email)).rejects.toThrow(dbError);
      expect(repository.findByEmail).toHaveBeenCalledWith(email);
    });
  });

  describe('create', () => {
    const createUserDTO: CreateUserDTO = {
      name: 'Jane',
      lastName: 'Doe',
      email: 'jane.doe@example.com',
      role: UserRole.CLIENT,
    };

    it('should successfully create a new user', async () => {
      const createdUser: UserDTO = createFakeUser({
        id: 'new-user-id',
        email: createUserDTO.email,
        name: createUserDTO.name,
        lastName: createUserDTO.lastName,
        role: createUserDTO.role,
      });
      repository.create.mockResolvedValue(createdUser);

      const result = await service.create(createUserDTO);

      expect(result).toEqual(createdUser);
      expect(repository.create).toHaveBeenCalledTimes(1);
      expect(repository.create).toHaveBeenCalledWith(createUserDTO);
    });

    it('should propagate unique constraint violation (duplicate email)', async () => {
      const duplicateError = new Error('Unique violation');
      (duplicateError as any).code = '23505'; // PostgreSQL duplicate key
      repository.create.mockRejectedValue(duplicateError);

      await expect(service.create(createUserDTO)).rejects.toThrow(duplicateError);
      expect(repository.create).toHaveBeenCalledWith(createUserDTO);
    });

    it('should propagate any other database error', async () => {
      const genericError = new Error('Disk full');
      repository.create.mockRejectedValue(genericError);

      await expect(service.create(createUserDTO)).rejects.toThrow(genericError);
      expect(repository.create).toHaveBeenCalledWith(createUserDTO);
    });
  });
});