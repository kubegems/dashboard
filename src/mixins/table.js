import { mapGetters, mapState } from 'vuex'
import { convertStrToNum } from '@/utils/helpers'
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

const table = {
  data() {
    return {
      m_table_sortparam: { name: null, desc: false },
      m_table_batchResources: {},
      m_table_resourceRemoveFunc: {
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
  },
  methods: {
    m_table_sortBy(names) {
      if (names.length > 0) {
        this.m_table_sortparam['name'] = names[0]
        this.m_table_sortparam['desc'] = null
      } else this.m_table_sortparam['name'] = null
    },
    m_table_sortDesc(descs) {
      if (descs.length > 0) {
        this.m_table_sortparam['desc'] = descs[0]
      } else {
        this.m_table_sortparam['desc'] = null
      }
    },
    m_table_generateResourceSortParamValue() {
      if (this.m_table_sortparam.name === 'Name') {
        return `name${this.m_table_sortparam.desc ? 'Desc' : 'Asc'}`
      } else if (this.m_table_sortparam.name === 'CreateAt') {
        return `createTime${this.m_table_sortparam.desc ? 'Desc' : 'Asc'}`
      } else if (this.m_table_sortparam.name === 'Age') {
        return `createTime${this.m_table_sortparam.desc ? 'Desc' : 'Asc'}`
      } else if (this.m_table_sortparam.name === 'Status') {
        return `status${this.m_table_sortparam.desc ? 'Desc' : 'Asc'}`
      } else if (this.m_table_sortparam.name === 'AppName') {
        return `name${this.m_table_sortparam.desc ? 'Desc' : 'Asc'}`
      } else if (this.m_table_sortparam.name === 'CreatedAt') {
        return `createTime${this.m_table_sortparam.desc ? 'Desc' : 'Asc'}`
      }
      return null
    },
    m_table_batchRemoveResource(title, resourceType, listFunc) {
      if (
        Object.values(this.m_table_batchResources).filter((c) => {
          return c.checked
        }).length === 0
      ) {
        this.$store.commit('SET_SNACKBAR', {
          text: `请勾选${title}`,
          color: 'warning',
        })
        return
      }
      const resources = Object.values(this.m_table_batchResources)
        .filter((c) => {
          return c.checked
        })
        .map((c) => {
          return c.name
        })
      this.$store.commit('SET_CONFIRM', {
        title: `批量删除${title}`,
        content: {
          text: `${resources.join(',')}`,
          type: 'batch_delete',
          one: resources.length === 1 ? resources[0] : undefined,
          status: {},
        },
        param: {},
        doFunc: async () => {
          const resources = Object.values(this.m_table_batchResources)
          for (const index in resources) {
            const resource = resources[index]
            if (resource.checked) {
              try {
                await this.m_table_resourceRemoveFunc[resourceType](
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
    m_table_batchRemoveNotK8SResource(title, resourceType, listFunc) {
      if (
        Object.values(this.m_table_batchResources).filter((c) => {
          return c.checked
        }).length === 0
      ) {
        this.$store.commit('SET_SNACKBAR', {
          text: `请勾选${title}`,
          color: 'warning',
        })
        return
      }
      const resources = Object.values(this.m_table_batchResources)
        .filter((c) => {
          return c.checked
        })
        .map((c) => {
          return c.name
        })
      this.$store.commit('SET_CONFIRM', {
        title: `批量删除${title}`,
        content: {
          text: `${resources.join(',')}`,
          type: 'batch_delete',
          one: resources.length === 1 ? resources[0] : undefined,
          status: {},
        },
        param: {},
        doFunc: async () => {
          for (const id in this.m_table_batchResources) {
            if (this.m_table_batchResources[id].checked) {
              try {
                await this.m_table_resourceRemoveFunc[resourceType](this.m_table_batchResources[id]['value'])
                this.$store.commit('SET_CONFIRM_STATUS', {
                  key: this.m_table_batchResources[id].name,
                  value: true,
                })
              } catch {
                this.$store.commit('SET_CONFIRM_STATUS', {
                  key: this.m_table_batchResources[id].name,
                  value: false,
                })
              }
            }
          }
          listFunc()
        },
      })
    },
    m_table_generateSelectResource() {
      this.m_table_batchResources = {}
      this.items.forEach((resource, index) => {
        const key = `${resource.metadata.name}-${index}`
        this.$set(this.m_table_batchResources, key, {
          name: resource.metadata.name,
          namespace: resource.metadata.namespace,
          checked: false,
        })
      })
    },
    m_table_generateSelectResourceNoK8s(valueKey) {
      this.m_table_batchResources = {}
      this.items.forEach((resource) => {
        this.$set(this.m_table_batchResources, resource.ID, {
          name: resource.name,
          value: resource[valueKey],
          checked: false,
        })
      })
    },
    m_table_onResourceChange(checked, item, index) {
      const key = `${item.metadata.name}-${index}`
      this.$set(this.m_table_batchResources, key, {
        name: item.metadata.name,
        namespace: item.metadata.namespace,
        checked: checked,
      })
    },
    m_table_onNotK8SResourceChange(checked, item, valueKey) {
      this.$set(this.m_table_batchResources, item.ID, {
        name: item.name,
        checked: checked,
        value: item[valueKey],
      })
    },
    m_table_onResourceToggleSelect(checkObj) {
      this.items.forEach((resource, index) => {
        const key = `${resource.metadata.name}-${index}`
        this.m_table_batchResources[key] = {
          name: resource.metadata.name,
          namespace: resource.metadata.namespace,
          checked: checkObj.value,
        }
      })
    },
    m_table_onNotK8SResourceToggleSelect(checkObj, valueKey) {
      this.items.forEach((resource) => {
        this.m_table_batchResources[resource.ID] = {
          name: resource.name,
          checked: checkObj.value,
          value: resource[valueKey],
        }
      })
    },
    m_table_generateParams() {
      Object.assign(
        Object.assign(this.params, { noprocessing: false }),
        convertStrToNum(this.$route.query),
      )
    },
  },
}

export default table
