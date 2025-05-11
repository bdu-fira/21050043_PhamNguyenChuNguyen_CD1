import { Request } from 'express';

export interface User {
  id: string;
  vaiTroId: string;
  userType: string;
}

export interface AuthRequest extends Request {
  user?: User;
} 