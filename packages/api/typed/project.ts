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
import { ResourceRole, UserRole } from './role';
import { Tenant } from './tenant';
import { User } from './user';

interface EnvironmnetInProject {
  getEnvironmentList(params: KubePaginationRequest): Promise<KubePaginationResponse<Environment[]>>;
}

interface ResourceQuotaInProject {
  getResourceQuotaList(
    tenantId: number,
    params: KubePaginationRequest,
  ): Promise<
    {
      project: string;
      projectid: number;
      resourceStatus: { quota: { [key: string]: any }; resource: { [key: string]: any } };
    }[]
  >;
}

export class Project implements UserRole, EnvironmnetInProject, ResourceQuotaInProject {
  constructor(project?: { [key: string]: any }) {
    Object.assign(this, project);
  }

  ID: number;
  ProjectAlias: string;
  ProjectName: string;
  Remark: string;
  TenantID: number;
  CreatedAt: Date;
  Tenant: Tenant;
  Environments: Environment[];
  Users?: User[];
  ResourceQuota?: any;
  Applications?: any;
  Registries?: any;
  [others: string]: any;

  public async getProjectList(params: KubePaginationRequest): Promise<KubePaginationResponse<Project[]>> {
    const data: { [key: string]: any } = await axios(`project`, { params: params });
    return data as KubePaginationResponse<Project[]>;
  }

  public async getProject(params: KubeRequest = {}): Promise<Project> {
    const data: { [key: string]: any } = await axios(`project/${this.ID}`, { params: params });
    return data as Project;
  }

  public async addProject(): Promise<Project> {
    const data: { [key: string]: any } = await axios.post(`tenant/${this.TenantID}/project`, this);
    return data as Project;
  }

  public async updateProject(): Promise<Project> {
    const data: { [key: string]: any } = await axios.put(`project/${this.ID}`, this);
    return data as Project;
  }

  public async deleteProject(): Promise<void> {
    await axios.delete(`project/${this.ID}`);
  }

  // IUserRole
  public async getUserList(params: KubePaginationRequest): Promise<KubePaginationResponse<User[]>> {
    const data: { [key: string]: any } = await axios(`project/${this.ID}/user`, { params: params });
    return data as KubePaginationResponse<User[]>;
  }

  public async addUser(user: User, role: ResourceRole): Promise<any> {
    const body = {
      ProjectID: this.ID,
      UserID: user.ID,
      Role: role,
    };
    await axios.post(`project/${this.ID}/user`, body);
    return body;
  }

  public async updateUser(user: User, role: ResourceRole): Promise<any> {
    const body = {
      ProjectID: this.ID,
      UserID: user.ID,
      Role: role,
    };
    await axios.put(`project/${this.ID}/user/${user.ID}`, body);
    return body;
  }

  public async deleteUser(user: User): Promise<void> {
    await axios.delete(`project/${this.ID}/user/${user.ID}`);
  }

  // IEnvironmnetInProject
  public async getEnvironmentList(params: KubePaginationRequest): Promise<KubePaginationResponse<Environment[]>> {
    const data: { [key: string]: any } = await axios(`project/${this.ID}/environment`, { params: params });
    return data as KubePaginationResponse<Environment[]>;
  }

  public async getResourceQuotaList(
    tenantId: number,
    params: KubePaginationRequest,
  ): Promise<
    {
      project: string;
      projectid: number;
      resourceStatus: { quota: { [key: string]: any }; resource: { [key: string]: any } };
    }[]
  > {
    const data: { [key: string]: any } = await axios(`/tenant/${tenantId}/projectquotas`, { params: params });
    return data as {
      project: string;
      projectid: number;
      resourceStatus: { quota: { [key: string]: any }; resource: { [key: string]: any } };
    }[];
  }
}
