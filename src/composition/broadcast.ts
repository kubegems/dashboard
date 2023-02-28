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

import { Broadcast } from '@/types/broadcast';

export const useBroadcastPagination = async (
  broadcast: Broadcast,
  page = 1,
  size = 10,
): Promise<Pagination<Broadcast>> => {
  const _data: KubePaginationResponse<Broadcast[]> = await broadcast.getBroadcastList({
    page: page,
    size: size,
  });

  return {
    items: _data.list,
    pageCount: Math.ceil(_data.total / _data.size),
    page: _data.page,
    size: _data.size,
  } as Pagination<Broadcast>;
};
