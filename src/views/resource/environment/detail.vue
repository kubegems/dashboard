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
    <BaseViewportHeader :selectable="false" />
    <BaseBreadcrumb>
      <template #extend>
        <v-flex class="kubegems__full-right">
          <template v-if="m_permisson_projectAllow">
            <v-btn class="primary--text" small text @click="scaleResource">
              <v-icon left small> mdi-scale </v-icon>
              {{ $t('operate.scale_resource') }}
            </v-btn>
            <v-btn class="primary--text" small text @click="manageUser">
              <v-icon left small> mdi-account-settings </v-icon>
              {{ $root.$t('resource.environment_c', [$root.$t('resource.member')]) }}
            </v-btn>
            <v-btn class="primary--text" small text @click="resourceUsage">
              <v-icon left small> mdi-format-list-text </v-icon>
              {{ $t('operate.resource_used_list') }}
            </v-btn>
            <v-menu left>
              <template #activator="{ on }">
                <v-btn icon>
                  <v-icon color="primary" small v-on="on"> mdi-dots-vertical </v-icon>
                </v-btn>
              </template>
              <v-card>
                <v-card-text class="pa-2">
                  <v-flex>
                    <v-btn color="primary" small text @click="updateEnvironment">
                      {{ $root.$t('operate.edit') }}
                    </v-btn>
                  </v-flex>
                  <v-flex>
                    <v-btn color="error" small text @click="removeEnvironment">
                      {{ $root.$t('operate.delete') }}
                    </v-btn>
                  </v-flex>
                </v-card-text>
              </v-card>
            </v-menu>
          </template>
        </v-flex>
      </template>
    </BaseBreadcrumb>

    <v-row class="mt-3 mb-0">
      <v-col class="py-0" cols="9">
        <ResourceQuota ref="resourceQuota" @ready="ready = true" />

        <ResourceMonitor :ready="ready" />
      </v-col>

      <v-col class="py-0" cols="3">
        <TopNResourceUsage />
      </v-col>
    </v-row>

    <ScaleResource ref="scaleResource" @refresh="environmentQuota" />
    <ManageUser ref="manageUser" />
    <UpdateEnvironment ref="updateEnvironment" @refresh="environmentDetail" />
    <ResourceUseList ref="resourceUseList" :title="$t('tip.resource_used_list')" type="env" />
  </v-container>
</template>

<script>
  import { mapGetters, mapState } from 'vuex';

  import ManageUser from './components/ManageUser';
  import ResourceMonitor from './components/ResourceMonitor';
  import ResourceQuota from './components/ResourceQuota';
  import ResourceUseList from './components/ResourceUseList';
  import ScaleResource from './components/ScaleResource';
  import TopNResourceUsage from './components/TopNResourceUsage';
  import UpdateEnvironment from './components/UpdateEnvironment';
  import messages from './i18n';
  import { deleteEnvironment, getEnvironmentDetail } from '@/api';
  import BasePermission from '@/mixins/permission';
  import BaseResource from '@/mixins/resource';
  import BaseSelect from '@/mixins/select';

  export default {
    name: 'EnvironmentDetail',
    i18n: {
      messages: messages,
    },
    components: {
      ManageUser,
      ResourceMonitor,
      ResourceQuota,
      ResourceUseList,
      ScaleResource,
      TopNResourceUsage,
      UpdateEnvironment,
    },
    mixins: [BasePermission, BaseResource, BaseSelect],
    data: () => ({
      environment: null,
      ready: false,
    }),
    computed: {
      ...mapState(['JWT', 'Scale']),
      ...mapGetters(['Environment', 'Project']),
    },
    async mounted() {
      if (this.JWT) {
        this.$store.commit('CLEAR_PLUGINS_INTERVAL');
        this.environmentDetail();
      }
    },
    methods: {
      async environmentDetail() {
        const data = await getEnvironmentDetail(this.Environment().ID);
        this.environment = data;
      },
      manageUser() {
        this.$refs.manageUser.init();
        this.$refs.manageUser.open();
      },
      scaleResource() {
        this.$refs.scaleResource.init(this.environment);
        this.$refs.scaleResource.open();
      },
      updateEnvironment() {
        this.$refs.updateEnvironment.init(this.environment);
        this.$refs.updateEnvironment.open();
      },
      removeEnvironment() {
        const item = this.environment;
        this.$store.commit('SET_CONFIRM', {
          title: this.$root.$t('operate.delete_c', [this.$root.$t('resource.environment')]),
          content: {
            text: `${this.$root.$t('operate.delete_c', [this.$root.$t('resource.environment')])} ${
              item.EnvironmentName
            } , ${item.DeletePolicy === 'delLabels' ? this.$t('tip.delete_cascade') : this.$t('tip.delete_all')}`,
            type: 'delete',
            name: item.EnvironmentName,
            level: item.DeletePolicy === 'delLabels' ? 'warning' : 'error',
          },
          param: { item },
          doFunc: async (param) => {
            await deleteEnvironment(param.item.ID);
            this.$store.commit('CLEAR_RESOURCE');
            this.$router.push({
              name: 'resource-dashboard',
              params: this.$route.params,
            });
          },
        });
      },
      resourceUsage() {
        this.$refs.resourceUseList.init();
        this.$refs.resourceUseList.open();
      },
      environmentQuota() {
        this.$refs.resourceQuota.environmentQuota();
      },
    },
  };
</script>
