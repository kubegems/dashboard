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
import { Environment } from './environment';
import { Project } from './project';
import { ResourceRole, UserRole } from './role';
import { User } from './user';

interface ProjectInTenant {
  getProjectList(params: KubePaginationRequest): Promise<KubePaginationResponse<Project[]>>;
}

interface EnvironmentInTenant {
  getEnvironmentList(params: KubePaginationRequest): Promise<KubePaginationResponse<Environment[]>>;
}

interface ClusterInTenant {
  getClusterList(params: KubePaginationRequest): Promise<KubePaginationResponse<Cluster[]>>;
}

interface ResourceQuotaInTenant {
  getResourceQuotaList(params: KubePaginationRequest): Promise<KubePaginationResponse<TenantResourceQuota[]>>;
  deleteResourceQuota(quotaId: number): Promise<void>;
  addResourceQuota(resourceQuota: TenantResourceQuota): Promise<TenantResourceQuota>;
  updateResourceQuota(resourceQuota: TenantResourceQuota): Promise<TenantResourceQuota>;
}

interface Operator {
  activeTenant(): Promise<void>;
  disableTenant(): Promise<void>;
}

export class TenantResourceQuota {
  constructor(quota?: { [key: string]: any }) {
    Object.assign(this, quota);
  }

  ID: number;
  Cluster: Cluster;
  ClusterID: number;
  Content: any;
  Tenant: Tenant;
  TenantID: number;
  TenantResourceQuotaApply: any;
  TenantResourceQuotaApplyID: number;

  [others: string]: any;
}

export class Tenant
  implements UserRole, ProjectInTenant, EnvironmentInTenant, Operator, ResourceQuotaInTenant, ClusterInTenant
{
  constructor(tenant?: { [key: string]: any }) {
    Object.assign(this, tenant);
  }

  ID: number;
  AllocatedResourcequota: any;
  ResourceQuotas: any;
  CreatedAt: Date;
  IsActive: boolean;
  Remark: string;
  TenantName: string;
  UpdatedAt: Date;
  Users: User[];
  [others: string]: any;

  public async getTenantList(params: KubePaginationRequest): Promise<KubePaginationResponse<Tenant[]>> {
    const data: { [key: string]: any } = await axios(`tenant`, { params: params });
    return data as KubePaginationResponse<Tenant[]>;
  }

  public async getTenant(params: KubeRequest = {}): Promise<Tenant> {
    const data: { [key: string]: any } = await axios(`tenant/${this.ID}`, { params: params });
    return data as Tenant;
  }

  public async addTenant(): Promise<Tenant> {
    const data: { [key: string]: any } = await axios.post(`tenant`, this);
    return data as Tenant;
  }

  public async updateTenant(): Promise<Tenant> {
    const data: { [key: string]: any } = await axios.put(`tenant/${this.ID}`, this);
    return data as Tenant;
  }

  public async deleteTenant(): Promise<void> {
    await axios.delete(`tenant/${this.ID}`);
  }

  // IUserRole
  public async getUserList(params: KubePaginationRequest): Promise<KubePaginationResponse<User[]>> {
    const data: { [key: string]: any } = await axios(`tenant/${this.ID}/user`, { params: params });
    return data as KubePaginationResponse<User[]>;
  }

  public async addUser(user: User, role: ResourceRole): Promise<any> {
    const body = {
      TenantID: this.ID,
      UserID: user.ID,
      Role: role,
    };
    await axios.post(`tenant/${this.ID}/user`, body);
    return body;
  }

  public async updateUser(user: User, role: ResourceRole): Promise<any> {
    const body = {
      TenantID: this.ID,
      UserID: user.ID,
      Role: role,
    };
    await axios.put(`tenant/${this.ID}/user/${user.ID}`, body);
    return body;
  }

  public async deleteUser(user: User): Promise<void> {
    await axios.delete(`tenant/${this.ID}/user/${user.ID}`);
  }

  // ProjectInTenant
  public async getProjectList(params: KubePaginationRequest): Promise<KubePaginationResponse<Project[]>> {
    const data: { [key: string]: any } = await axios(`tenant/${this.ID}/project`, { params: params });
    return data as KubePaginationResponse<Project[]>;
  }

  // EnvironmentInTenant
  public async getEnvironmentList(params: KubePaginationRequest): Promise<KubePaginationResponse<Environment[]>> {
    const data: { [key: string]: any } = await axios(`tenant/${this.ID}/environment`, { params: params });
    return data as KubePaginationResponse<Environment[]>;
  }

  // Operator
  public async activeTenant(): Promise<void> {
    await axios.put(`tenant/${this.ID}/action/enable`);
  }

  public async disableTenant(): Promise<void> {
    await axios.put(`tenant/${this.ID}/action/disable`);
  }

  // ResourceQuotaInTenant
  public async getResourceQuotaList(
    params: KubePaginationRequest,
  ): Promise<KubePaginationResponse<TenantResourceQuota[]>> {
    const data: { [key: string]: any } = await axios(`tenant/${this.ID}/tenantresourcequota`, { params: params });
    return data as KubePaginationResponse<TenantResourceQuota[]>;
  }

  public async deleteResourceQuota(quotaId: number): Promise<void> {
    await axios.delete(`tenant/${this.ID}/tenantresourcequota/${quotaId}`);
  }

  public async addResourceQuota(resourceQuota: TenantResourceQuota): Promise<TenantResourceQuota> {
    const data: { [key: string]: any } = await axios.post(`tenant/${this.ID}/tenantresourcequota`, resourceQuota);
    return data as TenantResourceQuota;
  }

  public async updateResourceQuota(resourceQuota: TenantResourceQuota): Promise<TenantResourceQuota> {
    const data: { [key: string]: any } = await axios.put(
      `tenant/${this.ID}/tenantresourcequota/${resourceQuota.ClusterID}`,
      resourceQuota,
    );
    return data as TenantResourceQuota;
  }

  // EnvironmentInTenant
  public async getClusterList(params: KubePaginationRequest): Promise<KubePaginationResponse<Cluster[]>> {
    const data: { [key: string]: any } = await axios(`tenant/${this.ID}/cluster`, { params: params });
    return data as KubePaginationResponse<Cluster[]>;
  }
}
