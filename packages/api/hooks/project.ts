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
import { User } from 'typed/user';
import { Environment } from '../typed/environment';
import { Project } from '../typed/project';
import { convertResponse2List, convertResponse2Pagination } from '../utils';

export const useProjectList = async (project: Project): Promise<Project[]> => {
  const _data: KubePaginationResponse<Project[]> = await project.getProjectList({
    page: 1,
    size: 1000,
    noprocessing: true,
    preload: 'Tenant',
  });
  return convertResponse2List<Project>(_data);
};

export const useEnvironmentListInProject = async (project: Project): Promise<Environment[]> => {
  const _data: KubePaginationResponse<Environment[]> = await project.getEnvironmentList({
    page: 1,
    size: 1000,
    noprocessing: true,
    preload: 'Cluster,Project',
  });
  return convertResponse2List<Environment>(_data);
};

export const useProjectPagination = async (
  project: Project,
  page = 1,
  size = 10,
  request = {},
): Promise<Pagination<Project>> => {
  const _data: KubePaginationResponse<Project[]> = await project.getProjectList({
    page: page,
    size: size,
    preload: 'Environments,Tenant',
    ...request,
  });

  return convertResponse2Pagination<Project>(_data);
};

export const useProjectUserList = async (project: Project): Promise<User[]> => {
  const _data: KubePaginationResponse<User[]> = await project.getUserList({
    page: 1,
    size: 1000,
    noprocessing: true,
  });
  return convertResponse2List<User>(_data);
};
