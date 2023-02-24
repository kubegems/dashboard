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
import { Base64 } from 'js-base64';

import { User } from './user';

interface RegistryUser {
  getUserList(params: KubePaginationRequest): Promise<KubePaginationResponse<User[]>>;
  addUser(user: User): Promise<void>;
  deleteUser(user: User): Promise<void>;
}

interface Operator {
  addSyncTask(): Promise<void>;
  deleteSyncTask(): Promise<void>;
}

export class AIModelRegistry implements RegistryUser, Operator {
  constructor(registry?: { [key: string]: any }) {
    Object.assign(this, registry);
  }

  address: string;
  annotations: { [key: string]: string };
  auth: { username: string; password: string; token: string };
  builtIn: boolean;
  creationTime: Date;
  enabled: boolean;
  id: string;
  images: string[];
  initImage: string;
  kind: string;
  modelsCount: number;
  name: string;
  online: boolean;
  updationTime: Date;
  [others: string]: any;

  public async getRegistryStatusByAdmin(
    params: KubeRequest,
  ): Promise<{ finishedAt: Date; progress: string; startedAt: Date; status: string }> {
    const data: { [key: string]: any } = await axios(`admin/sources/${this.name}/sync`, { params: params });
    return data as { finishedAt: Date; progress: string; startedAt: Date; status: string };
  }

  public async getRegistryListByAdmin(params: KubeRequest = {}): Promise<AIModelRegistry[]> {
    const data: { [key: string]: any } = await axios(`admin/sources`, { params: params });
    return data as AIModelRegistry[];
  }

  public async getRegistryByAdmin(params: KubeRequest = {}): Promise<AIModelRegistry> {
    const data: { [key: string]: any } = await axios(`admin/sources/${this.name}`, { params: params });
    return data as AIModelRegistry;
  }

  public async addRegistryByAdmin(): Promise<AIModelRegistry> {
    const data: { [key: string]: any } = await axios.post(`admin/sources`, this);
    return data as AIModelRegistry;
  }

  public async updateRegistryByAdmin(): Promise<AIModelRegistry> {
    const data: { [key: string]: any } = await axios.put(`admin/sources/${this.name}`, this);
    return data as AIModelRegistry;
  }

  public async deleteRegistry(): Promise<void> {
    await axios.delete(`admin/sources/${this.name}`);
  }

  // RegistryUser
  public async getUserList(params: KubePaginationRequest): Promise<KubePaginationResponse<User[]>> {
    const data: { [key: string]: any } = await axios(`sources/${this.name}/admins`, { params: params });
    return data as KubePaginationResponse<User[]>;
  }

  public async addUser(user: User): Promise<void> {
    await axios.post(`sources/${this.name}/admins/${user.Username}`);
  }

  public async deleteUser(user: User): Promise<void> {
    await axios.delete(`sources/${this.name}/admins/${user.Username}`);
  }

  // Operator
  public async addSyncTask(): Promise<void> {
    await axios.post(`admin/sources/${this.name}/sync`);
  }

  public async deleteSyncTask(): Promise<void> {
    await axios.delete(`admin/sources/${this.name}/sync`);
  }

  // extend info
  public async getSelector(
    params: KubeRequest = {},
  ): Promise<{ frameworks: string[]; licenses: string[]; tags: string[]; tasks: string[] }> {
    const data: { [key: string]: any } = await axios(`admin/sources/${this.name}/selector`, { params: params });
    return data as { frameworks: string[]; licenses: string[]; tags: string[]; tasks: string[] };
  }
}

export class AIModel {
  constructor(model?: { [key: string]: any }) {
    Object.assign(this, model);
  }

  annotations: { [key: string]: string };
  author: string;
  createAt: Date;
  downloads: number;
  enabled: boolean;
  framework: string;
  lastModified: Date;
  license: string;
  likes: number;
  name: string;
  paper: string;
  rating: number;
  recomment: number;
  recommentContent: string;
  source: string;
  tags: string[];
  task: string;
  updateAt: Date;
  versions: { [key: string]: string };
  [others: string]: any;

  public async getModelList(source: string, params: KubePaginationRequest): Promise<KubePaginationResponse<AIModel[]>> {
    const data: { [key: string]: any } = await axios(`admin/sources/${source}/models`, { params: params });
    return data as KubePaginationResponse<AIModel[]>;
  }

  public async updateModelByAdmin(): Promise<AIModel> {
    const data: { [key: string]: any } = await axios.put(
      `admin/sources/${this.source}/models/${Base64.encode(this.name)}`,
      this,
    );
    return data as AIModel;
  }

  public async deleteModelByAdmin(): Promise<void> {
    await axios.delete(`admin/sources/${this.source}/models/${Base64.encode(this.name)}`);
  }
}
