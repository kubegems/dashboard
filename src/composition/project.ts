import { Environment } from '@/types/environment';
import { Project } from '@/types/project';

export const useProjectPagination = async (project: Project, page = 1, size = 10): Promise<Project[]> => {
  const _data: KubePaginationResponse<Project[]> = await project.getProjectList({
    page: page,
    size: size,
    noprocessing: true,
  });
  return _data.List as Project[];
};

export const useEnvironmentListInProject = async (project: Project, page = 1, size = 10): Promise<Environment[]> => {
  const _data: KubePaginationResponse<Environment[]> = await project.getEnvironmentList({
    page: page,
    size: size,
    noprocessing: true,
    preload: 'Cluster,Project',
  });
  return _data.List as Environment[];
};
