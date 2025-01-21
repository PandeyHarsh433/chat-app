import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../types/enums';

export const Roles = (...roles: UserRole[]) => SetMetadata('roles', roles);