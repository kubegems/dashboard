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
import { Environment } from '@kubegems/api/typed/environment';
import { Project } from '@kubegems/api/typed/project';
import { Tenant } from '@kubegems/api/typed/tenant';
import { User } from '@kubegems/api/typed/user';
import { convertResponse2List } from '@kubegems/api/utils';
import { mapGetters, mapState } from 'vuex';

import {
  environmentSelectData,
  namespaceSelectData,
  projectEnvironmentSelectData,
  projectSelectData,
  tenantClusterSelectData,
  tenantEnvironmentSelectData,
  tenantProjectSelectData,
  tenantSelectData,
  tenantUserSelectData,
  userSelectData,
  userTenantSelectData,
} from '@/api';

const select: { [key: string]: any } = {
  data() {
    return {
      m_select_userItems: [],
      m_select_environmentItems: [],
      m_select_tenantItems: [],
      m_select_tenantUserItems: [],
      m_select_tenantProjectItems: [],
      m_select_tenantClusterItems: [],
      m_select_projectEnvironmentItems: [],
      m_select_projectItems: [],
      m_select_namespaceItems: [],
    };
  },
  computed: {
    ...mapState(['Admin', 'User', 'AdminViewport']),
    ...mapGetters(['Project', 'Environment', 'Cluster', 'Tenant']),
  },
  methods: {
    async m_select_userSelectData(): Promise<void> {
      const data: { [key: string]: any } = await userSelectData({ noprocessing: true });
      const userSelect: { [key: string]: number | string }[] = [];
      convertResponse2List(data as KubePaginationResponse<User[]>).forEach((user) => {
        userSelect.push({ text: user.Username, value: user.ID });
      });
      this.m_select_userItems = userSelect;
    },
    async m_select_tenantSelectData(): Promise<void> {
      let data: { [key: string]: any } = {};
      if (this.Admin) {
        data = await tenantSelectData({ noprocessing: true });
      } else {
        data = await userTenantSelectData(this.User.ID, {
          noprocessing: true,
        });
      }
      const tenantSelect: { [key: string]: number | string | boolean }[] = [];
      convertResponse2List(data as KubePaginationResponse<Tenant[]>).forEach((tenant) => {
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
    async m_select_tenantClusterSelectData(TenantID: number): Promise<void> {
      const data: { [key: string]: any } = await tenantClusterSelectData(TenantID, {
        noprocessing: true,
      });
      const tenantClusterSelect: { [key: string]: number | string }[] = [];
      convertResponse2List(data as KubePaginationResponse<Tenant[]>).forEach((tenant) => {
        tenantClusterSelect.push({
          text: tenant.Cluster.ClusterName,
          value: tenant.Cluster.ID,
        });
      });
      this.m_select_tenantClusterItems = tenantClusterSelect;
    },
    async m_select_tenantUserSelectData(): Promise<void> {
      const data: { [key: string]: any } = await tenantUserSelectData(this.Tenant().ID, {
        noprocessing: true,
      });
      const tenantUserSelect: { [key: string]: number | string }[] = [];
      convertResponse2List(data as KubePaginationResponse<User[]>).forEach((user) => {
        tenantUserSelect.push({ text: user.Username, value: user.ID });
      });
      this.m_select_tenantUserItems = tenantUserSelect;
    },
    async m_select_tenantProjectSelectData(): Promise<void> {
      const data: { [key: string]: any } = await tenantProjectSelectData(this.Tenant().ID, {
        noprocessing: true,
      });
      const tenantProjectSelect: { [key: string]: number | string }[] = [];
      convertResponse2List(data as KubePaginationResponse<Project[]>).forEach((p) => {
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
      projectid: number,
      virtualspace = false,
      containNSLabels = false,
      noprocessing = true,
    ): Promise<void> {
      if (!projectid) {
        return;
      }
      const data: { [key: string]: any } = await projectEnvironmentSelectData(projectid, {
        containNSLabels: containNSLabels || null,
        noprocessing: noprocessing,
      });
      const projectEnvironmentSelect: { [key: string]: number | string | boolean }[] = [];
      convertResponse2List(data as KubePaginationResponse<Environment[]>).forEach((ns) => {
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
          metaType: ns.MetaType,
        });
      });
      this.m_select_projectEnvironmentItems = projectEnvironmentSelect;
    },
    async m_select_namespaceSelectData(
      Cluster: string,
      params: { [key: string]: any } = { noprocessing: false },
    ): Promise<void> {
      if (!Cluster) {
        this.$store.commit('SET_SNACKBAR', {
          text: this.$root.$t('tip.select_cluster'),
          color: 'warning',
        });
        return;
      }
      const data: { [key: string]: any } = await namespaceSelectData(
        Cluster,
        Object.assign(
          {
            size: 200,
          },
          params,
        ),
      );
      const namespaceSelect: { [key: string]: string }[] = [];
      convertResponse2List(data as KubePaginationResponse<Namespace[]>).forEach((ns) => {
        namespaceSelect.push({
          text: ns.metadata.name,
          value: ns.metadata.name,
        });
      });
      this.m_select_namespaceItems = namespaceSelect;
    },
    async m_select_environmentSelectData(TenantID: number = null, noprocessing = true): Promise<void> {
      let data: { [key: string]: any } = null;
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
        convertResponse2List(data as KubePaginationResponse<Environment[]>).forEach((e) => {
          this.m_select_environmentItems.push({
            text: e.EnvironmentName,
            value: e.Namespace,
            clusterName: e.Cluster.ClusterName,
            projectName: e.Project.ProjectName,
          });
        });
      }
    },
    async m_select_projectSelectData(tenantId: number = null, noprocessing = false): Promise<void> {
      let data: { [key: string]: any } = null;
      if (this.Admin && this.AdminViewport && tenantId === null) {
        data = await projectSelectData({ noprocessing: noprocessing });
      } else {
        data = await tenantProjectSelectData(tenantId || this.Tenant().ID, {
          noprocessing: noprocessing,
        });
      }
      const projectSelect: { [key: string]: number | string }[] = [];
      convertResponse2List(data as KubePaginationResponse<Project[]>).forEach((p) => {
        projectSelect.push({
          text: this.Admin ? `租户${p.Tenant.TenantName} - 项目${p.ProjectName}` : p.ProjectName,
          value: p.ID,
          projectName: p.ProjectName,
          tenantName: p.Tenant.TenantName,
          tenantID: p.Tenant.ID,
          remark: p.Remark,
        });
      });
      this.m_select_projectItems = projectSelect;
    },
  },
};

export default select;
