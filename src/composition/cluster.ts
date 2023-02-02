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
import { EDGE_DEVICEID_KEY } from '@/constants/label';
import { Cluster } from '@/types/cluster';
import { EdgeCluster } from '@/types/edge_cluster';
import { EdgeHub } from '@/types/edge_hub';
import { stringifySelector } from '@/utils/k8s_selector';

export const useClusterList = async (cluster: Cluster): Promise<Cluster[]> => {
  const _data: KubePaginationResponse<Cluster[]> = await cluster.getClusterList({
    page: 1,
    size: 100,
    noprocessing: true,
  });
  return _data.List as Cluster[];
};

export const useEdgeHubList = async (edgeHub: EdgeHub): Promise<EdgeHub[]> => {
  const _data: EdgeHub[] = await edgeHub.getEdgeHubList({
    noprocessing: true,
  });
  return _data as EdgeHub[];
};

export const useEdgeClusterList = async (
  edge: EdgeCluster,
  labels: { [key: string]: string[] } = {},
): Promise<Cluster[]> => {
  const labelSelector: string = stringifySelector({
    matchExpressions: Object.keys(labels).map((key) => {
      return {
        key: key,
        operator: 'in',
        values: labels[key],
      };
    }),
  });

  const _data: KubePaginationResponse<EdgeCluster[]> = await edge.getEdgeClusterList({
    page: 1,
    size: 100,
    noprocessing: true,
    labels: labelSelector,
  });
  const clusterList = _data.List.map((edge: EdgeCluster, index: number) => {
    return {
      ID: index,
      ClusterName: edge.metadata.name,
      Version: edge.spec.register.hubName,
      Upstream: edge.spec.register.hubName,
      Status: edge.status.phase,
      DisplayName: edge.metadata.labels[EDGE_DEVICEID_KEY] || edge.metadata.name,
    };
  });
  return clusterList as Cluster[];
};

export const useEdgeClusterPagination = async (
  edge: EdgeCluster,
  page = 1,
  size = 10,
  labels: { [key: string]: string[] } = {},
  search = '',
): Promise<Pagination<EdgeCluster>> => {
  const labelSelector: string = stringifySelector({
    matchExpressions: Object.keys(labels).map((key) => {
      return {
        key: key,
        operator: 'in',
        values: labels[key],
      };
    }),
  });

  const _data: KubePaginationResponse<EdgeCluster[]> = await edge.getEdgeClusterList({
    page: page,
    size: size,
    noprocessing: true,
    labels: labelSelector,
    search: search,
  });

  return {
    items: _data.List,
    pageCount: Math.ceil(_data.Total / _data.CurrentSize),
    page: _data.CurrentPage,
    size: _data.CurrentSize,
  } as Pagination<EdgeCluster>;
};

export const useEdgeClusterConvertToCluster = async (cluster: string): Promise<Cluster> => {
  const data: EdgeCluster = await new EdgeCluster({ metadata: { name: cluster } }).getEdgeCluster();
  return new Cluster({
    ClusterName: data.metadata.name,
    Version: data.status.manufacture['edge.kubegems.io/kubernetes-version'] || '',
    OversoldConfig: {
      cpu: 1,
      memory: 1,
      storage: 1,
    },
  });
};
