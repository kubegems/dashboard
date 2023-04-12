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

import { beautifyCpuUnit, sizeOfCpu, sizeOfStorage, beautifyStorageUnit } from '@kubegems/libs/utils/helpers';

import { useGlobalI18n } from './i18n';
import { useQuery } from './router';
import { useStore } from './store';

const store = useStore();
const i18n = useGlobalI18n();
const query = useQuery();

export const useCluster = (): string => {
  return (
    store.state.Edge ||
    (store.state.AdminViewport
      ? store.getters.Cluster().ClusterName || ''
      : store.getters.Environment().ClusterName || '')
  );
};

export const useClusterID = (): number => {
  return store.state.AdminViewport ? store.getters.Cluster().ID || '' : store.getters.Environment().ClusterID || 0;
};

export const useNamespace = (): string => {
  if (store.state.Edge) {
    if (store.state.NamespaceFilter && store.state.NamespaceFilter.Namespace) {
      return store.state.NamespaceFilter.Namespace;
    }
    return '_all';
  } else {
    return store.state.AdminViewport
      ? store.state.NamespaceFilter && store.state.NamespaceFilter.Namespace
        ? store.state.NamespaceFilter.Namespace
        : '_all'
      : store.getters.Environment().Namespace || '';
  }
};

export const useEnvironmentID = (): number => {
  let EnvironmentID = 0;
  if (store.getters.Environment().ID > 0) {
    EnvironmentID = store.getters.Environment().ID;
  }
  return EnvironmentID;
};

export const useBeautifyData = (data: { [key: string]: any }): { [key: string]: any } => {
  const newdata = {};
  for (const item in data) {
    if (data[item] === null) continue;
    if (['pause', 'selfSigned', 'emptyDir'].indexOf(item) > -1 && JSON.stringify(data[item]) === '{}') {
      newdata[item] = {};
    }
    if (JSON.stringify(data[item]) === '[]') continue;
    if (data[item] === '') continue;
    if (typeof data[item] === 'string') {
      data[item] = data[item].trim();
      if (
        data[item] !== '' &&
        !isNaN(data[item]) &&
        [
          'resourceVersion',
          'deployment.kubernetes.io/revision',
          'deprecated.daemonset.template.generation',
          'name',
          'exact',
          'regex',
          'prefix',
        ].indexOf(item) === -1
      ) {
        newdata[item] = parseFloat(data[item]);
      } else {
        if (data[item] === 'true') {
          newdata[item] = true;
        } else if (data[item] === 'false') {
          newdata[item] = false;
        } else {
          newdata[item] = data[item];
        }
      }
    } else if (data[item] instanceof Array) {
      if (['env', 'command', 'args', 'finalizers', 'managedFields'].indexOf(item) > -1) {
        newdata[item] = data[item];
      } else {
        newdata[item] = [];
        data[item].forEach((d) => {
          if (typeof d === 'object') {
            newdata[item].push(useBeautifyData(d));
          } else {
            newdata[item].push(d);
          }
        });
      }
    } else if (data[item] instanceof Object) {
      // if (JSON.stringify(data[item]) === '{}') continue
      if (
        [
          'annotations',
          'labels',
          'matchLabels',
          'data',
          'status',
          'selector',
          'nodeSelector',
          'dnsConfig',
          'configMapData',
        ].indexOf(item) === -1
      ) {
        newdata[item] = useBeautifyData(data[item]);
      } else {
        newdata[item] = data[item];
      }
    } else {
      newdata[item] = data[item];
    }
  }
  return newdata;
};

export const useCheckDataWithOutNS = (data: { [key: string]: any }): boolean => {
  if (!(data && data.metadata)) {
    store.commit('SET_SNACKBAR', {
      text: i18n.t('tip.missing_metadata'),
      color: 'warning',
    });
    return false;
  }
  if (!data.metadata.name) {
    store.commit('SET_SNACKBAR', {
      text: i18n.t('tip.missing_name'),
      color: 'warning',
    });
    return false;
  }
  return true;
};

export const useCheckDataWithNS = (data: { [key: string]: any }, ns: string): boolean => {
  if (!(data && data.metadata)) {
    store.commit('SET_SNACKBAR', {
      text: i18n.t('tip.missing_metadata'),
      color: 'warning',
    });
    return false;
  }
  if (!data.metadata.name) {
    store.commit('SET_SNACKBAR', {
      text: i18n.t('tip.missing_name'),
      color: 'warning',
    });
    return false;
  }
  if (!data?.metadata?.namespace) {
    data.metadata.namespace = ns || query.value.namespace;
  }
  if (!data.metadata.namespace) {
    store.commit('SET_SNACKBAR', {
      text: i18n.t('tip.missing_namespace'),
      color: 'warning',
    });
    return false;
  }
  return true;
};

export const useCheckManifestCompleteness = (djson: { [key: string]: any }): boolean => {
  if (djson.kind === 'PersistentVolumeClaim') {
    if (!djson.spec.storageClassName || (djson.spec.storageClassName && djson.spec.storageClassName === '')) {
      return false;
    }
  } else if (djson.kind === 'Ingress') {
    if (!djson.spec.ingressClassName || (djson.spec.ingressClassName && djson.spec.ingressClassName === '')) {
      return false;
    }
  }
  return true;
};

export const useAddNsToData = (data: { [key: string]: any }, ns: string): void => {
  if (!data) return;
  if (!data?.metadata?.namespace) {
    data.metadata.namespace = ns || query.value.namespace;
  }
};

export const useResourceBeatiful = (resourceUseDetail: { [key: string]: any }): { [key: string]: any } => {
  const obj = { cpuItems: [], memoryItems: [], storageItems: [], networkItems: [] };
  obj.cpuItems.push({
    max: beautifyCpuUnit(sizeOfCpu(resourceUseDetail.MaxCPUUsageCore + 'core', 'n')),
    min: beautifyCpuUnit(sizeOfCpu(resourceUseDetail.MinCPUUsageCore + 'core', 'n')),
    avg: beautifyCpuUnit(sizeOfCpu(resourceUseDetail.AvgCPUUsageCore + 'core', 'n')),
  });
  obj.memoryItems.push({
    max: beautifyStorageUnit(sizeOfStorage(resourceUseDetail.MaxMemoryUsageByte + 'B', 'B')),
    min: beautifyStorageUnit(sizeOfStorage(resourceUseDetail.MinMemoryUsageByte + 'B', 'B')),
    avg: beautifyStorageUnit(sizeOfStorage(resourceUseDetail.AvgMemoryUsageByte + 'B', 'B')),
  });
  obj.storageItems.push({
    max: beautifyStorageUnit(sizeOfStorage(resourceUseDetail.MaxPVCUsageByte + 'B', 'B')),
    min: beautifyStorageUnit(sizeOfStorage(resourceUseDetail.MinPVCUsageByte + 'B', 'B')),
    avg: beautifyStorageUnit(sizeOfStorage(resourceUseDetail.AvgPVCUsageByte + 'B', 'B')),
  });
  obj.networkItems.push({
    in: beautifyStorageUnit(sizeOfStorage(resourceUseDetail.NetworkReceiveByte + 'B', 'B')),
    out: beautifyStorageUnit(sizeOfStorage(resourceUseDetail.NetworkSendByte + 'B', 'B')),
  });
  return obj;
};
