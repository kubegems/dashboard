import { mapGetters, mapState } from 'vuex';

import {
  deleteCRD,
  deleteCertificate,
  deleteConfigMap,
  deleteCronJob,
  deleteDaemonSet,
  deleteDeployment,
  deleteEnvironment,
  deleteIngress,
  deleteIssuer,
  deleteIstioAuthorizationPolicy,
  deleteIstioGateway,
  deleteIstioPeerAuthentication,
  deleteIstioServiceEntry,
  deleteIstioSidecar,
  deleteJob,
  deletePersistentVolumeClaim,
  deletePod,
  deleteProject,
  deletePrometheusRule,
  deleteReceiver,
  deleteRepository,
  deleteSecret,
  deleteService,
  deleteServiceMonitor,
  deleteStatefulSet,
  deleteTenant,
  deleteUser,
  deleteVolumeSnapshot,
} from '@/api';
import { convertStrToNum } from '@/utils/helpers';

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
    };
  },
  computed: {
    ...mapState(['AdminViewport', 'NamespaceFilter']),
    ...mapGetters(['Cluster', 'Environment']),
  },
  methods: {
    m_table_sortBy(name) {
      if (name) {
        this.m_table_sortparam['name'] = name;
        this.m_table_sortparam['desc'] = null;
      } else this.m_table_sortparam['name'] = null;
    },
    m_table_sortDesc(desc) {
      if (desc) {
        this.m_table_sortparam['desc'] = desc;
      } else {
        this.m_table_sortparam['desc'] = null;
      }
    },
    m_table_generateResourceSortParamValue() {
      if (this.m_table_sortparam.name === 'name') {
        return `name${this.m_table_sortparam.desc ? 'Desc' : 'Asc'}`;
      } else if (this.m_table_sortparam.name === 'createAt') {
        return `createTime${this.m_table_sortparam.desc ? 'Desc' : 'Asc'}`;
      } else if (this.m_table_sortparam.name === 'age') {
        return `createTime${this.m_table_sortparam.desc ? 'Desc' : 'Asc'}`;
      } else if (this.m_table_sortparam.name === 'status') {
        return `status${this.m_table_sortparam.desc ? 'Desc' : 'Asc'}`;
      } else if (this.m_table_sortparam.name === 'appName') {
        return `name${this.m_table_sortparam.desc ? 'Desc' : 'Asc'}`;
      } else if (this.m_table_sortparam.name === 'createdAt') {
        return `createTime${this.m_table_sortparam.desc ? 'Desc' : 'Asc'}`;
      }
      return null;
    },
    m_table_batchRemoveResource(title, resourceType, listFunc) {
      if (
        Object.values(this.m_table_batchResources).filter((c) => {
          return c.checked;
        }).length === 0
      ) {
        this.$store.commit('SET_SNACKBAR', {
          text: this.$t('tip.batch_select_c', [title]),
          color: 'warning',
        });
        return;
      }
      const resources = Object.values(this.m_table_batchResources)
        .filter((c) => {
          return c.checked;
        })
        .map((c) => {
          return c.name;
        });
      this.$store.commit('SET_CONFIRM', {
        title: this.$t('operate.batch_delete_c', [title]),
        content: {
          text: `${resources.join(',')}`,
          type: 'batch_delete',
          one: resources.length === 1 ? resources[0] : undefined,
          status: {},
        },
        param: {},
        doFunc: async () => {
          const resources = Object.values(this.m_table_batchResources);
          for (const index in resources) {
            const resource = resources[index];
            if (resource.checked) {
              try {
                await this.m_table_resourceRemoveFunc[resourceType](
                  this.ThisCluster,
                  resource.namespace,
                  resource.name,
                );
                this.$store.commit('SET_CONFIRM_STATUS', {
                  key: resource.name,
                  value: true,
                });
              } catch {
                this.$store.commit('SET_CONFIRM_STATUS', {
                  key: resource.name,
                  value: false,
                });
              }
            }
          }
          listFunc();
        },
      });
    },
    m_table_batchRemoveNotK8SResource(title, resourceType, listFunc) {
      if (!Object.values(this.m_table_batchResources).some((c) => c.checked)) {
        this.$store.commit('SET_SNACKBAR', {
          text: this.$t('tip.batch_select_c', [title]),
          color: 'warning',
        });
        return;
      }
      const resources = Object.values(this.m_table_batchResources)
        .filter((c) => c.checked)
        .map((c) => c.name);
      this.$store.commit('SET_CONFIRM', {
        title: this.$t('operate.batch_delete_c', [title]),
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
                await this.m_table_resourceRemoveFunc[resourceType](this.m_table_batchResources[id]['value']);
                this.$store.commit('SET_CONFIRM_STATUS', {
                  key: this.m_table_batchResources[id].name,
                  value: true,
                });
              } catch {
                this.$store.commit('SET_CONFIRM_STATUS', {
                  key: this.m_table_batchResources[id].name,
                  value: false,
                });
              }
            }
          }
          listFunc();
        },
      });
    },
    m_table_generateSelectResource() {
      this.m_table_batchResources = {};
      this.items.forEach((resource, index) => {
        const key = `${resource.metadata.name}-${index}`;
        this.$set(this.m_table_batchResources, key, {
          name: resource.metadata.name,
          namespace: resource.metadata.namespace,
          checked: false,
        });
      });
    },
    m_table_generateSelectResourceNoK8s(valueKey) {
      this.m_table_batchResources = {};
      this.items.forEach((resource, index) => {
        this.$set(this.m_table_batchResources, resource.ID || index, {
          name: resource.name,
          value: resource[valueKey],
          checked: false,
        });
      });
    },
    m_table_onResourceChange(checked, item, index) {
      const key = `${item.metadata.name}-${index}`;
      this.$set(this.m_table_batchResources, key, {
        name: item.metadata.name,
        namespace: item.metadata.namespace,
        checked: checked,
      });
    },
    m_table_onNotK8SResourceChange(checked, item, valueKey, index = 0) {
      this.$set(this.m_table_batchResources, item.ID || index, {
        name: item.name,
        checked: checked,
        value: item[valueKey],
      });
    },
    m_table_onResourceToggleSelect(checkObj) {
      this.items.forEach((resource, index) => {
        const key = `${resource.metadata.name}-${index}`;
        this.m_table_batchResources[key] = {
          name: resource.metadata.name,
          namespace: resource.metadata.namespace,
          checked: checkObj.value,
        };
      });
    },
    m_table_onNotK8SResourceToggleSelect(checkObj, valueKey) {
      this.items.forEach((resource, index) => {
        this.m_table_batchResources[resource.ID || index] = {
          name: resource.name,
          checked: checkObj.value,
          value: resource[valueKey],
        };
      });
    },
    m_table_generateParams() {
      Object.assign(Object.assign(this.params, { noprocessing: false }), convertStrToNum(this.$route.query));
    },
  },
};

export default table;
