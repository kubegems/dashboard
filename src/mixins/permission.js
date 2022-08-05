import { mapGetters, mapState } from 'vuex';

import { getClusterPluginsList, matrix, vector } from '@/api';

const permission = {
  computed: {
    ...mapState(['Auth', 'Admin', 'Plugins']),
    ...mapGetters(['VirtualSpace', 'Tenant', 'Project', 'Environment']),
    m_permisson_resourceRole() {
      if (this.Admin) return 'sys';
      if (this.m_permisson_tenantRole === 'admin') return 'tenantadmin';
      if (this.m_permisson_projectRole === 'admin') return 'projectadmin';
      if (this.m_permisson_projectRole === 'ops') return 'projectops';
      const role = this.Auth.environments.find((t) => {
        return t.id === this.Environment().ID;
      });
      if (role) {
        return role.role;
      }
      return 'reader';
    },
    m_permisson_projectRole() {
      if (this.Admin) return 'sys';
      if (this.m_permisson_tenantRole === 'admin') return 'tenantadmin';
      const role = this.Auth.projects.find((t) => {
        return t.id === this.Project().ID;
      });
      if (role) {
        return role.role;
      }
      return '';
    },
    m_permisson_tenantRole() {
      if (this.Admin) return 'sys';
      const role = this.Auth.tenant.find((t) => {
        return t.id === this.Tenant().ID;
      });
      if (role) {
        return role.role;
      }
      return 'ordinary';
    },
    m_permisson_virtualSpaceRole() {
      if (this.Admin) return 'sys';
      const role = this.Auth.virtualSpaces.find((t) => {
        return t.id === this.VirtualSpace().ID;
      });
      if (role) {
        return role.role;
      }
      return 'normal';
    },
  },
  methods: {
    m_permisson_resourceAllow(env = undefined) {
      return (
        this.Auth.environments.findIndex((t) => {
          if (env) {
            return t.name === env && t.isAdmin;
          } else {
            return t.id === this.Environment().ID && t.isAdmin;
          }
        }) > -1 ||
        this.Admin ||
        this.m_permisson_projectAllow ||
        this.m_permisson_tenantAllow
      );
    },
    m_permisson_projectAllow(project = undefined) {
      return (
        this.Auth.projects.findIndex((t) => {
          if (project) {
            return t.name === project && (t.isAdmin || t.role === 'ops');
          } else {
            return t.id === this.Project().ID && (t.isAdmin || t.role === 'ops');
          }
        }) > -1 ||
        this.Admin ||
        this.m_permisson_tenantAllow
      );
    },
    m_permisson_tenantAllow(tenant = undefined) {
      return (
        this.Auth.tenant.findIndex((t) => {
          if (tenant) {
            return t.name === tenant && t.isAdmin;
          } else {
            return t.id === this.Tenant().ID && t.isAdmin;
          }
        }) > -1 || this.Admin
      );
    },
    m_permisson_virtualSpaceAllow(virtualspace = undefined) {
      return (
        this.Auth.virtualSpaces.findIndex((t) => {
          if (virtualspace) {
            return t.isAdmin && t.name === virtualspace;
          } else {
            return t.isAdmin && t.id === this.VirtualSpace().ID;
          }
        }) > -1 || this.Admin
      );
    },
    async m_permission_matrix(cluster, query = {}) {
      if (this.Plugins?.['monitoring']) {
        const data = await matrix(cluster, query);
        return data;
      }
      return [];
    },
    async m_permission_vector(cluster, query = {}) {
      if (this.Plugins?.['monitoring']) {
        const data = await vector(cluster, query);
        return data;
      }
      return [];
    },
    async m_permission_plugin_pass(cluster, plugins = []) {
      if (plugins && plugins.length === 0) return [];
      const data = await getClusterPluginsList(cluster, {
        simple: true,
        noprocessing: true,
      });
      const notPassPluins = plugins.filter((p) => {
        return !data[p];
      });
      return notPassPluins;
    },
  },
};

export default permission;
