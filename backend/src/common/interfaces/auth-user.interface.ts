import { UserRole } from 'src/modules/users/enums/user-role.enum';

export interface AuthUser {
  sub: string;
  email: string;
  role: UserRole;
  iat: number;
  exp: number;
}