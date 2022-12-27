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
import { Telemetry } from '@/types/opentelemetry';

export const useServicePagination = async (
  telemetry: Telemetry,
  cluster: string,
  namespace: string,
  pagination: KubePaginationRequest,
): Promise<Pagination<Telemetry>> => {
  const _data: KubePaginationResponse<Telemetry[]> = await telemetry.getServiceList(cluster, namespace, {
    page: pagination.page,
    size: pagination.size,
    start: pagination.start,
    end: pagination.end,
    sortby: pagination.sortby,
  });

  return {
    items: _data.List,
    pageCount: Math.ceil(_data.Total / _data.CurrentSize),
    page: _data.CurrentPage,
    size: _data.CurrentSize,
  } as Pagination<Telemetry>;
};

export const useOperationPagination = async (
  telemetry: Telemetry,
  cluster: string,
  namespace: string,
  service: string,
  pagination: KubePaginationRequest,
): Promise<Pagination<Telemetry>> => {
  const _data: KubePaginationResponse<Telemetry[]> = await telemetry.getOperation(cluster, namespace, service, {
    page: pagination.page,
    size: pagination.size,
    start: pagination.start,
    end: pagination.end,
  });

  return {
    items: _data.List,
    pageCount: Math.ceil(_data.Total / _data.CurrentSize),
    page: _data.CurrentPage,
    size: _data.CurrentSize,
  } as Pagination<Telemetry>;
};

export const useTracePagination = async (
  telemetry: Telemetry,
  cluster: string,
  namespace: string,
  service: string,
  pagination: KubePaginationRequest,
): Promise<Pagination<Telemetry>> => {
  const _data: KubePaginationResponse<Telemetry[]> = await telemetry.getTrace(cluster, namespace, service, {
    page: pagination.page,
    size: pagination.size,
    start: pagination.start,
    end: pagination.end,
    maxDuration: pagination.maxDuration,
    minDuration: pagination.minDuration,
    limit: pagination.limit,
  });

  return {
    items: _data.List,
    pageCount: Math.ceil(_data.Total / _data.CurrentSize),
    page: _data.CurrentPage,
    size: _data.CurrentSize,
  } as Pagination<Telemetry>;
};
