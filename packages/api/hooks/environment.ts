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
import { Environment } from '../typed/environment';
import { User } from '../typed/user';
import { convertResponse2List, convertResponse2Pagination } from '../utils';

export const useEnvironmentList = async (environment: Environment): Promise<Environment[]> => {
  const _data: KubePaginationResponse<Environment[]> = await environment.getEnvironmentList({
    page: 1,
    size: 1000,
    noprocessing: true,
    preload: 'Tenant,Project',
  });
  return convertResponse2List<Environment>(_data);
};

export const useEnvironmentPagination = async (
  environment: Environment,
  page = 1,
  size = 10,
  request = {},
): Promise<Pagination<Environment>> => {
  const _data: KubePaginationResponse<Environment[]> = await environment.getEnvironmentList({
    page: page,
    size: size,
    preload: 'Tenant,Project',
    ...request,
  });

  return convertResponse2Pagination<Environment>(_data);
};

export const useEnvironmentUserList = async (environment: Environment): Promise<User[]> => {
  const _data: KubePaginationResponse<User[]> = await environment.getUserList({
    page: 1,
    size: 1000,
    noprocessing: true,
  });
  return convertResponse2List<User>(_data);
};
