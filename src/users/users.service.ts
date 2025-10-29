import { Injectable } from '@nestjs/common';
import { UserRepository } from '@src/users/repository/user.repository';
import { businessOwnerInsertType } from '@src/db/users';
import { AuthRepository } from '@src/auth/repository/auth.repository';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly authRepository: AuthRepository,
  ) {}

  async createUser(data: businessOwnerInsertType) {
    return await this.userRepository.createUser(data);
  }

  async getAllUsers() {
    return await this.userRepository.getAllUsers();
  }

  async updateUser(
    user,
    data: Omit<businessOwnerInsertType, 'password' | 'email'>,
  ) {
    return await this.userRepository.updateUser(user, data);
  }
}
