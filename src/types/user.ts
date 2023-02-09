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
import axios from 'axios';

import { Tenant } from '@/types/tenant';

interface UserOperate {
  resetPassword(): Promise<void>;
  changeRole(): Promise<void>;
}

interface TenantInUser {
  getTenantList(params: KubePaginationRequest): Promise<KubePaginationResponse<Tenant[]>>;
}

export class User implements UserOperate, TenantInUser {
  constructor(user?: { [key: string]: any }) {
    Object.assign(this, user);
  }

  ID: number;
  CreatedAt: Date;
  Email: string;
  IsActive: boolean;
  LastLoginAt: Date;
  Phone: string;
  Source: string;
  SourceVendor: string;
  SystemRoleID: number;
  Username: string;
  [others: string]: any;

  public async getUserList(params: KubePaginationRequest): Promise<KubePaginationResponse<User[]>> {
    const data: { [key: string]: any } = await axios(`user`, { params: params });
    return data as KubePaginationResponse<User[]>;
  }

  public async addUser(): Promise<User> {
    const data: { [key: string]: any } = await axios.post(`user`, this);
    return data as User;
  }

  public async updateUser(): Promise<User> {
    const data: { [key: string]: any } = await axios.put(`user/${this.ID}`, this);
    return data as User;
  }

  public async deleteUser(): Promise<void> {
    await axios.delete(`user/${this.ID}`);
  }

  // IUser
  public async resetPassword(): Promise<void> {
    await axios.post(`user/${this.ID}/reset_password`, this);
  }

  public async changeRole(): Promise<void> {
    await axios.put(`systemrole/${this.SystemRoleID}/user/${this.ID}`, this);
  }

  // TenantInUser
  public async getTenantList(params: KubePaginationRequest): Promise<KubePaginationResponse<Tenant[]>> {
    const data: { [key: string]: any } = await axios(`user/${this.ID}/tenant`, { params: params });
    return data as KubePaginationResponse<Tenant[]>;
  }
}
