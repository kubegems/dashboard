import { Environment } from '@/types/environment';

export const useProjectPagination = async (page = 1, size = 10): Promise<Environment[]> => {
  const environment = new Environment();
  const _data: KubePaginationResponse<Environment[]> = await environment.getEnvironmentList({
    page: page,
    size: size,
    noprocessing: true,
  });
  return _data.List;
};
