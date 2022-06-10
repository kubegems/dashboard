<template>
  <v-container fluid>
    <BaseBreadcrumb>
      <template #extend>
        <v-flex class="kubegems__full-right">
          <span class="text-body-2 kubegems__text">
            租户角色:
            {{ $TENANT_ROLE[m_permisson_tenantRole] ? $TENANT_ROLE[m_permisson_tenantRole] : '暂无' }}
          </span>
          <v-btn v-if="m_permisson_tenantAllow" text small class="primary--text mt-n1" @click="manageUser">
            <v-icon left small> fas fa-user-md </v-icon>
            租户成员
          </v-btn>
        </v-flex>
      </template>
    </BaseBreadcrumb>
    <v-row class="mt-3">
      <v-col cols="9" class="py-0">
        <DashboardCard :statistics="statistics" />

        <ProjectList class="mt-1" @refresh="tenantStatistics" />

        <ResourceList />
      </v-col>
      <v-col cols="3" class="py-0">
        <AuditList />
        <EventList />
      </v-col>
    </v-row>

    <ManageUser ref="manageUser" @refresh="tenantStatistics" />
  </v-container>
</template>

<script>
  import { mapGetters, mapState } from 'vuex';
  import { getTenantStatistics } from '@/api';
  import ProjectList from './components/ProjectList';
  import ManageUser from './components/ManageUser';
  import DashboardCard from './components/DashboardCard';
  import ResourceList from './components/ResourceList';
  import AuditList from './components/AuditList';
  import EventList from './components/EventList';
  import BasePermission from '@/mixins/permission';
  import BaseResource from '@/mixins/resource';

  export default {
    name: 'Dashboard',
    components: {
      ProjectList,
      ManageUser,
      DashboardCard,
      ResourceList,
      AuditList,
      EventList,
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
            text: `请创建或加入租户`,
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
