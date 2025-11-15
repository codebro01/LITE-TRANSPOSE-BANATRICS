import { Injectable } from '@nestjs/common';
import { UserRepository } from '@src/users/repository/user.repository';
import { businessOwnerInsertType } from '@src/db/users';
import { AuthRepository } from '@src/auth/repository/auth.repository';
import { createUserDto } from '@src/users/dto/create-user.dto';
import { UpdatebusinessOwnerDto } from '@src/users/dto/update-user.dto';
import { UpdatePasswordDto } from '@src/users/dto/updatePasswordDto';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly authRepository: AuthRepository,
  ) {}

  async createUser(data: createUserDto) {
    return await this.userRepository.createUser(data);
  }

  async getAllUsers() {
    return await this.userRepository.getAllUsers();
  }

  async updateUserInSettings(data: UpdatebusinessOwnerDto, userId: string) {
    return await this.userRepository.updateUserInSettings(data, userId);
  }
  async updatePassword(data: UpdatePasswordDto, userId: string) {
    return await this.userRepository.updatePassword(data, userId);
  }
}
