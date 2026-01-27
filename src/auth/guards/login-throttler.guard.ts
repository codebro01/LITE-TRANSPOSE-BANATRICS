// throttler/login-throttler.guard.ts
import { ThrottlerGuard } from '@nestjs/throttler';
import { Injectable } from '@nestjs/common';

@Injectable()
export class LoginThrottlerGuard extends ThrottlerGuard {
  protected getTracker(req: Record<string, any>): Promise<string> {
    const ip = req.ip || req.connection.remoteAddress;
    const identifier = req.body?.email || req.body?.phone || 'anonymous';

    return Promise.resolve(`${ip}-${identifier}`);
  }
}
