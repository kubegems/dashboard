<template>
  <v-container fluid>
    <BaseBreadcrumb :breadcrumb="breadcrumb">
      <template #extend>
        <v-flex class="kubegems__full-right">
          <span class="text-body-2 kubegems__role">
            租户角色:
            {{ tenantRoleCN[tenantRole] ? tenantRoleCN[tenantRole] : '暂无' }}
          </span>
          <v-btn
            v-if="tenantAllow"
            text
            small
            class="primary--text mt-n1"
            @click="manageUser"
          >
            <v-icon
              left
              small
            >
              fas fa-user-md
            </v-icon>
            租户成员
          </v-btn>
        </v-flex>
      </template>
    </BaseBreadcrumb>
    <v-row class="mt-3">
      <v-col
        cols="9"
        class="py-0"
      >
        <DashboardCard :statistics="statistics" />

        <v-card class="mt-2">
          <BaseSubTitle
            title="项目"
            :divider="false"
          >
            <template #action>
              <v-btn
                v-if="tenantAllow"
                small
                text
                color="primary"
                class="float-right mr-2"
                @click="addProject"
              >
                <v-icon
                  left
                  small
                >
                  mdi-cube-outline
                </v-icon>
                创建项目
              </v-btn>
            </template>
          </BaseSubTitle>
          <ProjectList
            ref="projectList"
            @refreshTenantStatistics="tenantStatistics"
          />
        </v-card>

        <ResourceList />
      </v-col>
      <v-col
        cols="3"
        class="py-0"
      >
        <AuditList />
        <EventList />
      </v-col>
    </v-row>

    <ManageUser
      ref="manageUser"
      @refresh="tenantStatistics"
    />
    <AddProject
      ref="addProject"
      @refresh="refreshProjectList"
    />
  </v-container>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
import { getTenantStatistics } from '@/api'
import ProjectList from './components/ProjectList'
import ManageUser from './components/ManageUser'
import AddProject from '@/views/resource/project/components/AddProject'
import DashboardCard from './components/DashboardCard'
import ResourceList from './components/ResourceList'
import AuditList from './components/AuditList'
import EventList from './components/EventList'
import BasePermission from '@/mixins/permission'
import BaseResource from '@/mixins/resource'

export default {
  name: 'Dashboard',
  components: {
    ProjectList,
    ManageUser,
    AddProject,
    DashboardCard,
    ResourceList,
    AuditList,
    EventList,
  },
  mixins: [BasePermission, BaseResource],
  data: () => ({
    breadcrumb: {
      title: '租户资源',
      tip: '租户容器服务提供了安全隔离的、具有访问权限控制的工作平台。这里您可以看到当前租户内资源运行的概况。',
      icon: 'mdi-view-dashboard',
    },
    statistics: null,
  }),
  computed: {
    ...mapState(['JWT', 'Admin']),
    ...mapGetters(['Tenant']),
  },
  mounted() {
    if (this.JWT) {
      this.$nextTick(() => {
        this.$store.commit('SET_ADMIN_VIEWPORT', false)
        if (this.Tenant().ID > 0) {
          this.tenantStatistics()
        } else {
          this.$router.push({ name: 'whitepage' })
        }
      })
    }
  },
  methods: {
    refreshProjectList() {
      this.$refs.projectList.projectList()
      this.tenantStatistics()
    },
    addProject() {
      if (this.Tenant().ID > 0) {
        this.$refs.addProject.open()
        this.$refs.addProject.init()
      } else {
        this.$store.commit('SET_SNACKBAR', {
          text: `请创建或加入租户`,
          color: 'warning',
        })
      }
    },
    async manageUser() {
      if (this.Tenant().ID > 0) {
        await this.$refs.manageUser.init()
        this.$refs.manageUser.open()
      } else {
        this.$store.commit('SET_SNACKBAR', {
          text: `请创建或加入租户`,
          color: 'warning',
        })
      }
    },
    async tenantStatistics() {
      const data = await getTenantStatistics(this.Tenant().ID, {
        noprocessing: true,
      })
      this.statistics = data
    },
  },
}
</script>
