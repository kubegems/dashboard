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
import {
  clusterSelectData,
  projectEnvironmentSelectData,
  tenantProjectSelectData,
  tenantSelectData,
  userTenantSelectData,
  virtualSpaceSelectData,
} from '@/api';
import { convertResponse2List } from '@/types/base';
import { Cluster } from '@/types/cluster';
import { Environment } from '@/types/environment';
import { Project } from '@/types/project';
import { Tenant } from '@/types/tenant';
import { VirtualSpace } from '@/types/virtualspace';

export async function useVirtualSpace(): Promise<{ [key: string]: string | number }[]> {
  const data: { [key: string]: any } = await virtualSpaceSelectData({ noprocessing: true });
  const virtualSpaceSelect: { [key: string]: string | number }[] = [];
  convertResponse2List(data as KubePaginationResponse<VirtualSpace[]>).forEach((r: any): void => {
    virtualSpaceSelect.push({
      VirtualSpaceName: r.VirtualSpaceName,
      ID: r.ID,
    });
  });
  return virtualSpaceSelect;
}

export async function useCluster(): Promise<{ [key: string]: string | number }[]> {
  const data: { [key: string]: any } = await clusterSelectData({ noprocessing: true });
  const clusterSelect: { [key: string]: string | number }[] = [];
  convertResponse2List(data as KubePaginationResponse<Cluster[]>).forEach((c: any): void => {
    clusterSelect.push({
      ClusterName: c.ClusterName,
      Version: c.Version,
      ID: c.ID,
    });
  });
  return clusterSelect;
}

export async function useTenant(admin: boolean, userid: number): Promise<{ [key: string]: string | number }[]> {
  let data: { [key: string]: any } = {};
  if (admin) {
    data = await tenantSelectData({ noprocessing: true });
  } else {
    data = await userTenantSelectData(userid, {
      noprocessing: true,
    });
  }
  const tenantSelect: { [key: string]: string | number }[] = [];
  convertResponse2List(data as KubePaginationResponse<Tenant[]>).forEach((tenant: any): void => {
    if (tenant.IsActive && ((tenant.Clusters && tenant.Clusters.length > 0) || tenant.ResourceQuotas)) {
      tenantSelect.push({
        TenantName: tenant.TenantName,
        ID: tenant.ID,
      });
    }
  });
  return tenantSelect;
}

export async function useProject(tenantid: number): Promise<{ [key: string]: string | number }[]> {
  const data: { [key: string]: any } = await tenantProjectSelectData(tenantid, {
    noprocessing: true,
  });
  const tenantProjectSelect: { [key: string]: string | number }[] = [];
  convertResponse2List(data as KubePaginationResponse<Project[]>).forEach((p: any): void => {
    tenantProjectSelect.push({
      ProjectName: p.ProjectName,
      ID: p.ID,
    });
  });
  return tenantProjectSelect;
}

export async function useEnvironment(projectid: number): Promise<{ [key: string]: string | number }[]> {
  const data: { [key: string]: any } = await projectEnvironmentSelectData(projectid, {
    noprocessing: true,
  });
  const projectEnvironmentSelect: { [key: string]: string | number }[] = [];
  convertResponse2List(data as KubePaginationResponse<Environment[]>).forEach((ns: any): void => {
    projectEnvironmentSelect.push({
      EnvironmentName: ns.EnvironmentName,
      ID: ns.ID,
      Namespace: ns.Namespace,
      ClusterName: ns.Cluster.ClusterName,
      ClusterID: ns.ClusterID,
      Type: ns.MetaType,
      Version: ns.Cluster.Version,
      AllowEdgeRegistration: ns.AllowEdgeRegistration,
    });
  });
  return projectEnvironmentSelect;
}
