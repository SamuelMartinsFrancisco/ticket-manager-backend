import { Injectable } from '@nestjs/common';
import { UserRepository } from './user.repository';
import { CreateUserDTO, UserDTO } from './user.dto';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository
  ) { }

  async findByEmail(email: string): Promise<UserDTO> {
    const user = this.userRepository.findByEmail(email);

    return user;
  }

  async create(newUser: CreateUserDTO) {
    const result = this.userRepository.create(newUser);

    return result;
  }
}
