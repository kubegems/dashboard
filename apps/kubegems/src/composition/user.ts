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

import { convertResponse2List, convertResponse2Pagination } from '@/types/base';
import { User } from '@/types/user';

export const useUserPagination = async (user: User, page = 1, size = 10, search = ''): Promise<Pagination<User>> => {
  const _data: KubePaginationResponse<User[]> = await user.getUserList({
    page: page,
    size: size,
    search: search,
    preload: 'SystemRole',
  });

  return convertResponse2Pagination<User>(_data);
};

export const useUserList = async (user: User): Promise<User[]> => {
  const _data: KubePaginationResponse<User[]> = await user.getUserList({
    page: 1,
    size: 1000,
    noprocessing: true,
  });
  return convertResponse2List<User>(_data);
};
