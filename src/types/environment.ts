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

import { Cluster } from './cluster';
import { Project } from './project';
import { ResourceRole, UserRole } from './role';
import { User } from './user';

export class Environment implements UserRole {
  constructor(environment?: { [key: string]: any }) {
    Object.assign(this, environment);
  }

  ID: number;
  Cluster?: Cluster;
  ClusterID: number;
  DeletePolicy: string;
  EnvironmentName: string;
  MetaType: string;
  Namespace: string;
  ProjectID: string;
  Project: Project;
  Remark: string;
  AllowEdgeRegistration: boolean;
  [others: string]: any;

  public async getEnvironmentList(params: KubePaginationRequest): Promise<KubePaginationResponse<Environment[]>> {
    const data: { [key: string]: any } = await axios(`environment`, { params: params });
    return data as KubePaginationResponse<Environment[]>;
  }

  public async getEnvironment(params: KubeRequest): Promise<Environment> {
    const data: { [key: string]: any } = await axios(`environment/${this.ID}`, { params: params });
    return data as Environment;
  }

  public async addEnvironment(): Promise<Environment> {
    const data: { [key: string]: any } = await axios.post(`project/${this.ProjectID}/project`, this);
    return data as Environment;
  }

  public async updateEnvironment(): Promise<Environment> {
    const data: { [key: string]: any } = await axios.put(`environment/${this.ID}`, this);
    return data as Environment;
  }

  public async deleteEnvironment(): Promise<void> {
    await axios.delete(`environment/${this.ID}`);
  }

  // IUserRole
  public async getUserList(params: KubePaginationRequest): Promise<KubePaginationResponse<User[]>> {
    const data: { [key: string]: any } = await axios(`environment/${this.ID}/user`, { params: params });
    return data as KubePaginationResponse<User[]>;
  }

  public async addUser(user: User, role: ResourceRole): Promise<any> {
    const body = {
      EnvironmentID: this.ID,
      UserID: user.ID,
      Role: role,
    };
    await axios.post(`environment/${this.ID}/user`, body);
    return body;
  }

  public async updateUser(user: User, role: ResourceRole): Promise<any> {
    const body = {
      EnvironmentID: this.ID,
      UserID: user.ID,
      Role: role,
    };
    await axios.put(`environment/${this.ID}/user/${user.ID}`, body);
    return body;
  }

  public async deleteUser(user: User): Promise<void> {
    await axios.delete(`environment/${this.ID}/user/${user.ID}`);
  }
}
