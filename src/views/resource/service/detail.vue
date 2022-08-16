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
          <v-btn class="primary--text" small text @click="resourceYaml">
            <v-icon left small> mdi-code-json </v-icon>
            YAML
          </v-btn>
          <v-menu v-if="m_permisson_resourceAllow" left>
            <template #activator="{ on }">
              <v-btn icon>
                <v-icon color="primary" small v-on="on"> mdi-dots-vertical </v-icon>
              </v-btn>
            </template>
            <v-card>
              <v-card-text class="pa-2">
                <v-flex>
                  <v-btn color="primary" small text @click="updateService"> {{ $root.$t('operate.edit') }} </v-btn>
                </v-flex>
                <v-flex>
                  <v-btn color="error" small text @click="removeService"> {{ $root.$t('operate.delete') }} </v-btn>
                </v-flex>
              </v-card-text>
            </v-card>
          </v-menu>
        </v-flex>
      </template>
    </BaseBreadcrumb>
    <v-row class="mt-0">
      <v-col class="pt-0" cols="2">
        <BasicResourceInfo :item="service" />
      </v-col>
      <v-col class="pt-0" cols="10">
        <v-card flat>
          <v-card-text class="pa-0">
            <template v-if="service">
              <v-tabs v-model="tab" class="rounded-t pa-3" height="30">
                <v-tab v-for="item in tabItems" :key="item.value">
                  {{ item.text }}
                </v-tab>
              </v-tabs>
            </template>
          </v-card-text>
        </v-card>

        <component
          :is="tabItems[tab].value"
          :ref="tabItems[tab].value"
          class="mt-3"
          :item="service"
          :selector="selector"
        />
      </v-col>
    </v-row>

    <ResourceYaml ref="resourceYaml" :item="service" />
    <UpdateService ref="updateService" @refresh="serviceDetail" />
  </v-container>
</template>

<script>
  import { mapState } from 'vuex';

  import ResourceInfo from './components/ResourceInfo';
  import UpdateService from './components/UpdateService';
  import { deleteService, getServiceDetail } from '@/api';
  import BasePermission from '@/mixins/permission';
  import BaseResource from '@/mixins/resource';
  import BasicResourceInfo from '@/views/resource/components/common/BasicResourceInfo';
  import EventList from '@/views/resource/components/common/EventList';
  import PodList from '@/views/resource/components/common/PodList';
  import ResourceYaml from '@/views/resource/components/common/ResourceYaml';
  import Metadata from '@/views/resource/components/metadata/Metadata';

  export default {
    name: 'ServiceDetail',
    components: {
      BasicResourceInfo,
      EventList,
      Metadata,
      PodList,
      ResourceInfo,
      ResourceYaml,
      UpdateService,
    },
    mixins: [BasePermission, BaseResource],
    data: () => ({
      service: null,
      tab: 0,
    }),
    computed: {
      ...mapState(['JWT']),
      selector() {
        if (this.tabItems[this.tab].value === 'PodList') {
          if (this.service) {
            const selector = {};
            for (const key in this.service.spec.selector) {
              selector[`labels[${key}]`] = this.service.spec.selector[key];
            }
            return selector;
          }
        } else if (this.tabItems[this.tab].value === 'EventList') {
          return {
            topkind: 'Service',
            topname: this.service ? this.service.metadata.name : '',
          };
        }
        return {};
      },
      tabItems() {
        const items = [
          { text: this.$root.$t('tab.resource_info'), value: 'ResourceInfo' },
          { text: this.$root.$t('tab.metadata'), value: 'Metadata' },
          { text: this.$root.$t('tab.event'), value: 'EventList' },
        ];
        if (this.service && this.service.spec.type !== 'ExternalName') {
          items.splice(2, 0, { text: this.$root.$t('tab.pod'), value: 'PodList' });
        }
        return items;
      },
    },
    mounted() {
      if (this.JWT) {
        this.$nextTick(() => {
          this.serviceDetail();
        });
      }
    },
    methods: {
      async serviceDetail() {
        const data = await getServiceDetail(this.ThisCluster, this.$route.query.namespace, this.$route.params.name);
        this.service = data;
      },
      resourceYaml() {
        this.$refs.resourceYaml.open();
      },
      updateService() {
        this.$refs.updateService.init(this.service);
        this.$refs.updateService.open();
      },
      removeService() {
        const item = this.service;
        this.$store.commit('SET_CONFIRM', {
          title: this.$root.$t('operate.delete_c', [this.$root.$t('resource.service')]),
          content: {
            text: `${this.$root.$t('operate.delete_c', [this.$root.$t('resource.service')])} ${item.metadata.name}`,
            type: 'delete',
            name: item.metadata.name,
          },
          param: { item },
          doFunc: async (param) => {
            await deleteService(this.ThisCluster, this.$route.query.namespace, param.item.metadata.name);
            this.$router.push({ name: 'service-list', params: this.$route.params });
          },
        });
      },
    },
  };
</script>
