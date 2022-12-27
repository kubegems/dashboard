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
import { Environment } from '@/types/environment';
import { Project } from '@/types/project';
import { Tenant } from '@/types/tenant';

export const useTenantList = async (tenant: Tenant): Promise<Tenant[]> => {
  const _data: KubePaginationResponse<Tenant[]> = await tenant.getTenantList({
    page: 1,
    size: 1000,
    noprocessing: true,
  });
  return _data.List as Tenant[];
};

export const useProjectListInTenant = async (tenant: Tenant): Promise<Project[]> => {
  const _data: KubePaginationResponse<Project[]> = await tenant.getProjectList({
    page: 1,
    size: 100,
    noprocessing: true,
    preload: 'Cluster',
  });
  return _data.List as Project[];
};

export const useEnvironmentListInTenant = async (tenant: Tenant): Promise<Environment[]> => {
  const _data: KubePaginationResponse<Environment[]> = await tenant.getEnvironmentList({
    page: 1,
    size: 100,
    noprocessing: true,
    preload: 'Cluster,Project',
  });
  return _data.List as Environment[];
};
