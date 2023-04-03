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
import { mapGetters, mapState } from 'vuex';

import { getClusterPluginsList, matrix, vector } from '@/api';

const permission: { [key: string]: any } = {
  computed: {
    ...mapState(['Auth', 'Admin', 'Plugins']),
    ...mapGetters(['VirtualSpace', 'Tenant', 'Project', 'Environment']),
    m_permisson_resourceRole(): string {
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
    m_permisson_projectRole(): string {
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
    m_permisson_virtualSpaceRole(): string {
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
    m_permisson_resourceAllow(env: string | undefined = undefined): boolean {
      return (
        this.Auth.environments.findIndex((t) => {
          if (env) {
            return t.name === env && t.isAdmin;
          } else {
            return t.id === this.Environment().ID && t.isAdmin;
          }
        }) > -1 ||
        this.Admin ||
        this.m_permisson_projectAllow() ||
        this.m_permisson_tenantAllow()
      );
    },
    m_permisson_projectAllow(project: string | undefined = undefined): boolean {
      return (
        this.Auth.projects.findIndex((t) => {
          if (project) {
            return t.name === project && (t.isAdmin || t.role === 'ops');
          } else {
            return t.id === this.Project().ID && (t.isAdmin || t.role === 'ops');
          }
        }) > -1 ||
        this.Admin ||
        this.m_permisson_tenantAllow()
      );
    },
    m_permisson_tenantAllow(tenant: string | undefined = undefined): boolean {
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
    m_permisson_virtualSpaceAllow(virtualspace: string | undefined = undefined): boolean {
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
    async m_permission_matrix(cluster: string, query: any = {}): Promise<any> {
      if (this.Plugins?.['monitoring'] || query.pass) {
        const data = await matrix(cluster, query);
        return data;
      }
      return [];
    },
    async m_permission_vector(cluster: string, query: any = {}): Promise<any> {
      if (this.Plugins?.['monitoring'] || query.pass) {
        const data = await vector(cluster, query);
        return data;
      }
      return [];
    },
    async m_permission_plugin_pass(cluster: string, plugins: any = []): Promise<any> {
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

// done
