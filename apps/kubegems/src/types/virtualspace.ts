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

import { Environment } from './environment';
import { User } from '@/types/user';

export class VirtualSpace {
  constructor(virtualSpace?: { [key: string]: any }) {
    Object.assign(this, virtualSpace);
  }

  CreatedAt: Date;
  CreatedBy: string;
  Environments: Environment[];
  ID: number;
  IsActive: boolean;
  UpdatedAt: Date;
  Users: User[];
  VirtualSpaceName: string;
  [others: string]: any;

  public async getVirtualSpaceList(params: KubePaginationRequest): Promise<KubePaginationResponse<VirtualSpace[]>> {
    const data: { [key: string]: any } = await axios(`virtualspace`, { params: params });
    return data as KubePaginationResponse<VirtualSpace[]>;
  }

  public async getVirtualSpace(params: KubeRequest): Promise<VirtualSpace> {
    const data: { [key: string]: any } = await axios(`virtualspace/${this.ID}`, { params: params });
    return data as VirtualSpace;
  }

  public async addVirtualSpace(): Promise<VirtualSpace> {
    const data: { [key: string]: any } = await axios.post(`virtualspace`, this);
    return data as VirtualSpace;
  }

  public async updateVirtualSpace(): Promise<VirtualSpace> {
    const data: { [key: string]: any } = await axios.put(`virtualspace/${this.ID}`, this);
    return data as VirtualSpace;
  }

  public async deleteVirtualSpace(): Promise<void> {
    await axios.delete(`virtualspace/${this.ID}`);
  }
}
