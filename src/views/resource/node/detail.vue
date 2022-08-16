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
          <v-menu left>
            <template #activator="{ on }">
              <v-btn icon>
                <v-icon color="primary" small v-on="on"> mdi-dots-vertical </v-icon>
              </v-btn>
            </template>
            <v-card>
              <v-card-text class="pa-2">
                <template v-if="node">
                  <v-flex v-if="node.spec.unschedulable">
                    <v-btn color="primary" small text @click="allowSchedule">
                      {{ $t('operate.allow_schedule') }}
                    </v-btn>
                  </v-flex>
                  <v-flex v-else>
                    <v-btn color="error" small text @click="stopSchedule"> {{ $t('operate.stop_schedule') }} </v-btn>
                  </v-flex>
                </template>
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
            {{ node ? node.metadata.name : '' }}

            <template v-if="tke">
              <v-menu :close-delay="200" open-on-hover top>
                <template #activator="{ on }">
                  <span class="mt-2 mr-2" v-on="on">
                    <BaseLogo icon-name="tke" />
                  </span>
                </template>
                <v-card>
                  <v-card-text class="pa-2"> tencent vcuda </v-card-text>
                </v-card>
              </v-menu>
            </template>
            <template v-if="nvidia">
              <v-menu :close-delay="200" open-on-hover top>
                <template #activator="{ on }">
                  <span class="mt-2 mr-2" v-on="on">
                    <BaseLogo icon-name="nvidia" />
                  </span>
                </template>
                <v-card>
                  <v-card-text class="pa-2"> nvidia </v-card-text>
                </v-card>
              </v-menu>
            </template>
          </v-card-title>
          <v-list-item two-line>
            <v-list-item-content class="kubegems__text">
              <v-list-item-title class="text-subtitle-2"> {{ $root.$t('resource.cluster') }} </v-list-item-title>
              <v-list-item-subtitle class="text-body-2">
                {{ node ? Cluster().ClusterName : '' }}
              </v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
          <v-list-item two-line>
            <v-list-item-content class="kubegems__text">
              <v-list-item-title class="text-subtitle-2"> IP </v-list-item-title>
              <v-list-item-subtitle class="text-body-2">
                {{ node ? node.status.addresses[0].address : '' }}
              </v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
          <v-list-item two-line>
            <v-list-item-content class="kubegems__text">
              <v-list-item-title class="text-subtitle-2"> {{ $t('table.name') }} </v-list-item-title>
              <v-list-item-subtitle class="kubegems__break-all text-body-2">
                {{ node ? node.status.addresses[1].address : '' }}
              </v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
          <v-list-item two-line>
            <v-list-item-content class="kubegems__text">
              <v-list-item-title class="text-subtitle-2"> OS </v-list-item-title>
              <v-list-item-subtitle class="text-body-2">
                {{ node ? node.status.nodeInfo.osImage : '' }}
              </v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
          <v-list-item two-line>
            <v-list-item-content class="kubegems__text">
              <v-list-item-title class="text-subtitle-2"> {{ $root.$t('resource.create_at') }} </v-list-item-title>
              <v-list-item-subtitle class="text-body-2">
                {{
                  node && node.metadata.creationTimestamp ? $moment(node.metadata.creationTimestamp).format('lll') : ''
                }}
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
        <component
          :is="tabItems[tab].value"
          :ref="tabItems[tab].value"
          class="mt-3"
          :item="node"
          :readonly="false"
          :selector="{
            topkind: 'Node',
            topname: node ? node.metadata.name : '',
          }"
        />
      </v-col>
    </v-row>

    <ResourceYaml ref="resourceYaml" :item="node" />
  </v-container>
</template>

<script>
  import VueApexCharts from 'vue-apexcharts';
  import { mapGetters, mapState } from 'vuex';

  import NodeMonitor from './components/NodeMonitor';
  import ResourceInfo from './components/ResourceInfo';
  import Taint from './components/Taint';
  import messages from './i18n';
  import { getNodeDetail, patchCordonNode } from '@/api';
  import BaseResource from '@/mixins/resource';
  import EventList from '@/views/resource/components/common/EventList';
  import PodList from '@/views/resource/components/common/PodList';
  import ResourceYaml from '@/views/resource/components/common/ResourceYaml';
  import Metadata from '@/views/resource/components/metadata/Metadata';

  export default {
    name: 'NodeDetail',
    i18n: {
      messages: messages,
    },
    components: {
      EventList,
      Metadata,
      NodeMonitor,
      PodList,
      ResourceInfo,
      ResourceYaml,
      Taint,
      VueApexCharts,
    },
    mixins: [BaseResource],
    data: () => ({
      tab: 0,
      node: null,
    }),
    computed: {
      ...mapState(['JWT']),
      ...mapGetters(['Cluster']),
      tabItems() {
        const items = [
          { text: this.$root.$t('tab.resurce_info'), value: 'ResourceInfo' },
          { text: this.$root.$t('tab.metadata'), value: 'Metadata' },
          { text: this.$t('tab.taint'), value: 'Taint' },
          { text: this.$root.$t('tab.pod'), value: 'PodList' },
          { text: this.$root.$t('tab.event'), value: 'EventList' },
          { text: this.$root.$t('tab.monitor'), value: 'NodeMonitor' },
        ];
        return items;
      },
      tke() {
        if (this?.node?.metadata?.labels) {
          return this.node.metadata.labels['tencent.com/vcuda'] === 'true';
        }
        return false;
      },
      nvidia() {
        if (this?.node?.metadata?.labels) {
          return this.node.metadata.labels['nvidia.com/gpu'] === 'true';
        }
        return false;
      },
    },
    mounted() {
      if (this.JWT) {
        this.$nextTick(() => {
          this.nodeDetail();
        });
      }
    },
    methods: {
      async nodeDetail() {
        const data = await getNodeDetail(this.ThisCluster, this.$route.params.name);
        this.node = data;
      },
      stopSchedule() {
        const item = this.node;
        this.$store.commit('SET_CONFIRM', {
          title: this.$t('operate.stop_schedule'),
          content: {
            text: `${this.$t('operate.stop_schedule')} ${item.metadata.name}`,
            type: 'confirm',
          },
          param: { item },
          doFunc: async (param) => {
            await patchCordonNode(this.ThisCluster, param.item.metadata.name, {
              Unschedulable: true,
            });
            this.nodeDetail();
          },
        });
      },
      allowSchedule() {
        const item = this.node;
        this.$store.commit('SET_CONFIRM', {
          title: this.$t('operate.allow_schedule'),
          content: {
            text: `${this.$t('operate.allow_schedule')} ${item.metadata.name}`,
            type: 'confirm',
          },
          param: { item },
          doFunc: async (param) => {
            await patchCordonNode(this.ThisCluster, param.item.metadata.name, {
              Unschedulable: false,
            });
            this.nodeDetail();
          },
        });
      },
      resourceYaml() {
        this.$refs.resourceYaml.open();
      },
    },
  };
</script>
