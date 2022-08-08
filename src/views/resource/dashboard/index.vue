<!--
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
-->

<template>
  <v-container fluid>
    <BaseBreadcrumb>
      <template #extend>
        <v-flex class="kubegems__full-right">
          <span class="text-body-2 kubegems__text">
            {{ `${$t('resource.tenant_c', [$t('resource.role')])}` }}:
            {{
              $TENANT_ROLE[m_permisson_tenantRole] ? $t(`role.tenant.${m_permisson_tenantRole}`) : $t('data.unknown')
            }}
          </span>
          <v-btn v-if="m_permisson_tenantAllow" class="primary--text mt-n1" small text @click="manageUser">
            <v-icon left small> mdi-account-settings </v-icon>
            {{ `${$t('resource.tenant_c', [$t('resource.member', [''])])}` }}
          </v-btn>
        </v-flex>
      </template>
    </BaseBreadcrumb>
    <v-row class="mt-3">
      <v-col class="py-0" cols="9">
        <DashboardCard :statistics="statistics" />

        <ProjectList class="mt-1" @refresh="tenantStatistics" />

        <ResourceList />
      </v-col>
      <v-col class="py-0" cols="3">
        <AuditList />
        <EventList />
      </v-col>
    </v-row>

    <ManageUser ref="manageUser" @refresh="tenantStatistics" />
  </v-container>
</template>

<script>
  import { mapGetters, mapState } from 'vuex';

  import AuditList from './components/AuditList';
  import DashboardCard from './components/DashboardCard';
  import EventList from './components/EventList';
  import ManageUser from './components/ManageUser';
  import ProjectList from './components/ProjectList';
  import ResourceList from './components/ResourceList';
  import { getTenantStatistics } from '@/api';
  import BasePermission from '@/mixins/permission';
  import BaseResource from '@/mixins/resource';

  export default {
    name: 'Dashboard',
    components: {
      AuditList,
      DashboardCard,
      EventList,
      ManageUser,
      ProjectList,
      ResourceList,
    },
    mixins: [BasePermission, BaseResource],
    data: () => ({
      statistics: null,
    }),
    computed: {
      ...mapState(['JWT', 'Admin']),
      ...mapGetters(['Tenant']),
    },
    mounted() {
      if (this.JWT) {
        this.$nextTick(() => {
          this.$store.commit('SET_ADMIN_VIEWPORT', false);
          if (this.Tenant().ID > 0) {
            this.tenantStatistics();
            this.$router.replace({ params: { tenant: this.Tenant().TenantName } });
          } else {
            this.$router.push({ name: 'whitepage' });
          }
        });
      }
    },
    methods: {
      async manageUser() {
        if (this.Tenant().ID > 0) {
          await this.$refs.manageUser.init();
          this.$refs.manageUser.open();
        } else {
          this.$store.commit('SET_SNACKBAR', {
            text: this.$t('tip.tenant'),
            color: 'warning',
          });
        }
      },
      async tenantStatistics() {
        const data = await getTenantStatistics(this.Tenant().ID, {
          noprocessing: true,
        });
        this.statistics = data;
      },
    },
  };
</script>
