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
    <BaseViewportHeader v-if="!AdminViewport" :environmented="Environment().ID > 0" :selectable="false" />
    <BaseBreadcrumb>
      <template #extend>
        <v-flex class="kubegems__full-right">
          <v-menu left>
            <template #activator="{ on }">
              <v-btn icon>
                <v-icon color="primary" small v-on="on"> mdi-dots-vertical </v-icon>
              </v-btn>
            </template>
            <v-card>
              <v-card-text class="pa-2">
                <v-flex>
                  <v-btn color="primary" small text @click="updateApp"> {{ $root.$t('operate.edit') }} </v-btn>
                </v-flex>
                <v-flex>
                  <v-btn color="error" small text @click="removeApp"> {{ $root.$t('operate.delete') }} </v-btn>
                </v-flex>
              </v-card-text>
            </v-card>
          </v-menu>
        </v-flex>
      </template>
    </BaseBreadcrumb>
    <v-row class="mt-0">
      <v-col class="pt-0" cols="2">
        <ResourceInfo :item="app" />
      </v-col>
      <v-col class="pt-0" cols="10">
        <v-card>
          <v-card-text class="pa-0">
            <v-tabs v-model="tab" class="rounded-t pa-3" height="30">
              <v-tab v-for="item in tabItems" :key="item.value">
                {{ item.text }}
              </v-tab>
            </v-tabs>
          </v-card-text>
        </v-card>
        <component :is="tabItems[tab].value" :ref="tabItems[tab].value" :app="app" class="mt-3" />
      </v-col>
    </v-row>

    <UpdateApp ref="updateApp" @refresh="appDetail" />
  </v-container>
</template>

<script>
  import { mapGetters, mapState } from 'vuex';

  import AppDeployList from './components/AppDeployList';
  import AppImageSecurityReportList from './components/AppImageSecurityReportList';
  import AppResourceFileList from './components/AppResourceFileList';
  import ResourceInfo from './components/ResourceInfo';
  import UpdateApp from './components/UpdateApp';
  import messages from './i18n';
  import { deleteManifest, getManifestDetail } from '@/api';
  import BaseResource from '@/mixins/resource';

  export default {
    name: 'AppManifestDetail',
    i18n: {
      messages: messages,
    },
    components: {
      AppDeployList,
      AppImageSecurityReportList,
      AppResourceFileList,
      ResourceInfo,
      UpdateApp,
    },
    mixins: [BaseResource],
    data: () => ({
      tab: 0,
      app: null,
    }),
    computed: {
      ...mapState(['JWT', 'AdminViewport']),
      ...mapGetters(['Tenant', 'Project', 'Environment']),
      tabItems() {
        return [
          { text: this.$t('tab.manifest'), value: 'AppResourceFileList' },
          { text: this.$t('tab.deploy_status'), value: 'AppDeployList' },
          { text: this.$t('tab.image_safety'), value: 'AppImageSecurityReportList' },
        ];
      },
    },
    mounted() {
      if (this.JWT) {
        this.$nextTick(() => {
          this.appDetail();
        });
      }
    },
    methods: {
      async appDetail() {
        const data = await getManifestDetail(
          this.$route.query.tenantid,
          this.$route.query.projectid,
          this.$route.params.name,
        );
        this.app = Object.assign(data, {
          TenantID: this.$route.query.tenantid,
          ProjectID: this.$route.query.projectid,
        });
      },
      updateApp() {
        this.$refs.updateApp.init(this.app);
        this.$refs.updateApp.open();
      },
      removeApp() {
        const item = this.app;
        this.$store.commit('SET_CONFIRM', {
          title: this.$root.$t('operate.create_c', [this.$root.$t('resource.appmanifest')]),
          content: {
            text: `${this.$root.$t('operate.create_c', [this.$root.$t('resource.appmanifest')])} ${item.name}`,
            type: 'delete',
            name: item.name,
          },
          param: { item },
          doFunc: async (param) => {
            await deleteManifest(param.item.TenantID, param.item.ProjectID, param.item.name);
            this.$router.push({ name: 'app-list', params: this.$route.params });
          },
        });
      },
    },
  };
</script>
