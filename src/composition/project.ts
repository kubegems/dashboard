import { Environment } from '@/types/environment';
import { Project } from '@/types/project';

export const useProjectList = async (project: Project): Promise<Project[]> => {
  const _data: KubePaginationResponse<Project[]> = await project.getProjectList({
    page: 1,
    size: 100,
    noprocessing: true,
  });
  return _data.List as Project[];
};

export const useEnvironmentListInProject = async (project: Project): Promise<Environment[]> => {
  const _data: KubePaginationResponse<Environment[]> = await project.getEnvironmentList({
    page: 1,
    size: 100,
    noprocessing: true,
    preload: 'Cluster,Project',
  });
  return _data.List as Environment[];
};
