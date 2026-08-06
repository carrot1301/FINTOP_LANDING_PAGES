import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLE_CODE } from '@prisma/client';
import { ROLES_KEY } from '../../common/decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<ROLE_CODE[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    
    if (!requiredRoles || requiredRoles.length === 0) {
      return true; // No specific role required
    }

    const { user } = context.switchToHttp().getRequest();
    
    if (!user || !user.roles) {
      throw new ForbiddenException('User roles not found');
    }

    // CEO, DEVELOPER, and SUPER_ADMIN have implicit access to all role-based endpoints
    if (user.roles.includes(ROLE_CODE.CEO) || user.roles.includes('DEVELOPER' as any) || user.roles.includes(ROLE_CODE.SUPER_ADMIN)) {
      return true;
    }

    const hasRole = requiredRoles.some((role) => user.roles.includes(role));
    if (!hasRole) {
      throw new ForbiddenException('Insufficient role privileges');
    }
    
    return true;
  }
}
