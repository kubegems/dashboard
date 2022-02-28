import { mapGetters, mapState } from 'vuex'
import {
  userSelectData,
  systemRoleSelectData,
  userTenantSelectData,
  tenantSelectData,
  tenantUserSelectData,
  tenantProjectSelectData,
  tenantClusterSelectData,
  projectEnvironmentSelectData,
  clusterSelectData,
  namespaceSelectData,
  tenantEnvironmentSelectData,
  environmentSelectData,
  storageClassSelectData,
  getDaemonSetList,
  getDeploymentList,
  getStatefulSetList,
  secretSelectData,
  serviceSelectData,
  issuerSelectData,
  gatewaySelectData,
  projectSelectData,
  projectRegistrySelectData,
  registrySelectData,
  virtualSpaceSelectData,
  virtualSpaceEnvironmentSelectData,
  appSelectData,
} from '@/api'

const select = {
  data() {
    return {
      clusterSelect: [],
      tenantRoleSelect: [
        { text: '租户管理员', value: 'admin' },
        { text: '普通用户', value: 'ordinary' },
      ],
      projectRoleSelect: [
        { text: '管理员', value: 'admin' },
        { text: '开发', value: 'dev' },
        { text: '测试', value: 'test' },
        { text: '运维', value: 'ops' },
      ],
      userSelect: [],
      environmentSelect: [],
      systemRoleSelect: [],
      namespaceSelect: [],
      tenantSelect: [],
      tenantUserSelect: [],
      tenantProjectSelect: [],
      tenantClusterSelect: [],
      projectEnvironmentSelect: [],
      environmentTypeSelect: [
        { text: '开发', value: 'dev' },
        { text: '测试', value: 'test' },
        { text: '生产', value: 'prod' },
      ],
      environmentRoleSelect: [
        { text: '只读成员', value: 'reader' },
        { text: '管理员', value: 'operator' },
      ],
      environmentPodUsageSelect: [
        { text: 'CPU平均使用量', value: 'cpuavg' },
        { text: 'CPU最大使用量', value: 'cpumax' },
        { text: '内存平均使用量', value: 'memoryavg' },
        { text: '内存最大使用量', value: 'memorymax' },
      ],
      storageClassSelect: [],
      workloadSelect: [],
      resourceQuotaSelect: [
        { value: 'count/deployments.apps', text: '无状态服务' },
        { value: 'count/statefulsets.apps', text: '有状态服务' },
        { value: 'count/daemonsets.apps', text: '守护进程服务' },
        { value: 'pods', text: '容器组' },
        { value: 'count/services', text: '服务' },
        { value: 'count/jobs.batch', text: '任务' },
        { value: 'count/cronjobs.batch', text: '定时任务' },
        { value: 'count/configmaps', text: '配置' },
        { value: 'count/secrets', text: '密钥' },
        { value: 'count/persistentvolumeclaims', text: '存储卷' },
      ],
      secretSelect: [],
      serviceSelect: [],
      issuerSelect: [],
      gatewaySelect: [],
      projectSelect: [],
      registrySelect: [],
      resourceSelect: [
        { text: '服务', value: 'Service' },
        { text: '配置', value: 'ConfigMap' },
        { text: '密钥', value: 'Secret' },
        { text: '存储卷', value: 'PersistentVolumeClaim' },
        { text: '任务', value: 'Job' },
        { text: '定时任务', value: 'CronJob' },
        { text: '路由', value: 'Ingress' },
      ],
      virtualSpaceSelect: [],
      virtualSpaceEnvironmentSelect: [],
      appSelect: [],
    }
  },
  computed: {
    ...mapState(['Admin', 'User', 'AdminViewport']),
    ...mapGetters(['Project', 'Environment', 'Cluster', 'Tenant']),
  },
  methods: {
    async userSelectData() {
      const data = await userSelectData({ noprocessing: true })
      const userSelect = []
      data.List.forEach((user) => {
        userSelect.push({ text: user.Username, value: user.ID })
      })
      this.userSelect = userSelect
    },
    async systemRoleSelectData() {
      const data = await systemRoleSelectData({ noprocessing: true })
      const systemRoleSelect = []
      data.List.forEach((role) => {
        systemRoleSelect.push({ text: role.RoleName, value: role.ID })
      })
      this.systemRoleSelect = systemRoleSelect
    },
    async tenantSelectData() {
      let data = {}
      if (this.Admin) {
        data = await tenantSelectData({ noprocessing: true })
      } else {
        data = await userTenantSelectData(this.User.ID, {
          noprocessing: true,
        })
      }
      const tenantSelect = []
      data.List.forEach((tenant) => {
        if (this.Admin) {
          tenantSelect.push({
            text:
              tenant.Clusters && tenant.Clusters.length > 0
                ? tenant.TenantName
                : `${tenant.TenantName} (租户未分配资源)`,
            value: tenant.ID,
            isActive: tenant.IsActive,
            disabled: !(tenant.Clusters && tenant.Clusters.length > 0),
          })
        } else {
          tenantSelect.push({
            text: tenant.ResourceQuotas
              ? tenant.TenantName
              : `${tenant.TenantName} (租户未分配资源)`,
            value: tenant.ID,
            isActive: tenant.IsActive,
            disabled: !tenant.ResourceQuotas,
          })
        }
      })
      this.tenantSelect = tenantSelect
    },
    async tenantClusterSelectData(TenantID) {
      const data = await tenantClusterSelectData(TenantID, {
        noprocessing: true,
      })
      const tenantClusterSelect = []
      data.List.forEach((tenant) => {
        tenantClusterSelect.push({
          text: tenant.Cluster.ClusterName,
          value: tenant.Cluster.ID,
        })
      })
      this.tenantClusterSelect = tenantClusterSelect
    },
    async tenantUserSelectData() {
      const data = await tenantUserSelectData(this.Tenant().ID, {
        noprocessing: true,
      })
      const tenantUserSelect = []
      data.List.forEach((user) => {
        tenantUserSelect.push({ text: user.Username, value: user.ID })
      })
      this.tenantUserSelect = tenantUserSelect
    },
    async tenantProjectSelectData() {
      const data = await tenantProjectSelectData(this.Tenant().ID, {
        noprocessing: true,
      })
      const tenantProjectSelect = []
      data.List.forEach((p) => {
        tenantProjectSelect.push({
          text: p.ProjectName,
          value: p.ID,
          tenantName: p.Tenant.TenantName,
          tenantID: p.Tenant.ID,
          projectTenant: `${p.ProjectName}(${p.Tenant.TenantName})`,
        })
      })
      this.tenantProjectSelect = tenantProjectSelect
    },
    async projectEnvironmentSelectData(projectid, virtualspace = false) {
      if (!projectid) {
        this.$store.commit('SET_SNACKBAR', {
          text: '请先选择项目',
          color: 'warning',
        })
        return
      }
      const data = await projectEnvironmentSelectData(projectid, {
        noprocessing: true,
      })
      const projectEnvironmentSelect = []
      data.List.forEach((ns) => {
        projectEnvironmentSelect.push({
          text:
            ns.VirtualSpaceID > 0 && virtualspace
              ? `${ns.EnvironmentName}(已加入虚拟空间)`
              : ns.EnvironmentName,
          value: ns.ID,
          environmentName: ns.EnvironmentName,
          clusterName: ns.Cluster.ClusterName,
          namespace: ns.Namespace,
          clusterid: ns.ClusterID,
          type: ns.MetaType,
          projectid: projectid,
          disabled: ns.VirtualSpaceID > 0 && virtualspace,
        })
      })
      this.projectEnvironmentSelect = projectEnvironmentSelect
    },
    async clusterSelectData(TenantID = null) {
      let data = null
      if (this.Admin && !TenantID) {
        data = await clusterSelectData({ noprocessing: true })
      } else {
        if (TenantID) {
          data = await tenantClusterSelectData(TenantID, { noprocessing: true })
        } else {
          data = await tenantClusterSelectData(this.Tenant().ID, {
            noprocessing: true,
          })
        }
        data.List.forEach((n) => {
          n.ClusterName = n.Cluster.ClusterName
          n.Version = n.Cluster.Version
          n.ID = n.ClusterID
        })
      }
      const clusterSelect = []
      data.List.forEach((ns) => {
        clusterSelect.push({
          text: ns.ClusterName,
          value: ns.ID,
          version: ns.Version,
        })
      })
      this.clusterSelect = clusterSelect
    },
    async namespaceSelectData(Cluster) {
      if (!Cluster) {
        this.$store.commit('SET_SNACKBAR', {
          text: '请先选择集群',
          color: 'warning',
        })
        return
      }
      const data = await namespaceSelectData(Cluster, {
        size: 200,
        noprocessing: true,
      })
      const namespaceSelect = []
      data.List.forEach((ns) => {
        namespaceSelect.push({
          text: ns.metadata.name,
          value: ns.metadata.name,
        })
      })
      this.namespaceSelect = namespaceSelect
    },
    async environmentSelectData(TenantID = null) {
      let data = null
      if (this.Admin && this.AdminViewport && !TenantID) {
        data = await environmentSelectData({ noprocessing: true })
      } else {
        if (TenantID) {
          data = await tenantEnvironmentSelectData(TenantID, {
            noprocessing: true,
          })
        } else {
          data = await tenantEnvironmentSelectData(this.Tenant().ID, {
            noprocessing: true,
          })
        }
      }
      this.environmentSelect = []
      if (data) {
        data.List.forEach((e) => {
          this.environmentSelect.push({
            text: e.EnvironmentName,
            value: e.Namespace,
            clusterName: e.Cluster.ClusterName,
          })
        })
      }
    },
    async storageClassSelectData(Cluster) {
      if (!Cluster) {
        this.$store.commit('SET_SNACKBAR', {
          text: '请先选择集群',
          color: 'warning',
        })
        return
      }
      const data = await storageClassSelectData(Cluster, { noprocessing: true })
      const storageClassSelect = []
      data.List.forEach((sc) => {
        storageClassSelect.push({
          text: sc.metadata.name,
          value: sc.metadata.name,
          storageClass: sc,
        })
      })
      this.storageClassSelect = storageClassSelect
    },
    async workloadSelectData(Cluster, Namespace) {
      if (!Cluster) {
        this.$store.commit('SET_SNACKBAR', {
          text: '请先选择集群',
          color: 'warning',
        })
        return
      }
      let data = []
      const ds = await getDaemonSetList(Cluster, Namespace, {
        size: 1000,
        noprocessing: true,
      })
      const deploy = await getDeploymentList(Cluster, Namespace, {
        size: 1000,
        noprocessing: true,
      })
      const sts = await getStatefulSetList(Cluster, Namespace, {
        size: 1000,
        noprocessing: true,
      })
      data = data.concat(ds.List).concat(deploy.List).concat(sts.List)
      const workloadSelect = []
      data.forEach((workload, index) => {
        let selector = {}
        if (
          workload.spec.template.metadata &&
          workload.spec.template.metadata.labels
        ) {
          selector = workload.spec.template.metadata.labels
          if (Object.prototype.hasOwnProperty.call(selector, 'version')) {
            delete selector['version']
          }
        }
        workloadSelect.push({
          text: workload.metadata.name,
          labels: selector,
          value: index,
        })
      })
      this.workloadSelect = workloadSelect
    },
    async secretSelectData(Cluster, Namespace, type = null) {
      if (!Cluster) {
        this.$store.commit('SET_SNACKBAR', {
          text: '请先选择集群',
          color: 'warning',
        })
        return
      }
      if (!Namespace) {
        this.$store.commit('SET_SNACKBAR', {
          text: '请先选择命名空间',
          color: 'warning',
        })
        return
      }
      const data = await secretSelectData(Cluster, Namespace, {
        noprocessing: true,
      })
      const secretSelect = []
      if (type) {
        data.List = data.List.filter((d) => {
          return d.type === type
        })
      }
      data.List.forEach((s) => {
        secretSelect.push({
          text: s.metadata.name,
          value: s.metadata.name,
        })
      })
      this.secretSelect = secretSelect
    },
    async serviceSelectData(Cluster, Namespace) {
      if (!Cluster) {
        this.$store.commit('SET_SNACKBAR', {
          text: '请先选择集群',
          color: 'warning',
        })
        return
      }
      if (!Namespace) {
        this.$store.commit('SET_SNACKBAR', {
          text: '请先选择命名空间',
          color: 'warning',
        })
        return
      }
      const data = await serviceSelectData(Cluster, Namespace, {
        noprocessing: true,
      })
      const serviceSelect = []
      data.List.forEach((s) => {
        const ports = []
        if (s.spec.ports) {
          s.spec.ports.forEach((p) => {
            ports.push({ text: p.port, value: p.port })
          })
          serviceSelect.push({
            text: s.metadata.name,
            value: s.metadata.name,
            ports: ports,
            labels: s.metadata.labels,
          })
        }
      })
      this.serviceSelect = serviceSelect
    },
    async issuerSelectData(Cluster, Namespace) {
      if (!Cluster) {
        this.$store.commit('SET_SNACKBAR', {
          text: '请先选择集群',
          color: 'warning',
        })
        return
      }
      if (!Namespace) {
        this.$store.commit('SET_SNACKBAR', {
          text: '请先选择命名空间',
          color: 'warning',
        })
        return
      }
      const data = await issuerSelectData(Cluster, Namespace, {
        noprocessing: true,
      })
      const issuerSelect = []
      data.List.forEach((i) => {
        issuerSelect.push({
          text: i.metadata.name,
          value: i.metadata.name,
          labels: i.metadata.labels,
        })
      })
      this.issuerSelect = issuerSelect
    },
    async gatewaySelectData(Cluster) {
      if (!Cluster) {
        this.$store.commit('SET_SNACKBAR', {
          text: '请先选择集群',
          color: 'warning',
        })
        return
      }
      const data = await gatewaySelectData(
        this.Tenant().ID,
        this.AdminViewport ? this.Cluster().ID : this.Environment().ClusterID,
        {
          noprocessing: true,
        },
      )
      const gatewaySelect = []
      data.forEach((ns) => {
        gatewaySelect.push({
          text: ns.metadata.name,
          value: ns.spec.ingressClass,
          baseDomain: ns.spec.baseDomain,
        })
      })
      this.gatewaySelect = gatewaySelect
    },
    async projectSelectData() {
      let data = null
      if (this.Admin && this.AdminViewport) {
        data = await projectSelectData({ noprocessing: true })
      } else {
        data = await tenantProjectSelectData(this.Tenant().ID, {
          noprocessing: true,
        })
      }
      const projectSelect = []
      data.List.forEach((p) => {
        projectSelect.push({
          text: this.Admin
            ? `租户${p.Tenant.TenantName} - 项目${p.ProjectName}`
            : p.ProjectName,
          value: p.ID,
          projectName: p.ProjectName,
          tenantName: p.Tenant.TenantName,
          tenantID: p.Tenant.ID,
        })
      })
      this.projectSelect = projectSelect
    },
    async registrySelectData() {
      let data = null
      if (this.AdminViewport) {
        data = await registrySelectData({ noprocessing: true })
      } else {
        data = await projectRegistrySelectData(this.Project().ID, {
          noprocessing: true,
        })
      }
      const registrySelect = []
      data.List.forEach((r) => {
        registrySelect.push({
          text: r.RegistryAddress,
          value: r.RegistryName,
        })
      })
      this.registrySelect = registrySelect
    },
    async virtualSpaceSelectData() {
      const data = await virtualSpaceSelectData({ noprocessing: true })
      const virtualSpaceSelect = []
      data.List.forEach((r) => {
        virtualSpaceSelect.push({
          text: r.VirtualSpaceName,
          value: r.ID,
        })
      })
      this.virtualSpaceSelect = virtualSpaceSelect
    },
    async virtualSpaceEnvironmentSelectData(virtualspaceid) {
      const data = await virtualSpaceEnvironmentSelectData(virtualspaceid, {
        noprocessing: true,
      })
      const virtualSpaceEnvironmentSelect = []
      data.List.forEach((r) => {
        virtualSpaceEnvironmentSelect.push({
          text: r.EnvironmentName,
          value: r.ID,
          namespace: r.Namespace,
          cluster: r.Cluster.ClusterName,
          clusterid: r.Cluster.ID,
        })
      })
      this.virtualSpaceEnvironmentSelect = virtualSpaceEnvironmentSelect
    },
    async appSelectData(tenantid, projectid, environmentid) {
      if (!projectid) {
        this.$store.commit('SET_SNACKBAR', {
          text: '请先选择项目',
          color: 'warning',
        })
        return
      }
      if (!environmentid) {
        this.$store.commit('SET_SNACKBAR', {
          text: '请先选择环境',
          color: 'warning',
        })
        return
      }
      const data = await appSelectData(tenantid, projectid, environmentid)
      const appSelect = []
      data.List.forEach((r) => {
        appSelect.push({
          text: r.name,
          value: r.name,
        })
      })
      this.appSelect = appSelect
    },
  },
}

export default select
