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
          <v-btn class="primary--text" small text @click="resourceYaml">
            <v-icon left small> mdi-code-json </v-icon>
            YAML
          </v-btn>
          <v-menu v-if="m_permisson_resourceAllow($route.query.env)" left>
            <template #activator="{ on }">
              <v-btn icon>
                <v-icon color="primary" small v-on="on"> mdi-dots-vertical </v-icon>
              </v-btn>
            </template>
            <v-card>
              <v-card-text class="pa-2">
                <v-flex>
                  <v-btn color="primary" small text @click="updateServiceMonitor">
                    {{ $root.$t('operate.edit') }}
                  </v-btn>
                </v-flex>
                <v-flex>
                  <v-btn color="error" small text @click="removeServiceMonitor">
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
        <BasicResourceInfo :item="serviceMonitor" />
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
        <component
          :is="tabItems[tab].value"
          :ref="tabItems[tab].value"
          class="mt-3"
          :item="serviceMonitor"
          :selector="selector"
        />
      </v-col>
    </v-row>

    <ResourceYaml ref="resourceYaml" :item="serviceMonitor" />
    <UpdateServiceMonitor ref="updateServiceMonitor" @refresh="serviceMonitorDetail" />
  </v-container>
</template>

<script>
  import { mapState } from 'vuex';

  import ResourceInfo from './components/ResourceInfo';
  import UpdateServiceMonitor from './components/UpdateServiceMonitor';
  import { deleteServiceMonitor, getServiceMonitorDetail } from '@/api';
  import BasePermission from '@/mixins/permission';
  import BaseResource from '@/mixins/resource';
  import BasicResourceInfo from '@/views/resource/components/common/BasicResourceInfo';
  import EventList from '@/views/resource/components/common/EventList';
  import ResourceYaml from '@/views/resource/components/common/ResourceYaml';
  import Metadata from '@/views/resource/components/metadata/Metadata';

  export default {
    name: 'ServiceMonitorDetail',
    components: {
      BasicResourceInfo,
      EventList,
      Metadata,
      ResourceInfo,
      ResourceYaml,
      UpdateServiceMonitor,
    },
    mixins: [BasePermission, BaseResource],
    data: () => ({
      serviceMonitor: null,
      tab: 0,
    }),
    computed: {
      ...mapState(['JWT']),
      selector() {
        if (this.tabItems[this.tab].value === 'EventList') {
          return {
            topkind: 'ServiceMonitor',
            topname: this.serviceMonitor ? this.serviceMonitor.metadata.name : '',
          };
        }
        return {};
      },
      tabItems() {
        return [
          { text: this.$root.$t('tab.resource_info'), value: 'ResourceInfo' },
          { text: this.$root.$t('tab.metadata'), value: 'Metadata' },
          { text: this.$root.$t('tab.event'), value: 'EventList' },
        ];
      },
    },
    mounted() {
      if (this.JWT) {
        this.$nextTick(() => {
          this.serviceMonitorDetail();
        });
      }
    },
    methods: {
      async serviceMonitorDetail() {
        const data = await getServiceMonitorDetail(
          this.$route.query.cluster,
          this.$route.query.namespace,
          this.$route.params.name,
        );
        this.serviceMonitor = data;
      },
      resourceYaml() {
        this.$refs.resourceYaml.open();
      },
      updateServiceMonitor() {
        this.$refs.updateServiceMonitor.init(this.serviceMonitor);
        this.$refs.updateServiceMonitor.open();
      },
      removeServiceMonitor() {
        const item = this.serviceMonitor;
        this.$store.commit('SET_CONFIRM', {
          title: this.$root.$t('operate.delete_c', [this.$root.$t('resource.service_monitor')]),
          content: {
            text: `${this.$root.$t('operate.delete_c', [this.$root.$t('resource.service_monitor')])} ${
              item.metadata.name
            }`,
            type: 'delete',
            name: item.metadata.name,
          },
          param: { item },
          doFunc: async (param) => {
            await deleteServiceMonitor(
              this.$route.query.cluster,
              this.$route.query.namespace,
              param.item.metadata.name,
            );
            this.$router.push({
              name: 'observe-monitor-config',
              params: this.$route.params,
              query: this.$route.query,
            });
          },
        });
      },
    },
  };
</script>
