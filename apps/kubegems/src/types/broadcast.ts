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

export class Broadcast {
  constructor(broadcast?: { [key: string]: any }) {
    Object.assign(this, broadcast);
  }

  createdAt: Date;
  endAt: Date;
  id: number;
  message: string;
  startAt: Date;
  type: string;
  updatedAt: Date;

  public async getBroadcastList(params: KubePaginationRequest): Promise<KubePaginationResponse<Broadcast[]>> {
    const data: { [key: string]: any } = await axios(`announcement`, { params: params });
    return data as KubePaginationResponse<Broadcast[]>;
  }

  public async getBroadcast(params: KubeRequest = {}): Promise<Broadcast> {
    const data: { [key: string]: any } = await axios(`announcement/${this.id}`, { params: params });
    return data as Broadcast;
  }

  public async addBroadcast(): Promise<Broadcast> {
    const data: { [key: string]: any } = await axios.post(`announcement`, this);
    return data as Broadcast;
  }

  public async updateBroadcast(): Promise<Broadcast> {
    const data: { [key: string]: any } = await axios.put(`announcement/${this.id}`, this);
    return data as Broadcast;
  }

  public async deleteBroadcast(): Promise<void> {
    await axios.delete(`announcement/${this.id}`);
  }
}
