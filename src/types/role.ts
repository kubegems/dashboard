/*
 * Copyright 2022 The kubegems.io Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
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

export interface UserRole<T> {
  getUserList(params: KubePaginationRequest): Promise<T[]>;
  addUser(user: User, role: ResourceRole): Promise<any>;
  updateUser(user: User, role: ResourceRole): Promise<any>;
  deleteUser(user: User): Promise<void>;
}
