import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';

interface ExtendedReq extends Request {
  user: {
    role: string[]
  };
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.getAllAndOverride<string[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!roles) return false; 

    const request = context.switchToHttp().getRequest<ExtendedReq>();
    const user = request.user;

    if (!user) throw new ForbiddenException('Unauthorized access');

    const hasRole = user.role.some(role => roles.includes(role))
    console.log(roles, user.role)

    if (!hasRole) {
      throw new ForbiddenException('Insufficient permissions');
    }

    return true;
  }
}
