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

export class Cluster {
  constructor(cluster?: { [key: string]: any }) {
    Object.assign(this, cluster);
  }

  ID = 0;
  ClusterName = '';
  APIServer?: string = '';
  ClientCertExpireAt?: Date = new Date();
  KubeConfig?: any;
  Primary?: boolean = false;
  Version = '';
  AgentAddr?: string = '';
  OversoldConfig?: any = {
    cpu: 1,
    memory: 1,
    storage: 1,
  };
  Upstream?: string = '';
  Status?: string = '';
  [others: string]: any;

  public async getClusterList(params: KubePaginationRequest): Promise<KubePaginationResponse<Cluster[]>> {
    const data: { [key: string]: any } = await axios(`cluster`, { params: params });
    return data as KubePaginationResponse<Cluster[]>;
  }

  public async getCluster(params: KubeRequest): Promise<Cluster> {
    const data: { [key: string]: any } = await axios(`cluster/${this.ID}`, { params: params });
    return data as Cluster;
  }

  public async addCluster(): Promise<Cluster> {
    const data: { [key: string]: any } = await axios.post(`cluster`, this);
    return data as Cluster;
  }

  public async updateCluster(): Promise<Cluster> {
    const data: { [key: string]: any } = await axios.put(`cluster/${this.ID}`, this);
    return data as Cluster;
  }

  public async deleteCluster(): Promise<void> {
    await axios.delete(`cluster/${this.ID}`);
  }
}
