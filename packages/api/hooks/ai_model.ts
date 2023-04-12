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

import { AIModel, AIModelComment, AIModelRegistry, AIModelRuntime } from '../typed/ai_model';
import { convertResponse2Pagination } from '../utils';

export const useAiModelPagination = async (
  model: AIModel,
  page = 1,
  size = 10,
  search = '',
  request: KubeRequest = {},
): Promise<Pagination<AIModel>> => {
  const _data: KubePaginationResponse<AIModel[]> = await model.getModelList(model.source, {
    page: page,
    size: size,
    search: search,
    ...request,
  });

  return convertResponse2Pagination<AIModel>(_data);
};

export const useRegistryUserList = async (registry: AIModelRegistry): Promise<string[]> => {
  const _data: string[] = await registry.getUserList({
    noprocessing: true,
  });
  return _data;
};

export const useAiModelCommentPagination = async (
  model: AIModelComment,
  source: string,
  name: string,
  page = 1,
  size = 10,
  request: KubeRequest = {},
): Promise<Pagination<AIModelComment>> => {
  const _data: KubePaginationResponse<AIModelComment[]> = await model.getCommentList(source, name, {
    page: page,
    size: size,
    ...request,
  });

  return convertResponse2Pagination<AIModelComment>(_data);
};

export const useAiModelRuntimePagination = async (
  model: AIModelRuntime,
  source: string,
  name: string,
  page = 1,
  size = 10,
  request: KubeRequest = {},
): Promise<Pagination<AIModelRuntime>> => {
  const _data: KubePaginationResponse<AIModelRuntime[]> = await model.getRuntimeList(source, name, {
    page: page,
    size: size,
    ...request,
  });

  return convertResponse2Pagination<AIModelRuntime>(_data);
};
