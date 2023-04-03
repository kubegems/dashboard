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

import { Audit } from '../typed/audit';
import { convertResponse2Pagination } from '../utils';

export const useAuditPagination = async (
  audit: Audit,
  page = 1,
  size = 10,
  request: KubeRequest = {},
): Promise<Pagination<Audit>> => {
  const _data: KubePaginationResponse<Audit[]> = await audit.getAuditList({
    page: page,
    size: size,
    preload: 'Tenant',
    ...request,
  });

  return convertResponse2Pagination<Audit>(_data);
};
