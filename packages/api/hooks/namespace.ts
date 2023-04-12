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
import { Namespace } from '../typed/namespace';
import { convertResponse2Pagination } from '../utils';

export const useNamespacePagination = async (
  namespace: Namespace,
  cluster: string,
  page = 1,
  size = 10,
): Promise<Pagination<Namespace>> => {
  const _data: KubePaginationResponse<Namespace[]> = await namespace.getNamespaceList(cluster, {
    page: page,
    size: size,
    noprocessing: true,
  });

  return convertResponse2Pagination<Namespace>(_data);
};
