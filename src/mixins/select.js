import { mapGetters, mapState } from 'vuex';

import {
  appSelectData,
  clusterSelectData,
  environmentSelectData,
  gatewaySelectData,
  getDaemonSetList,
  getDeploymentList,
  getStatefulSetList,
  issuerSelectData,
  namespaceSelectData,
  projectEnvironmentSelectData,
  projectRegistrySelectData,
  projectSelectData,
  registrySelectData,
  secretSelectData,
  serviceSelectData,
  storageClassSelectData,
  tenantClusterSelectData,
  tenantEnvironmentSelectData,
  tenantProjectSelectData,
  tenantSelectData,
  tenantUserSelectData,
  userSelectData,
  userTenantSelectData,
  virtualSpaceEnvironmentSelectData,
  virtualSpaceSelectData,
} from '@/api';

const select = {
  data() {
    return {
      m_select_clusterItems: [],
      m_select_userItems: [],
      m_select_environmentItems: [],
      m_select_systemRoleItems: [],
      m_select_namespaceItems: [],
      m_select_tenantItems: [],
      m_select_tenantUserItems: [],
      m_select_tenantProjectItems: [],
      m_select_tenantClusterItems: [],
      m_select_projectEnvironmentItems: [],
      m_select_storageClassItems: [],
      m_select_workloadSelectItems: [],
      m_select_secretItems: [],
      m_select_serviceItems: [],
      m_select_issuerItems: [],
      m_select_gatewayItems: [],
      m_select_projectItems: [],
      m_select_registryItems: [],
      m_select_virtualSpaceItems: [],
      m_select_virtualSpaceEnvironmentItems: [],
      m_select_appItems: [],
    };
  },
  computed: {
    ...mapState(['Admin', 'User', 'AdminViewport']),
    ...mapGetters(['Project', 'Environment', 'Cluster', 'Tenant']),
    m_select_environmentTypeItems() {
      return [
        { text: this.$root.$t('environment_type.dev'), value: 'dev' },
        { text: this.$root.$t('environment_type.test'), value: 'test' },
        { text: this.$root.$t('environment_type.prod'), value: 'prod' },
      ];
    },
    m_select_resourceItems() {
      return [
        { text: this.$root.$t('resource.service'), value: 'Service' },
        { text: this.$root.$t('resource.configmap'), value: 'ConfigMap' },
        { text: this.$root.$t('resource.secret'), value: 'Secret' },
        { text: this.$root.$t('resource.persistentvolumeclaim'), value: 'PersistentVolumeClaim' },
        { text: this.$root.$t('resource.job'), value: 'Job' },
        { text: this.$root.$t('resource.cronjob'), value: 'CronJob' },
        { text: this.$root.$t('resource.ingress'), value: 'Ingress' },
      ];
    },
  },
  methods: {
    async m_select_userSelectData() {
      const data = await userSelectData({ noprocessing: true });
      const userSelect = [];
      data.List.forEach((user) => {
        userSelect.push({ text: user.Username, value: user.ID });
      });
      this.m_select_userItems = userSelect;
    },
    async m_select_tenantSelectData() {
      let data = {};
      if (this.Admin) {
        data = await tenantSelectData({ noprocessing: true });
      } else {
        data = await userTenantSelectData(this.User.ID, {
          noprocessing: true,
        });
      }
      const tenantSelect = [];
      data.List.forEach((tenant) => {
        if (this.Admin) {
          tenantSelect.push({
            text:
              tenant.Clusters && tenant.Clusters.length > 0
                ? tenant.TenantName
                : `${tenant.TenantName} (${this.$root.$t('tip.not_allocate_resource')})`,
            value: tenant.ID,
            isActive: tenant.IsActive,
            disabled: !(tenant.Clusters && tenant.Clusters.length > 0),
          });
        } else {
          tenantSelect.push({
            text: tenant.ResourceQuotas
              ? tenant.TenantName
              : `${tenant.TenantName} (${this.$root.$t('tip.not_allocate_resource')})`,
            value: tenant.ID,
            isActive: tenant.IsActive,
            disabled: !tenant.ResourceQuotas,
          });
        }
      });
      this.m_select_tenantItems = tenantSelect;
    },
    async m_select_tenantClusterSelectData(TenantID) {
      const data = await tenantClusterSelectData(TenantID, {
        noprocessing: true,
      });
      const tenantClusterSelect = [];
      data.List.forEach((tenant) => {
        tenantClusterSelect.push({
          text: tenant.Cluster.ClusterName,
          value: tenant.Cluster.ID,
        });
      });
      this.m_select_tenantClusterItems = tenantClusterSelect;
    },
    async m_select_tenantUserSelectData() {
      const data = await tenantUserSelectData(this.Tenant().ID, {
        noprocessing: true,
      });
      const tenantUserSelect = [];
      data.List.forEach((user) => {
        tenantUserSelect.push({ text: user.Username, value: user.ID });
      });
      this.m_select_tenantUserItems = tenantUserSelect;
    },
    async m_select_tenantProjectSelectData() {
      const data = await tenantProjectSelectData(this.Tenant().ID, {
        noprocessing: true,
      });
      const tenantProjectSelect = [];
      data.List.forEach((p) => {
        tenantProjectSelect.push({
          text: p.ProjectName,
          value: p.ID,
          tenantName: p.Tenant.TenantName,
          tenantID: p.Tenant.ID,
          projectTenant: `${p.ProjectName}(${p.Tenant.TenantName})`,
        });
      });
      this.m_select_tenantProjectItems = tenantProjectSelect;
    },
    async m_select_projectEnvironmentSelectData(
      projectid,
      virtualspace = false,
      containNSLabels = false,
      noprocessing = true,
    ) {
      if (!projectid) {
        return;
      }
      const data = await projectEnvironmentSelectData(projectid, {
        containNSLabels: containNSLabels || null,
        noprocessing: noprocessing,
      });
      const projectEnvironmentSelect = [];
      data.List.forEach((ns) => {
        projectEnvironmentSelect.push({
          text:
            ns.VirtualSpaceID > 0 && virtualspace
              ? `${ns.EnvironmentName}(${this.$root.$t('tip.in_virtualspace')})`
              : ns.EnvironmentName,
          value: ns.ID,
          environmentName: ns.EnvironmentName,
          clusterName: ns.Cluster.ClusterName,
          version: ns.Cluster.Version,
          namespace: ns.Namespace,
          clusterid: ns.ClusterID,
          type: ns.MetaType,
          projectid: projectid,
          projectName: ns.Project.ProjectName,
          disabled: ns.VirtualSpaceID > 0 && virtualspace,
          nsLabels: ns.NSLabels,
        });
      });
      this.m_select_projectEnvironmentItems = projectEnvironmentSelect;
    },
    async m_select_clusterSelectData(TenantID = null, noprocessing = true) {
      let data = null;
      if (this.Admin && !TenantID) {
        data = await clusterSelectData({ noprocessing: noprocessing });
      } else {
        if (TenantID) {
          data = await tenantClusterSelectData(TenantID, { noprocessing: noprocessing });
        } else {
          data = await tenantClusterSelectData(this.Tenant().ID, {
            noprocessing: noprocessing,
          });
        }
        data.List.forEach((n) => {
          n.ClusterName = n.Cluster.ClusterName;
          n.Version = n.Cluster.Version;
          n.ID = n.ClusterID;
        });
      }
      const clusterSelect = [];
      data.List.forEach((ns) => {
        clusterSelect.push({
          text: ns.ClusterName,
          value: ns.ID,
          version: ns.Version,
        });
      });
      this.m_select_clusterItems = clusterSelect;
    },
    async m_select_namespaceSelectData(Cluster, params = { noprocessing: false }) {
      if (!Cluster) {
        this.$store.commit('SET_SNACKBAR', {
          text: this.$root.$t('tip.select_cluster'),
          color: 'warning',
        });
        return;
      }
      const data = await namespaceSelectData(
        Cluster,
        Object.assign(
          {
            size: 200,
          },
          params,
        ),
      );
      const namespaceSelect = [];
      data.List.forEach((ns) => {
        namespaceSelect.push({
          text: ns.metadata.name,
          value: ns.metadata.name,
        });
      });
      this.m_select_namespaceItems = namespaceSelect;
    },
    async m_select_environmentSelectData(TenantID = null, noprocessing = true) {
      let data = null;
      if (this.Admin && this.AdminViewport && !TenantID) {
        data = await environmentSelectData({ noprocessing: noprocessing });
      } else {
        if (TenantID) {
          data = await tenantEnvironmentSelectData(TenantID, {
            noprocessing: noprocessing,
          });
        } else {
          data = await tenantEnvironmentSelectData(this.Tenant().ID, {
            noprocessing: noprocessing,
          });
        }
      }
      this.m_select_environmentItems = [];
      if (data) {
        data.List.forEach((e) => {
          this.m_select_environmentItems.push({
            text: e.EnvironmentName,
            value: e.Namespace,
            clusterName: e.Cluster.ClusterName,
            projectName: e.Project.ProjectName,
          });
        });
      }
    },
    async m_select_storageClassSelectData(Cluster, params = { noprocessing: false }) {
      if (!Cluster) {
        this.$store.commit('SET_SNACKBAR', {
          text: this.$root.$t('tip.select_cluster'),
          color: 'warning',
        });
        return;
      }
      const data = await storageClassSelectData(Cluster, params);
      const storageClassSelect = [];
      data.List.forEach((sc) => {
        storageClassSelect.push({
          text: sc.metadata.name,
          value: sc.metadata.name,
          storageClass: sc,
        });
      });
      this.m_select_storageClassItems = storageClassSelect;
    },
    async m_select_workloadSelectData(Cluster, Namespace) {
      if (!Cluster) {
        this.$store.commit('SET_SNACKBAR', {
          text: this.$root.$t('tip.select_cluster'),
          color: 'warning',
        });
        return;
      }
      let data = [];
      const ds = await getDaemonSetList(Cluster, Namespace, {
        size: 1000,
      });
      const deploy = await getDeploymentList(Cluster, Namespace, {
        size: 1000,
      });
      const sts = await getStatefulSetList(Cluster, Namespace, {
        size: 1000,
      });
      data = data.concat(ds.List).concat(deploy.List).concat(sts.List);
      const workloadSelect = [];
      data.forEach((workload, index) => {
        let selector = {};
        if (workload?.spec?.template?.metadata?.labels) {
          selector = workload.spec.template.metadata.labels;
          if (Object.prototype.hasOwnProperty.call(selector, 'version')) {
            delete selector['version'];
          }
          workloadSelect.push({
            text: workload.metadata.name,
            labels: selector,
            value: index,
          });
        }
      });
      this.m_select_workloadSelectItems = workloadSelect;
    },
    async m_select_secretSelectData(Cluster, Namespace, type = null) {
      if (!Cluster) {
        this.$store.commit('SET_SNACKBAR', {
          text: this.$root.$t('tip.select_cluster'),
          color: 'warning',
        });
        return;
      }
      if (!Namespace) {
        this.$store.commit('SET_SNACKBAR', {
          text: this.$root.$t('tip.select_namespace'),
          color: 'warning',
        });
        return;
      }
      const data = await secretSelectData(Cluster, Namespace);
      const secretSelect = [];
      if (type) {
        data.List = data.List.filter((d) => {
          return d.type === type;
        });
      }
      data.List.forEach((s) => {
        secretSelect.push({
          text: s.metadata.name,
          value: s.metadata.name,
        });
      });
      this.m_select_secretItems = secretSelect;
    },
    async m_select_serviceSelectData(Cluster, Namespace) {
      if (!Cluster) {
        this.$store.commit('SET_SNACKBAR', {
          text: this.$root.$t('tip.select_cluster'),
          color: 'warning',
        });
        return;
      }
      if (!Namespace) {
        this.$store.commit('SET_SNACKBAR', {
          text: this.$root.$t('tip.select_namespace'),
          color: 'warning',
        });
        return;
      }
      const data = await serviceSelectData(Cluster, Namespace);
      const serviceSelect = [];
      data.List.forEach((s) => {
        const ports = [];
        const portNames = [];
        if (s.spec.ports) {
          s.spec.ports.forEach((p) => {
            ports.push({ text: p.port, value: p.port });
          });
          s.spec.ports.forEach((p) => {
            portNames.push({ text: p.name, value: p.name });
          });
          serviceSelect.push({
            text: s.metadata.name,
            value: s.metadata.name,
            ports: ports,
            portNames: portNames,
            labels: s.metadata.labels,
          });
        }
      });
      this.m_select_serviceItems = serviceSelect;
    },
    async m_select_issuerSelectData(Cluster, Namespace) {
      if (!Cluster) {
        this.$store.commit('SET_SNACKBAR', {
          text: this.$root.$t('tip.select_cluster'),
          color: 'warning',
        });
        return;
      }
      if (!Namespace) {
        this.$store.commit('SET_SNACKBAR', {
          text: this.$root.$t('tip.select_namespace'),
          color: 'warning',
        });
        return;
      }
      const data = await issuerSelectData(Cluster, Namespace, {
        noprocessing: true,
      });
      const issuerSelect = [];
      data.List.forEach((i) => {
        issuerSelect.push({
          text: i.metadata.name,
          value: i.metadata.name,
          labels: i.metadata.labels,
        });
      });
      this.m_select_issuerItems = issuerSelect;
    },
    async m_select_gatewaySelectData(Cluster) {
      if (!Cluster) {
        this.$store.commit('SET_SNACKBAR', {
          text: this.$root.$t('tip.select_cluster'),
          color: 'warning',
        });
        return;
      }
      const data = await gatewaySelectData(
        this.Tenant().ID,
        this.AdminViewport ? this.Cluster().ID : this.Environment().ClusterID,
      );
      const gatewaySelect = [];
      data.forEach((ns) => {
        gatewaySelect.push({
          text: ns.metadata.name,
          value: ns.spec.ingressClass,
          baseDomain: ns.spec.baseDomain,
        });
      });
      this.m_select_gatewayItems = gatewaySelect;
    },
    async m_select_projectSelectData(tenantId = null, noprocessing = false) {
      let data = null;
      if (this.Admin && this.AdminViewport) {
        data = await projectSelectData({ noprocessing: noprocessing });
      } else {
        data = await tenantProjectSelectData(tenantId || this.Tenant().ID, {
          noprocessing: noprocessing,
        });
      }
      const projectSelect = [];
      data.List.forEach((p) => {
        projectSelect.push({
          text: this.Admin ? `租户${p.Tenant.TenantName} - 项目${p.ProjectName}` : p.ProjectName,
          value: p.ID,
          projectName: p.ProjectName,
          tenantName: p.Tenant.TenantName,
          tenantID: p.Tenant.ID,
        });
      });
      this.m_select_projectItems = projectSelect;
    },
    async m_select_registrySelectData() {
      let data = null;
      if (this.AdminViewport) {
        data = await registrySelectData();
      } else {
        data = await projectRegistrySelectData(this.Project().ID);
      }
      const registrySelect = [];
      data.List.forEach((r) => {
        registrySelect.push({
          text: r.RegistryAddress,
          value: r.RegistryName,
        });
      });
      this.m_select_registryItems = registrySelect;
    },
    async m_select_virtualSpaceSelectData() {
      const data = await virtualSpaceSelectData({ noprocessing: true });
      const virtualSpaceSelect = [];
      data.List.forEach((r) => {
        virtualSpaceSelect.push({
          text: r.VirtualSpaceName,
          value: r.ID,
        });
      });
      this.m_select_virtualSpaceItems = virtualSpaceSelect;
    },
    async m_select_virtualSpaceEnvironmentSelectData(virtualspaceid) {
      const data = await virtualSpaceEnvironmentSelectData(virtualspaceid, {
        noprocessing: true,
      });
      const virtualSpaceEnvironmentSelect = [];
      data.List.forEach((r) => {
        virtualSpaceEnvironmentSelect.push({
          text: r.EnvironmentName,
          value: r.ID,
          namespace: r.Namespace,
          cluster: r.Cluster.ClusterName,
          clusterid: r.Cluster.ID,
        });
      });
      this.m_select_virtualSpaceEnvironmentItems = virtualSpaceEnvironmentSelect;
    },
    async m_select_appSelectData(tenantid, projectid, environmentid) {
      if (!projectid) {
        return;
      }
      if (!environmentid) {
        return;
      }
      const data = await appSelectData(tenantid, projectid, environmentid);
      const appSelect = [];
      data.List.forEach((r) => {
        appSelect.push({
          text: r.name,
          value: r.name,
        });
      });
      this.m_select_appItems = appSelect;
    },
  },
};

export default select;
