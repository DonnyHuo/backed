import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    // Call super.canActivate() but don't throw error on failure
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any) {
    // Don't throw error if no user, just return null
    if (err || !user) {
      return null;
    }
    return user;
  }
}
