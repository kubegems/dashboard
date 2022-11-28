import { Environment } from '@/types/environment';

export const useEnvironmentList = async (environment: Environment): Promise<Environment[]> => {
  const _data: KubePaginationResponse<Environment[]> = await environment.getEnvironmentList({
    page: 1,
    size: 100,
    noprocessing: true,
    preload: 'Tenant,Project',
  });
  return _data.List;
};
