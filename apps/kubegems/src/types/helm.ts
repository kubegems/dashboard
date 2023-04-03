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

interface Operator {
  syncRepository(): Promise<void>;
}

export class HelmRepository implements Operator {
  constructor(repository?: { [key: string]: any }) {
    Object.assign(this, repository);
  }

  ChartRepoName: string;
  ID: number;
  LastSync: Date;
  SyncMessage: string;
  SyncStatus: string;
  URL: string;
  [others: string]: any;

  public async getRepositoryList(params: KubeRequest = {}): Promise<HelmRepository[]> {
    const data: { [key: string]: any } = await axios(`appstore/repo`, { params: params });
    return data as HelmRepository[];
  }

  public async addRepository(): Promise<HelmRepository> {
    const data: { [key: string]: any } = await axios.post(`appstore/repo`, this);
    return data as HelmRepository;
  }

  public async deleteRepository(): Promise<void> {
    await axios.delete(`appstore/repo/${this.ChartRepoName}`);
  }

  // operator
  public async syncRepository(): Promise<void> {
    await axios.post(`appstore/repo/${this.ChartRepoName}/actions/sync`, this);
  }
}
