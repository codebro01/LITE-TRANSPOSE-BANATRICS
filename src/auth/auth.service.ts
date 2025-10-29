import { Injectable } from '@nestjs/common';
import { AuthRepository } from '@src/auth/repository/auth.repository';
import crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(private readonly authRepository: AuthRepository) {}

  async loginUser(data: { email: string; password: string }) {
    return this.authRepository.loginUser(data);
  }

  async logoutUser(res, req) {
    return await this.authRepository.logoutUser(res, req);
  }

  generateRandomPassword(length = 12): string {
    return crypto.randomBytes(length).toString('hex');
  }
}
