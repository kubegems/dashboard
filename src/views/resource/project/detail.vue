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
          <span class="text-body-2 mx-2">
            项目角色:
            {{ $PROJECT_ROLE[m_permisson_projectRole] ? $PROJECT_ROLE[m_permisson_projectRole] : '暂无' }}
          </span>
          <v-btn v-if="m_permisson_projectAllow" class="primary--text" small text @click="addEnvironment">
            <v-icon left small> fas fa-plus-square </v-icon>
            创建环境
          </v-btn>
          <v-btn v-if="m_permisson_projectAllow" class="primary--text" small text @click="manageUser">
            <v-icon left small> mdi-account-settings </v-icon>
            项目成员
          </v-btn>
          <v-btn class="primary--text" small text @click="resourceUsage">
            <v-icon left small> mdi-view-list </v-icon>
            资源使用清单
          </v-btn>
          <v-menu v-if="m_permisson_tenantAllow" left>
            <template #activator="{ on }">
              <v-btn icon>
                <v-icon color="primary" x-small v-on="on"> fas fa-ellipsis-v </v-icon>
              </v-btn>
            </template>
            <v-card>
              <v-card-text class="pa-2">
                <v-flex>
                  <v-btn color="primary" small text @click="updateProject"> 编辑 </v-btn>
                </v-flex>
                <v-flex>
                  <v-btn color="error" small text @click="removeProject"> 删除 </v-btn>
                </v-flex>
              </v-card-text>
            </v-card>
          </v-menu>
        </v-flex>
      </template>
    </BaseBreadcrumb>

    <DashboardCard :basic="basic" class="mt-3" />

    <ResourceList :quota="quota" :resources="resources" />

    <EnvironmentList v-if="!AdminViewport" :ready="ready" />

    <UpdateProject ref="updateProject" @refresh="projectDetail" />
    <ResourceUseList ref="resourceUseList" title="项目资源使用清单" type="project" />
    <AddEnvironment ref="addEnvironment" />
    <ManageUser ref="manageUser" @refresh="projectQuota" />
  </v-container>
</template>

<script>
  import { mapGetters, mapState } from 'vuex';

  import DashboardCard from './components/DashboardCard';
  import EnvironmentList from './components/EnvironmentList';
  import ManageUser from './components/ManageUser';
  import ResourceList from './components/ResourceList';
  import UpdateProject from './components/UpdateProject';
  import { deleteProject, getProjectDetail, getProjectQuota } from '@/api';
  import BasePermission from '@/mixins/permission';
  import BaseResource from '@/mixins/resource';
  import BaseSelect from '@/mixins/select';
  import AddEnvironment from '@/views/resource/environment/components/AddEnvironment';
  import ResourceUseList from '@/views/resource/environment/components/ResourceUseList';

  export default {
    name: 'ProjectDetail',
    components: {
      AddEnvironment,
      DashboardCard,
      EnvironmentList,
      ManageUser,
      ResourceList,
      ResourceUseList,
      UpdateProject,
    },
    mixins: [BasePermission, BaseResource, BaseSelect],
    data: () => ({
      resources: [],
      quota: {},
      basic: {},
      project: null,
      ready: false,
    }),
    computed: {
      ...mapState(['JWT', 'AdminViewport']),
      ...mapGetters(['Project']),
    },
    async mounted() {
      if (this.JWT) {
        this.projectDetail();
      }
    },
    methods: {
      async projectDetail() {
        const data = await getProjectDetail(this.Project().ID);
        this.project = data;
        this.projectQuota();
        this.ready = true;
      },
      async projectQuota() {
        const data = await getProjectQuota(this.Project().ID);
        this.quota = data.quota.used ? data.quota.used : {};
        this.basic = data.resource;
        this.resources = Object.keys(this.quota).filter((i) => {
          return this.$RESOURCE_CN[i] !== undefined;
        });
      },
      updateProject() {
        this.$refs.updateProject.init(this.project);
        this.$refs.updateProject.open();
      },
      removeProject() {
        const item = this.project;
        this.$store.commit('SET_CONFIRM', {
          title: `删除项目`,
          content: {
            text: `删除项目 ${item.ProjectName}`,
            type: 'delete',
            name: item.ProjectName,
          },
          param: { item },
          doFunc: async (param) => {
            await deleteProject(param.item.ID);
            this.$store.commit('CLEAR_RESOURCE');
            this.$router.push({
              name: 'resource-dashboard',
              params: this.$route.params,
            });
          },
        });
      },
      manageUser() {
        this.$refs.manageUser.init();
        this.$refs.manageUser.open();
      },
      addEnvironment() {
        this.$refs.addEnvironment.projectid = this.Project().ID;
        this.$refs.addEnvironment.open();
        this.$refs.addEnvironment.init(this.Project().ID);
      },
      resourceUsage() {
        this.$refs.resourceUseList.init();
        this.$refs.resourceUseList.open();
      },
    },
  };
</script>
