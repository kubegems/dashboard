import { mapGetters, mapState } from 'vuex'
import { getTenantResourceQuota, getClusterQuota } from '@/api'
import { sizeOfCpu, sizeOfStorage, convertStrToNum } from '@/utils/helpers'
import {
  deleteConfigMap,
  deleteCronJob,
  deleteIngress,
  deleteJob,
  deletePersistentVolumeClaim,
  deletePod,
  deleteSecret,
  deleteService,
  deleteDaemonSet,
  deleteDeployment,
  deleteStatefulSet,
  deleteVolumeSnapshot,
  deleteServiceMonitor,
  deletePrometheusRule,
  deleteReceiver,
  deleteCRD,
  deleteRepository,
  deleteTenant,
  deleteUser,
  deleteProject,
  deleteEnvironment,
  deleteCertificate,
  deleteIssuer,
  deleteIstioAuthorizationPolicy,
  deleteIstioGateway,
  deleteIstioPeerAuthentication,
  deleteIstioServiceEntry,
  deleteIstioSidecar,
} from '@/api'
import Ajv from 'ajv'

const resource = {
  data() {
    return {
      sortparam: { name: null, desc: false },
      batchResources: {},
      resourceRemoveFunc: {
        Deployment: deleteDeployment,
        StatefulSet: deleteStatefulSet,
        Daemonset: deleteDaemonSet,
        Pod: deletePod,
        Service: deleteService,
        Job: deleteJob,
        CronJob: deleteCronJob,
        ConfigMap: deleteConfigMap,
        Secret: deleteSecret,
        PersistentVolumeClaim: deletePersistentVolumeClaim,
        Ingress: deleteIngress,
        VolumeSnapshot: deleteVolumeSnapshot,
        ServiceMonitor: deleteServiceMonitor,
        PrometheusRule: deletePrometheusRule,
        Receiver: deleteReceiver,
        CustomResourceDefinition: deleteCRD,
        Repository: deleteRepository,
        Tenant: deleteTenant,
        User: deleteUser,
        Project: deleteProject,
        Environment: deleteEnvironment,
        Certificate: deleteCertificate,
        Issuer: deleteIssuer,
        AuthorizationPolicy: deleteIstioAuthorizationPolicy,
        Gateway: deleteIstioGateway,
        PeerAuthentication: deleteIstioPeerAuthentication,
        ServiceEntry: deleteIstioServiceEntry,
        Sidecar: deleteIstioSidecar,
      },
    }
  },
  computed: {
    ...mapState(['AdminViewport', 'NamespaceFilter']),
    ...mapGetters(['Cluster', 'Environment']),
    ThisCluster() {
      return this.AdminViewport
        ? this.Cluster().ClusterName || ''
        : this.Environment().ClusterName || ''
    },
    ThisNamespace() {
      return this.AdminViewport
        ? this.NamespaceFilter && this.NamespaceFilter.Namespace
          ? this.NamespaceFilter.Namespace
          : '_all'
        : this.Environment().Namespace || ''
    },
    ThisClusterID() {
      return this.AdminViewport
        ? this.Cluster().ID || ''
        : this.Environment().ClusterID || ''
    },
    ThisAppEnvironmentID() {
      let EnvironmentID = null
      if (this.Environment().ID > 0) {
        EnvironmentID = this.Environment().ID
      }
      return EnvironmentID
    },
  },
  methods: {
    sortBy(names) {
      if (names.length > 0) {
        this.sortparam['name'] = names[0]
        this.sortparam['desc'] = null
      } else this.sortparam['name'] = null
    },
    sortDesc(descs) {
      if (descs.length > 0) {
        this.sortparam['desc'] = descs[0]
      } else {
        this.sortparam['desc'] = null
      }
    },
    generateResourceSortParamValue() {
      if (this.sortparam.name === 'Name') {
        return `name${this.sortparam.desc ? 'Desc' : 'Asc'}`
      } else if (this.sortparam.name === 'CreateAt') {
        return `createTime${this.sortparam.desc ? 'Desc' : 'Asc'}`
      } else if (this.sortparam.name === 'Age') {
        return `createTime${this.sortparam.desc ? 'Desc' : 'Asc'}`
      } else if (this.sortparam.name === 'Status') {
        return `status${this.sortparam.desc ? 'Desc' : 'Asc'}`
      } else if (this.sortparam.name === 'AppName') {
        return `name${this.sortparam.desc ? 'Desc' : 'Asc'}`
      } else if (this.sortparam.name === 'CreatedAt') {
        return `createTime${this.sortparam.desc ? 'Desc' : 'Asc'}`
      }
      return null
    },
    async tenantResourceQuota(ClusterName, TenantName) {
      const data = await getTenantResourceQuota(ClusterName, TenantName, {
        noprocessing: true,
      })
      if (data.spec.hard && data.status.allocated) {
        const item = {
          Cpu: parseFloat(sizeOfCpu(data.spec.hard['limits.cpu'])),
          Memory: parseFloat(sizeOfStorage(data.spec.hard['limits.memory'])),
          Storage: parseFloat(
            sizeOfStorage(data.spec.hard[`requests.storage`]),
          ),
          Pod: 5120,
          AllocatedCpu: parseFloat(
            sizeOfCpu(data.status.allocated['limits.cpu']),
          ),
          AllocatedMemory: parseFloat(data.status.allocated['limits.memory']),
          AllocatedStorage: parseFloat(
            sizeOfStorage(data.status.allocated[`requests.storage`]),
          ),
          AllocatedPod: 0,
          ApplyCpu:
            parseFloat(sizeOfCpu(data.spec.hard['limits.cpu'])) -
            parseFloat(sizeOfCpu(data.status.allocated['limits.cpu'])),
          ApplyMemory:
            parseFloat(sizeOfStorage(data.spec.hard['limits.memory'])) -
            parseFloat(data.status.allocated['limits.memory']),
          ApplyStorage:
            parseFloat(sizeOfStorage(data.spec.hard[`requests.storage`])) -
            parseFloat(
              sizeOfStorage(data.status.allocated[`requests.storage`]),
            ),
          ApplyPod: 0,
        }
        return item
      }
      return null
    },
    async clusterQuota(clusterid, item) {
      const data = await getClusterQuota(clusterid, {
        noprocessing: true,
      })
      const quota = {}
      if (data.resources) {
        quota.CpuRatio = data.oversoldConfig ? data.oversoldConfig.cpu : 1
        quota.MemoryRatio = data.oversoldConfig ? data.oversoldConfig.memory : 1
        quota.StorageRatio = data.oversoldConfig
          ? data.oversoldConfig.storage
          : 1
        quota.Cpu =
          parseFloat(sizeOfCpu(data.resources.capacity.cpu)) * quota.CpuRatio
        quota.UsedCpu = parseFloat(
          sizeOfCpu(data.resources.tenantAllocated['limits.cpu']),
        )
        quota.AllocatedCpu = quota.Cpu - quota.UsedCpu + item.NowCpu
        quota.Memory =
          parseFloat(sizeOfStorage(data.resources.capacity.memory)) *
          quota.MemoryRatio
        quota.UsedMemory = parseFloat(
          sizeOfStorage(data.resources.tenantAllocated['limits.memory']),
        )
        quota.AllocatedMemory = quota.Memory - quota.UsedMemory + item.NowMemory
        quota.Storage =
          parseFloat(
            sizeOfStorage(data.resources.capacity['ephemeral-storage']),
          ) * quota.StorageRatio
        quota.UsedStorage = parseFloat(
          sizeOfStorage(data.resources.tenantAllocated['requests.storage']),
        )
        quota.AllocatedStorage =
          quota.Storage - quota.UsedStorage + item.NowStorage
        return quota
      }
      return null
    },
    checkDataWithNS(data, ns) {
      if (!(data && data.metadata)) {
        this.$store.commit('SET_SNACKBAR', {
          text: '缺少元数据',
          color: 'warning',
        })
        return false
      }
      if (!data.metadata.name) {
        this.$store.commit('SET_SNACKBAR', {
          text: '缺少名称',
          color: 'warning',
        })
        return false
      }
      if (!data.metadata.namespace) {
        data.metadata.namespace = ns
      }
      return true
    },
    addNsToData(data, ns) {
      if (!data.metadata.namespace) {
        data.metadata.namespace = ns
      }
    },
    checkDataWithOutNS(data) {
      if (!(data && data.metadata)) {
        this.$store.commit('SET_SNACKBAR', {
          text: '缺少元数据',
          color: 'warning',
        })
        return false
      }
      if (!data.metadata.name) {
        this.$store.commit('SET_SNACKBAR', {
          text: '缺少名称',
          color: 'warning',
        })
        return false
      }
      return true
    },
    checkManifestCompleteness(djson) {
      if (djson.kind === 'PersistentVolumeClaim') {
        if (
          !djson.spec.storageClassName ||
          (djson.spec.storageClassName && djson.spec.storageClassName === '')
        ) {
          return false
        }
      } else if (djson.kind === 'Ingress') {
        if (
          !djson.spec.ingressClassName ||
          (djson.spec.ingressClassName && djson.spec.ingressClassName === '')
        ) {
          return false
        }
      }
      return true
    },
    beautifyData(data) {
      const newdata = {}
      for (var item in data) {
        if (data[item] === null) continue
        if (
          ['pause', 'selfSigned'].indexOf(item) > -1 &&
          JSON.stringify(data[item]) === '{}'
        ) {
          newdata[item] = {}
        }
        if (JSON.stringify(data[item]) === '[]') continue
        if (data[item] === '') continue
        if (typeof data[item] === 'string') {
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
            newdata[item] = parseFloat(data[item])
          } else {
            if (data[item] === 'true') {
              newdata[item] = true
            } else if (data[item] === 'false') {
              newdata[item] = false
            } else {
              newdata[item] = data[item]
            }
          }
        } else if (data[item] instanceof Array) {
          if (
            ['env', 'command', 'args', 'finalizers', 'managedFields'].indexOf(
              item,
            ) > -1
          ) {
            newdata[item] = data[item]
          } else {
            newdata[item] = []
            data[item].forEach((d) => {
              if (typeof d === 'object') {
                newdata[item].push(this.beautifyData(d))
              } else {
                newdata[item].push(d)
              }
            })
          }
        } else if (data[item] instanceof Object) {
          if (JSON.stringify(data[item]) === '{}') continue
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
            ].indexOf(item) === -1
          ) {
            newdata[item] = this.beautifyData(data[item])
          } else {
            newdata[item] = data[item]
          }
        } else {
          newdata[item] = data[item]
        }
      }
      return newdata
    },
    getPodStatus(podItem) {
      /*
      根据pod生命周期，pod的生命周期分为 Pending, Running, Succeeded, Failed, Unknow 五个大状态
      容器又分为三种大状态 Waiting, Running, Terminated
      以上，容器真实状态判断函数如下
      */
      if (podItem.metadata.deletionTimestamp) {
        return 'Terminating'
      }
      if (!podItem.status.containerStatuses) {
        return podItem.status.reason
          ? podItem.status.reason
          : podItem.status.phase
      }
      let st = 'Running'
      podItem.status.containerStatuses.forEach((con) => {
        if (con.state.waiting) {
          st = con.state.waiting.reason
        } else if (con.state.terminated) {
          st = con.state.terminated.reason
        }
      })
      return st
    },
    getWorkloadStatus(kind, item) {
      if (!item) return ''
      if (kind !== 'DaemonSet') {
        if (
          (item.status.availableReplicas || item.status.readyReplicas || 0) <
          item.spec.replicas
        ) {
          return 'pending'
        } else {
          return 'ready'
        }
      } else {
        if (
          (item.status.numberReady || 0) < item.status.currentNumberScheduled
        ) {
          return 'pending'
        } else {
          return 'ready'
        }
      }
    },
    batchRemoveResource(title, resourceType, listFunc) {
      if (
        Object.values(this.batchResources).filter((c) => {
          return c.checked
        }).length === 0
      ) {
        this.$store.commit('SET_SNACKBAR', {
          text: `请勾选${title}`,
          color: 'warning',
        })
        return
      }
      this.$store.commit('SET_CONFIRM', {
        title: `删除${title}`,
        content: {
          text: `${Object.values(this.batchResources)
            .filter((c) => {
              return c.checked
            })
            .map((c) => {
              return c.name
            })
            .join(',')}`,
          type: 'batch_delete',
          status: {},
        },
        param: {},
        doFunc: async () => {
          const resources = Object.values(this.batchResources)
          for (const index in resources) {
            const resource = resources[index]
            if (resource.checked) {
              try {
                await this.resourceRemoveFunc[resourceType](
                  this.ThisCluster,
                  resource.namespace,
                  resource.name,
                )
                this.$store.commit('SET_CONFIRM_STATUS', {
                  key: resource.name,
                  value: true,
                })
              } catch {
                this.$store.commit('SET_CONFIRM_STATUS', {
                  key: resource.name,
                  value: false,
                })
              }
            }
          }
          listFunc()
        },
      })
    },
    batchRemoveNotK8SResource(title, resourceType, listFunc) {
      if (
        Object.values(this.batchResources).filter((c) => {
          return c.checked
        }).length === 0
      ) {
        this.$store.commit('SET_SNACKBAR', {
          text: `请勾选${title}`,
          color: 'warning',
        })
        return
      }
      this.$store.commit('SET_CONFIRM', {
        title: `删除${title}`,
        content: {
          text: `${Object.values(this.batchResources)
            .filter((c) => {
              return c.checked
            })
            .map((c) => {
              return c.name
            })
            .join(',')}`,
          type: 'batch_delete',
          status: {},
        },
        param: {},
        doFunc: async () => {
          for (const id in this.batchResources) {
            if (this.batchResources[id].checked) {
              const deleteObj = {}
              this.$set(
                deleteObj,
                this.batchResources[id]['deleteKey'],
                this.batchResources[id]['deleteValue'],
              )
              try {
                await this.resourceRemoveFunc[resourceType](deleteObj)
                this.$store.commit('SET_CONFIRM_STATUS', {
                  key: this.batchResources[id].name,
                  value: true,
                })
              } catch {
                this.$store.commit('SET_CONFIRM_STATUS', {
                  key: this.batchResources[id].name,
                  value: false,
                })
              }
            }
          }
          listFunc()
        },
      })
    },
    generateSelectResource() {
      this.batchResources = {}
      this.items.forEach((resource, index) => {
        const key = `${resource.metadata.name}-${index}`
        this.$set(this.batchResources, key, {
          name: resource.metadata.name,
          namespace: resource.metadata.namespace,
          checked: false,
        })
      })
    },
    generateSelectResourceNoK8s(deleteKey, valueKey) {
      this.batchResources = {}
      this.items.forEach((resource) => {
        this.$set(this.batchResources, resource.ID, {
          name: resource.name,
          deleteKey: deleteKey,
          deleteValue: resource[valueKey],
          checked: false,
        })
      })
    },
    onResourceChange(checked, item, index) {
      const key = `${item.metadata.name}-${index}`
      this.$set(this.batchResources, key, {
        name: item.metadata.name,
        namespace: item.metadata.namespace,
        checked: checked,
      })
    },
    onNotK8SResourceChange(checked, item, deleteKey, valueKey) {
      this.$set(this.batchResources, item.ID, {
        name: item.name,
        checked: checked,
        deleteKey: deleteKey,
        deleteValue: item[valueKey],
      })
    },
    onResourceToggleSelect(checkObj) {
      this.items.forEach((resource, index) => {
        const key = `${resource.metadata.name}-${index}`
        this.batchResources[key] = {
          name: resource.metadata.name,
          namespace: resource.metadata.namespace,
          checked: checkObj.value,
        }
      })
    },
    onNotK8SResourceToggleSelect(checkObj, deleteKey, valueKey) {
      this.items.forEach((resource) => {
        this.batchResources[resource.ID] = {
          name: resource.name,
          checked: checkObj.value,
          deleteKey: deleteKey,
          deleteValue: resource[valueKey],
        }
      })
    },
    generateParams() {
      Object.assign(
        Object.assign(this.params, { noprocessing: false }),
        convertStrToNum(this.$route.query),
      )
    },
    validateJsonSchema(schema, data) {
      const ajv = new Ajv()
      const validate = ajv.compile(schema)
      const valid = validate(data)
      if (!valid) {
        this.$store.commit('SET_SNACKBAR', {
          text: `不是正确的K8S yaml格式，请补充必要字段或填写正确的数据格式，错误提示：${validate.errors
            .map((err) => {
              return `路径${err.instancePath} ${err.message}`
            })
            .join(',')}`,
          color: 'warning',
        })
        return false
      }
      return true
    },
  },
}

export default resource
