import { User as prismaUser } from '@prisma/client';

export interface User extends prismaUser {
  id: string;
  name: string;
  email: string;
  password: string;
  role: string;
  createdAt: Date;
  UpdatedAt: Date;
}
