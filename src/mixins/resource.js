import Ajv from 'ajv';
import { mapGetters, mapState } from 'vuex';

import { getClusterQuota, getTenantResourceQuota } from '@/api';
import { sizeOfCpu, sizeOfStorage } from '@/utils/helpers';

const resource = {
  computed: {
    ...mapState(['AdminViewport', 'NamespaceFilter']),
    ...mapGetters(['Cluster', 'Environment']),
    // 当前集群，特殊命名
    ThisCluster() {
      return this.AdminViewport ? this.Cluster().ClusterName || '' : this.Environment().ClusterName || '';
    },
    // 当前命名空间，特殊命名
    ThisNamespace() {
      return this.AdminViewport
        ? this.NamespaceFilter && this.NamespaceFilter.Namespace
          ? this.NamespaceFilter.Namespace
          : '_all'
        : this.Environment().Namespace || '';
    },
    // 当前集群ID，特殊命名
    ThisClusterID() {
      return this.AdminViewport ? this.Cluster().ID || '' : this.Environment().ClusterID || '';
    },
    // 当前环境ID，特殊命名
    ThisAppEnvironmentID() {
      let EnvironmentID = null;
      if (this.Environment().ID > 0) {
        EnvironmentID = this.Environment().ID;
      }
      return EnvironmentID;
    },
  },
  methods: {
    async m_resource_tenantResourceQuota(ClusterName, TenantName) {
      const data = await getTenantResourceQuota(ClusterName, TenantName, {
        noprocessing: true,
      });
      if (data.spec.hard) {
        const item = {
          Cpu: parseFloat(sizeOfCpu(data.spec.hard['limits.cpu'])),
          Memory: parseFloat(sizeOfStorage(data.spec.hard['limits.memory'])),
          Storage: parseFloat(sizeOfStorage(data.spec.hard[`requests.storage`])),
          Pod: 5120,
          AllocatedCpu: parseFloat(sizeOfCpu(data.status.allocated ? data.status.allocated['limits.cpu'] : 0)),
          AllocatedMemory: parseFloat(
            sizeOfStorage(data.status.allocated ? data.status.allocated['limits.memory'] : 0),
          ),
          AllocatedStorage: parseFloat(
            sizeOfStorage(data.status.allocated ? data.status.allocated[`requests.storage`] : 0),
          ),
          AllocatedPod: 0,
          ApplyCpu:
            parseFloat(sizeOfCpu(data.spec.hard['limits.cpu'])) -
            parseFloat(sizeOfCpu(data.status.allocated ? data.status.allocated['limits.cpu'] : 0)),
          ApplyMemory:
            parseFloat(sizeOfStorage(data.spec.hard['limits.memory'])) -
            parseFloat(sizeOfStorage(data.status.allocated ? data.status.allocated['limits.memory'] : 0)),
          ApplyStorage:
            parseFloat(sizeOfStorage(data.spec.hard[`requests.storage`])) -
            parseFloat(sizeOfStorage(data.status.allocated ? data.status.allocated[`requests.storage`] : 0)),
          ApplyPod: 0,
        };
        if (data.spec.hard[`limits.nvidia.com/gpu`] && parseInt(data.spec.hard[`limits.nvidia.com/gpu`]) > 0) {
          item.NvidiaGpu = parseFloat(sizeOfCpu(data.spec.hard['limits.nvidia.com/gpu']));
          item.AllocatedNvidiaGpu = parseFloat(
            data.status.allocated ? data.status.allocated['limits.nvidia.com/gpu'] : 0,
          );
          item.ApplyNvidiaGpu =
            parseFloat(data.spec.hard['limits.nvidia.com/gpu']) -
            parseFloat(data.status.allocated ? data.status.allocated['limits.nvidia.com/gpu'] : 0);
        }
        if (
          (data.spec.hard[`tencent.com/vcuda-core`] && parseInt(data.spec.hard[`tencent.com/vcuda-core`]) > 0) ||
          (data.spec.hard[`tencent.com/vcuda-memory`] && parseInt(data.spec.hard[`tencent.com/vcuda-memory`]) > 0)
        ) {
          item.TkeGpu = parseFloat(data.spec.hard['tencent.com/vcuda-core']);
          item.AllocatedTkeGpu = parseFloat(
            data.status.allocated ? data.status.allocated['tencent.com/vcuda-core'] : 0,
          );
          item.ApplyTkeGpu =
            parseFloat(data.spec.hard['tencent.com/vcuda-core']) -
            parseFloat(data.status.allocated ? data.status.allocated['tencent.com/vcuda-core'] : 0);

          item.TkeMemory = parseFloat(data.spec.hard['tencent.com/vcuda-memory']);
          item.AllocatedTkeMemory = parseFloat(
            data.status.allocated ? data.status.allocated['tencent.com/vcuda-memory'] : 0,
          );
          item.ApplyTkeMemory =
            parseFloat(data.spec.hard['tencent.com/vcuda-memory']) -
            parseFloat(data.status.allocated ? data.status.allocated['tencent.com/vcuda-memory'] : 0);
        }
        return item;
      }
      return null;
    },
    async m_resource_clusterQuota(clusterid, item) {
      const data = await getClusterQuota(clusterid);
      const quota = {};
      if (data.resources) {
        quota.CpuRatio = data.oversoldConfig ? data.oversoldConfig.cpu : 1;
        quota.MemoryRatio = data.oversoldConfig ? data.oversoldConfig.memory : 1;
        quota.StorageRatio = data.oversoldConfig ? data.oversoldConfig.storage : 1;
        quota.Cpu = parseFloat(sizeOfCpu(data.resources.capacity.cpu)) * quota.CpuRatio;
        quota.UsedCpu = parseFloat(sizeOfCpu(data.resources.tenantAllocated['limits.cpu']));
        quota.AllocatedCpu = quota.Cpu - quota.UsedCpu + item.NowCpu;
        quota.Memory = parseFloat(sizeOfStorage(data.resources.capacity.memory)) * quota.MemoryRatio;
        quota.UsedMemory = parseFloat(sizeOfStorage(data.resources.tenantAllocated['limits.memory']));
        quota.AllocatedMemory = quota.Memory - quota.UsedMemory + item.NowMemory;
        quota.Storage = parseFloat(sizeOfStorage(data.resources.capacity['ephemeral-storage'])) * quota.StorageRatio;
        quota.UsedStorage = parseFloat(sizeOfStorage(data.resources.tenantAllocated['requests.storage']));
        quota.AllocatedStorage = quota.Storage - quota.UsedStorage + item.NowStorage;

        if (data.resources.capacity['nvidia.com/gpu'] && parseInt(data.resources.capacity[`nvidia.com/gpu`]) > 0) {
          quota.NvidiaGpu = parseFloat(data.resources.capacity['nvidia.com/gpu']);
          quota.UsedNvidiaGpu = parseFloat(data.resources.tenantAllocated['nvidia.com/gpu'] || 0);
          quota.AllocatedNvidiaGpu = quota.NvidiaGpu - quota.UsedNvidiaGpu + (item.NowNvidiaGpu || 0);
        }

        if (
          (data.resources.capacity['tencent.com/vcuda-core'] &&
            parseInt(data.resources.capacity[`tencent.com/vcuda-core`]) > 0) ||
          (data.resources.capacity['tencent.com/vcuda-memory'] &&
            parseInt(data.resources.capacity[`tencent.com/vcuda-memory`]) > 0)
        ) {
          quota.TkeGpu = parseFloat(data.resources.capacity['tencent.com/vcuda-core']);
          quota.UsedTkeGpu = parseFloat(data.resources.tenantAllocated['tencent.com/vcuda-core'] || 0);
          quota.AllocatedTkeGpu = quota.TkeGpu - quota.UsedTkeGpu + (item.NowTkeGpu || 0);

          quota.TkeMemory = parseFloat(data.resources.capacity['tencent.com/vcuda-memory']);
          quota.UsedTkeMemory = parseFloat(data.resources.tenantAllocated['tencent.com/vcuda-memory'] || 0);
          quota.AllocatedTkeMemory = quota.TkeMemory - quota.UsedTkeMemory + (item.NowTkeMemory || 0);
        }
        return quota;
      }
      return null;
    },
    m_resource_checkDataWithNS(data, ns) {
      if (!(data && data.metadata)) {
        this.$store.commit('SET_SNACKBAR', {
          text: this.$root.$t('tip.missing_metadata'),
          color: 'warning',
        });
        return false;
      }
      if (!data.metadata.name) {
        this.$store.commit('SET_SNACKBAR', {
          text: this.$root.$t('tip.missing_name'),
          color: 'warning',
        });
        return false;
      }
      if (!data?.metadata?.namespace) {
        data.metadata.namespace = ns || this.$route.query.namespace;
      }
      if (!data.metadata.namespace) {
        this.$store.commit('SET_SNACKBAR', {
          text: this.$root.$t('tip.missing_namespace'),
          color: 'warning',
        });
        return false;
      }
      return true;
    },
    m_resource_addNsToData(data, ns) {
      if (!data) return;
      if (!data?.metadata?.namespace) {
        data.metadata.namespace = ns || this.$route.query.namespace;
      }
    },
    m_resource_checkDataWithOutNS(data) {
      if (!(data && data.metadata)) {
        this.$store.commit('SET_SNACKBAR', {
          text: this.$root.$t('tip.missing_metadata'),
          color: 'warning',
        });
        return false;
      }
      if (!data.metadata.name) {
        this.$store.commit('SET_SNACKBAR', {
          text: this.$root.$t('tip.missing_name'),
          color: 'warning',
        });
        return false;
      }
      return true;
    },
    m_resource_checkManifestCompleteness(djson) {
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
    },
    m_resource_beautifyData(data) {
      const newdata = {};
      for (var item in data) {
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
                newdata[item].push(this.m_resource_beautifyData(d));
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
            newdata[item] = this.m_resource_beautifyData(data[item]);
          } else {
            newdata[item] = data[item];
          }
        } else {
          newdata[item] = data[item];
        }
      }
      return newdata;
    },
    m_resource_getPodStatus(podItem) {
      /*
      根据pod生命周期，pod的生命周期分为 Pending, Running, Succeeded, Failed, Unknow 五个大状态
      容器又分为三种大状态 Waiting, Running, Terminated
      以上，容器真实状态判断函数如下
      */
      if (podItem.metadata.deletionTimestamp) {
        return 'Terminating';
      }
      if (!podItem.status.containerStatuses) {
        return podItem.status.reason ? podItem.status.reason : podItem.status.phase;
      }
      let st = 'Running';
      podItem.status.containerStatuses.forEach((con) => {
        if (con.state.waiting) {
          st = con.state.waiting.reason;
        } else if (con.state.terminated) {
          st = con.state.terminated.reason;
        }
      });
      return st;
    },
    m_resource_getWorkloadStatus(kind, item) {
      if (!item) return '';
      if (kind !== 'DaemonSet') {
        if ((item.status.availableReplicas || item.status.readyReplicas || 0) < item.spec.replicas) {
          return 'pending';
        } else {
          return 'ready';
        }
      } else {
        if ((item.status.numberReady || 0) < item.status.currentNumberScheduled) {
          return 'pending';
        } else {
          return 'ready';
        }
      }
    },
    m_resource_validateJsonSchema(schema, data) {
      if (!data) return false;
      const ajv = new Ajv();
      const validate = ajv.compile(schema);
      const valid = validate(data);
      if (!valid) {
        this.$store.commit('SET_SNACKBAR', {
          text: `${this.$root.$t('tip.not_correct_yaml')} ${validate.errors
            .map((err) => {
              return `${this.$root.$t('tip.path')}${err.instancePath} ${err.message}`;
            })
            .join(',')}`,
          color: 'warning',
        });
        return false;
      }
      return true;
    },
  },
};

export default resource;
