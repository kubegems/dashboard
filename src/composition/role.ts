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
import { convertResponse2List } from '@/types/base';
import { Role } from '@/types/role';

export const useRoleList = async (role: Role): Promise<Role[]> => {
  const _data: KubePaginationResponse<Role[]> = await role.getRoleList({
    page: 1,
    size: 1000,
    noprocessing: true,
  });
  return convertResponse2List<Role>(_data);
};
