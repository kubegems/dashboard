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

import { User } from '@kubegems/api/typed/user';
import axios from 'axios';
import { Base64 } from 'js-base64';

interface RegistryUser {
  getUserList(params: KubeRequest): Promise<string[]>;
  addUser(user: User): Promise<void>;
  deleteUser(user: User): Promise<void>;
}

interface Operator {
  addSyncTask(): Promise<void>;
  deleteSyncTask(): Promise<void>;
  check(): Promise<void>;
}

export class AIModelRegistry implements RegistryUser, Operator {
  constructor(registry?: { [key: string]: any }) {
    Object.assign(this, registry);
  }

  address = '';
  annotations: { [key: string]: string } = {};
  auth: { username: string; password: string; token: string } = { username: '', password: '', token: '' };
  builtIn = false;
  creationTime: Date;
  enabled = true;
  id: string;
  images: string[] = [];
  initImage = '';
  kind = '';
  modelsCount = 0;
  name = '';
  online = true;
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

  public async getRegistryList(params: KubeRequest = {}): Promise<AIModelRegistry[]> {
    const data: { [key: string]: any } = await axios(`sources`, { params: params });
    return data as AIModelRegistry[];
  }

  public async getRegistryByAdmin(params: KubeRequest = {}): Promise<AIModelRegistry> {
    const data: { [key: string]: any } = await axios(`admin/sources/${this.name}`, { params: params });
    return data as AIModelRegistry;
  }

  public async getRegistry(params: KubeRequest = {}): Promise<AIModelRegistry> {
    const data: { [key: string]: any } = await axios(`sources/${this.name}`, { params: params });
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
  public async getUserList(params: KubeRequest = {}): Promise<string[]> {
    const data: { [key: string]: any } = await axios(`sources/${this.name}/admins`, { params: params });
    return data as string[];
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

  public async check(): Promise<void> {
    await axios.post(`admin/sourcescheck`, this);
  }

  // extend info
  public async getSelector(
    params: KubeRequest = {},
  ): Promise<{ frameworks: string[]; licenses: string[]; tags: string[]; tasks: string[] }> {
    const data: { [key: string]: any } = await axios(`admin/sources/${this.name}/selector`, { params: params });
    return data as { frameworks: string[]; licenses: string[]; tags: string[]; tasks: string[] };
  }
}

interface ModelOperator {
  syncModel(): Promise<void>;
}

interface ModelExtendInfo {
  getModelRateInfo(params: KubeRequest): Promise<{ count: number; rating: number; total: number }>;
}

export class AIModel implements ModelOperator, ModelExtendInfo {
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
  rating: { [key: string]: any };
  recomment: number;
  recommentContent: string;
  source: string;
  tags: string[] = [];
  task: string;
  updateAt: Date;
  versions: { [key: string]: any }[] = [];
  [others: string]: any;

  public async getModelListByAdmin(
    source: string,
    params: KubePaginationRequest,
  ): Promise<KubePaginationResponse<AIModel[]>> {
    const data: { [key: string]: any } = await axios(`admin/sources/${source}/models`, { params: params });
    return data as KubePaginationResponse<AIModel[]>;
  }

  public async getModelList(source: string, params: KubePaginationRequest): Promise<KubePaginationResponse<AIModel[]>> {
    const data: { [key: string]: any } = await axios(`sources/${source}/models`, { params: params });
    return data as KubePaginationResponse<AIModel[]>;
  }

  public async getModel(source: string, params: KubeRequest = {}): Promise<AIModel> {
    const data: { [key: string]: any } = await axios(`sources/${source}/models/${Base64.encode(this.name)}`, {
      params: params,
    });
    return data as AIModel;
  }

  public async getModelRateInfo(params: KubeRequest = {}): Promise<{ count: number; rating: number; total: number }> {
    const data: { [key: string]: any } = await axios(
      `sources/${this.source}/models/${Base64.encode(this.name)}/rating`,
      {
        params: params,
      },
    );
    return data as { count: number; rating: number; total: number };
  }

  public async getModelContent(
    version: string,
    params: KubeRequest = {},
  ): Promise<{
    creationTime: Date;
    files: { filename: string; content: string }[];
    intro: string;
    name: string;
    updationTime: Date;
  }> {
    const data: { [key: string]: any } = await axios(
      `sources/${this.source}/models/${Base64.encode(this.name)}/versions/${version}`,
      {
        params: params,
      },
    );
    return data as {
      creationTime: Date;
      files: { filename: string; content: string }[];
      intro: string;
      name: string;
      updationTime: Date;
    };
  }

  public async syncModel(): Promise<void> {
    await axios.post(`sources/${this.source}/models/${Base64.encode(this.name)}/sync`);
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

export class AIModelComment {
  constructor(model?: { [key: string]: any }) {
    Object.assign(this, model);
  }

  content: string;
  creationTime: Date;
  id: string;
  postID: string;
  rating: number;
  replyTo: any;
  updationTime: Date;
  username: string;
  [others: string]: any;

  public async getCommentList(
    source: string,
    name: string,
    params: KubePaginationRequest,
  ): Promise<KubePaginationResponse<AIModelComment[]>> {
    const data: { [key: string]: any } = await axios(`sources/${source}/models/${Base64.encode(name)}/comments`, {
      params: params,
    });
    return data as KubePaginationResponse<AIModelComment[]>;
  }

  public async addComment(source: string, name: string): Promise<AIModelComment> {
    const data: { [key: string]: any } = await axios.post(
      `sources/${source}/models/${Base64.encode(name)}/comments`,
      this,
    );
    return data as AIModelComment;
  }

  public async updateComment(source: string, name: string): Promise<AIModelComment> {
    const data: { [key: string]: any } = await axios.put(
      `sources/${source}/models/${Base64.encode(name)}/comments/${this.id}}`,
      this,
    );
    return data as AIModelComment;
  }

  public async deleteComment(source: string, name: string): Promise<void> {
    await axios.delete(`sources/${source}/models/${Base64.encode(name)}/comments/${this.id}`);
  }
}

export class AIModelRuntime {
  constructor(runtime?: { [key: string]: any }) {
    Object.assign(this, runtime);
  }

  cluster: string;
  creationTimestamp: Date;
  creator: string;
  environment: string;
  grpcURL: string;
  modelName: string;
  modelVersion: string;
  name: string;
  namespace: string;
  phase: string;
  project: string;
  tenant: string;
  url: string;
  username: string;
  [others: string]: any;

  public async getRuntimeList(
    source: string,
    name: string,
    params: KubePaginationRequest,
  ): Promise<KubePaginationResponse<AIModelRuntime[]>> {
    const data: { [key: string]: any } = await axios(`sources/${source}/models/${Base64.encode(name)}/instances`, {
      params: params,
    });
    return data as KubePaginationResponse<AIModelRuntime[]>;
  }
}
