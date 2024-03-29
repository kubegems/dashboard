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

import { AccessToken, Auth } from '../typed/auth';
import { convertResponse2Pagination } from '../utils';

export const useAccessTokenPagination = async (auth: Auth, page = 1, size = 10): Promise<Pagination<AccessToken>> => {
  const _data: KubePaginationResponse<AccessToken[]> = await auth.getAccessTokenList({
    page: page,
    size: size,
  });

  return convertResponse2Pagination<AccessToken>(_data);
};
