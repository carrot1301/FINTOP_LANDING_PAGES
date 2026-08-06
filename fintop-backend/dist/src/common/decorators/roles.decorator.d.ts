import { ROLE_CODE } from '@prisma/client';
export declare const ROLES_KEY = "roles";
export declare const Roles: (...roles: ROLE_CODE[]) => import("@nestjs/common").CustomDecorator<string>;
