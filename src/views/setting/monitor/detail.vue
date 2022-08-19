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
          <v-menu left>
            <template #activator="{ on }">
              <v-btn icon>
                <v-icon color="primary" small v-on="on"> mdi-dots-vertical </v-icon>
              </v-btn>
            </template>
            <v-card>
              <v-card-text class="pa-2">
                <v-flex>
                  <v-btn color="error" small text @click="removeMonitorTemplate">
                    {{ $root.$t('operate.delete') }}
                  </v-btn>
                </v-flex>
              </v-card-text>
            </v-card>
          </v-menu>
        </v-flex>
      </template>
    </BaseBreadcrumb>
    <v-row class="mt-0">
      <v-col class="pt-0" cols="2">
        <v-card>
          <v-card-title class="text-h6 primary--text">
            {{ monitorTemplate ? monitorTemplate.name : '' }}
          </v-card-title>
          <v-list-item two-line>
            <v-list-item-content class="kubegems__text">
              <v-list-item-title class="text-subtitle-2"> {{ $t('table.description') }} </v-list-item-title>
              <v-list-item-subtitle class="text-body-2">
                {{ monitorTemplate ? monitorTemplate.description : '' }}
              </v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
          <v-list-item two-line>
            <v-list-item-content class="kubegems__text">
              <v-list-item-title class="text-subtitle-2"> {{ $t('table.refresh') }} </v-list-item-title>
              <v-list-item-subtitle class="text-body-2">
                {{ monitorTemplate ? monitorTemplate.refresh : '' }}
              </v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
          <v-list-item two-line>
            <v-list-item-content class="kubegems__text">
              <v-list-item-title class="text-subtitle-2"> {{ $t('table.graph_count') }} </v-list-item-title>
              <v-list-item-subtitle class="text-body-2">
                {{ monitorTemplate ? monitorTemplate.graphs.length : '' }}
              </v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
        </v-card>
      </v-col>
      <v-col class="pt-0" cols="10">
        <v-card flat>
          <v-card-text class="pa-0">
            <v-tabs v-model="tab" class="rounded-t pa-3" height="30">
              <v-tab v-for="item in tabItems" :key="item.value">
                {{ item.text }}
              </v-tab>
            </v-tabs>
          </v-card-text>
        </v-card>

        <component :is="tabItems[tab].value" :ref="tabItems[tab].value" class="mt-3" :item="monitorTemplate" />
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
  import { mapGetters, mapState } from 'vuex';

  import ResourceInfo from './components/ResourceInfo';
  import messages from './i18n';
  import { deleteMonitorDashboardTemplate, getMonitorDashboardTemplateDetail } from '@/api';

  export default {
    name: 'MonitorTemplateDetail',
    i18n: {
      messages: messages,
    },
    components: {
      ResourceInfo,
    },
    data: () => ({
      monitorTemplate: null,
      tab: 0,
    }),
    computed: {
      ...mapState(['JWT']),
      ...mapGetters(['Tenant']),
      tabItems() {
        return [{ text: this.$t('tab.template_info'), value: 'ResourceInfo' }];
      },
    },
    mounted() {
      if (this.JWT) {
        this.$nextTick(() => {
          this.monitorTemplateDetail();
        });
      }
    },
    methods: {
      async monitorTemplateDetail() {
        const data = await getMonitorDashboardTemplateDetail(this.$route.params.name);
        this.monitorTemplate = data;
      },
      removeMonitorTemplate() {
        const item = this.gateway;
        this.$store.commit('SET_CONFIRM', {
          title: this.$root.$t('operate.delete_c', [this.$root.$t('resource.monitor_template')]),
          content: {
            text: `${this.$root.$t('operate.delete_c', [this.$root.$t('resource.monitor_template')])} ${item.name}`,
            type: 'delete',
            name: item.name,
          },
          param: { item },
          doFunc: async (param) => {
            await deleteMonitorDashboardTemplate(param.item.name);
            this.$router.push({ name: 'monitor-template-list', params: this.$route.params });
          },
        });
      },
    },
  };
</script>
