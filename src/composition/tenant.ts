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
