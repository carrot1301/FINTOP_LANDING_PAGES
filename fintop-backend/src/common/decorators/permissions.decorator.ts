import { SetMetadata } from '@nestjs/common';

export const PERMISSIONS_KEY = 'permissions';
// Format: MODULE:ACTION (e.g., 'USER:CREATE', 'CONTENT:PUBLISH')
export const Permissions = (...permissions: string[]) => SetMetadata(PERMISSIONS_KEY, permissions);
