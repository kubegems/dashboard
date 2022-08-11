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
            {{ $root.$t('resource.project_c', [$root.$t('resource.role')]) }}:
            {{
              $PROJECT_ROLE[m_permisson_projectRole]
                ? $root.$t(`role.project.${m_permisson_projectRole}`)
                : $root.$t('data.unknown')
            }}
          </span>
          <v-btn v-if="m_permisson_projectAllow" class="primary--text" small text @click="addEnvironment">
            <v-icon left small> mdi-plus-box </v-icon>
            {{ $root.$t('operate.create_c', [$root.$t('resource.environment')]) }}
          </v-btn>
          <v-btn v-if="m_permisson_projectAllow" class="primary--text" small text @click="manageUser">
            <v-icon left small> mdi-account-settings </v-icon>
            {{ $root.$t('resource.project_c', [$root.$t('resource.member')]) }}
          </v-btn>
          <v-btn class="primary--text" small text @click="resourceUsage">
            <v-icon left small> mdi-format-list-text </v-icon>
            {{ $t('tip.resource_list') }}
          </v-btn>
          <v-menu v-if="m_permisson_tenantAllow" left>
            <template #activator="{ on }">
              <v-btn icon>
                <v-icon color="primary" small v-on="on"> mdi-dots-vertical </v-icon>
              </v-btn>
            </template>
            <v-card>
              <v-card-text class="pa-2">
                <v-flex>
                  <v-btn color="primary" small text @click="updateProject"> {{ $root.$t('operate.edit') }} </v-btn>
                </v-flex>
                <v-flex>
                  <v-btn color="error" small text @click="removeProject"> {{ $root.$t('operate.delete') }} </v-btn>
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
    <ResourceUseList ref="resourceUseList" :title="$t('tip.resource_list')" type="project" />
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
  import messages from './i18n';
  import { deleteProject, getProjectDetail, getProjectQuota } from '@/api';
  import BasePermission from '@/mixins/permission';
  import BaseResource from '@/mixins/resource';
  import BaseSelect from '@/mixins/select';
  import AddEnvironment from '@/views/resource/environment/components/AddEnvironment';
  import ResourceUseList from '@/views/resource/environment/components/ResourceUseList';

  export default {
    name: 'ProjectDetail',
    i18n: {
      messages: messages,
    },
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
          title: this.$root.$t('operate.delete_c', [this.$root.$t('resource.project')]),
          content: {
            text: `${this.$root.$t('operate.delete_c', [this.$root.$t('resource.project')])} ${item.ProjectName}`,
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
