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

interface OAuthScope {
  getScope(params: KubeRequest): Promise<any>;
}

export class OAuth implements OAuthScope {
  constructor(oauth?: { [key: string]: any }) {
    Object.assign(this, oauth);
  }

  config: any;
  createdAt: Date;
  enabled: boolean;
  id: number;
  kind: string;
  name: string;
  tokenType: string;
  updatedAt: Date;
  vendor: string;
  [others: string]: any;

  public async getOAuthItems(params: KubeRequest = {}): Promise<OAuth[]> {
    const data: { [key: string]: any } = await axios(`system/authsource`, { params: params });
    return data as OAuth[];
  }

  public async getOAuthList(params: KubePaginationRequest): Promise<KubePaginationResponse<OAuth[]>> {
    const data: { [key: string]: any } = await axios(`authsource`, { params: params });
    return data as KubePaginationResponse<OAuth[]>;
  }

  public async getOAuth(params: KubeRequest): Promise<OAuth> {
    const data: { [key: string]: any } = await axios(`authsource/${this.id}`, { params: params });
    return data as OAuth;
  }

  public async addOAuth(): Promise<OAuth> {
    const data: { [key: string]: any } = await axios.post(`authsource`, this);
    return data as OAuth;
  }

  public async updateOAuth(): Promise<OAuth> {
    const data: { [key: string]: any } = await axios.put(`authsource/${this.id}`, this);
    return data as OAuth;
  }

  public async deleteOAuth(): Promise<void> {
    await axios.delete(`authsource/${this.id}`);
  }

  // ScopeList
  public async getScope(params: KubeRequest = {}): Promise<any> {
    const data: { [key: string]: any } = await axios(`system/authsource/predefined`, { params: params });
    return data;
  }
}
