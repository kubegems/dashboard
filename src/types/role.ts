import { User } from './user';

export enum ResourceRole {
  Admin = 'admin',
  Ordinary = 'ordinary',
  Test = 'test',
  Dev = 'dev',
  Ops = 'ops',
  Operator = 'operator',
  Reader = 'reader',
  Normal = 'normal',
}

export class Auth {
  constructor(auth?: { [key: string]: any }) {
    Object.assign(this, auth);
  }

  id: number;
  isAdmin: boolean;
  name: string;
  role: string;
}

export interface IUserRole<T> {
  getUserList(params: KubePaginationRequest): Promise<T[]>;
  addUser(user: User, role: ResourceRole): Promise<any>;
  updateUser(user: User, role: ResourceRole): Promise<any>;
  deleteUser(user: User): Promise<void>;
}
