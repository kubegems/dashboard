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
                  <v-btn color="primary" small text @click="updateFlow"> {{ $root.$t('operate.edit') }} </v-btn>
                </v-flex>
                <v-flex>
                  <v-btn color="error" small text @click="removeFlow"> {{ $root.$t('operate.delete') }} </v-btn>
                </v-flex>
              </v-card-text>
            </v-card>
          </v-menu>
        </v-flex>
      </template>
    </BaseBreadcrumb>
    <v-row v-if="flow" class="mt-0">
      <!-- 基本信息 -->
      <v-col class="pt-0" cols="2">
        <BasicResourceInfo :item="flow" />
      </v-col>
      <!-- 基本信息 -->

      <!-- 配置 -->
      <v-col class="pt-0" cols="10">
        <v-card>
          <v-tabs v-model="tab" class="rounded-t pa-3" height="30">
            <v-tab v-for="item in tabItems" :key="item.value">
              {{ item.text }}
            </v-tab>
          </v-tabs>
        </v-card>
        <component :is="tabItems[tab].value" :ref="tabItems[tab].value" class="mt-3" :item="flow" />
      </v-col>
      <!-- 配置 -->
    </v-row>

    <ResourceYaml ref="resourceYaml" :item="flow" />

    <UpdateFlow ref="updateFlow" @refresh="getFlowDetail" />
  </v-container>
</template>

<script>
  import { mapState } from 'vuex';

  import ResourceInfo from './components/ResourceInfo';
  import UpdateFlow from './components/UpdateFlow';
  import { deleteClusterFlowData, deleteFlowData, getClusterFlowDetailData, getFlowDetailData } from '@/api';
  import BasePermission from '@/mixins/permission';
  import BasicResourceInfo from '@/views/resource/components/common/BasicResourceInfo';
  import ResourceYaml from '@/views/resource/components/common/ResourceYaml';
  import Metadata from '@/views/resource/components/metadata/Metadata';

  export default {
    name: 'FlowDetail',
    components: {
      BasicResourceInfo,
      Metadata,
      ResourceInfo,
      ResourceYaml,
      UpdateFlow,
    },
    mixins: [BasePermission],
    data() {
      return {
        flow: null,
        tab: 0,
      };
    },
    computed: {
      ...mapState(['AdminViewport']),
      tabItems() {
        return [
          { text: this.$root.$t('tab.resource_info'), value: 'ResourceInfo' },
          { text: this.$root.$t('tab.metadata'), value: 'Metadata' },
        ];
      },
    },
    mounted() {
      this.getFlowDetail();
    },
    methods: {
      async getFlowDetail() {
        const { cluster, namespace } = this.$route.query;
        const { name, kind } = this.$route.params;
        const action = kind === 'Flow' ? getFlowDetailData : getClusterFlowDetailData;
        this.flow = await action(cluster, namespace, name);
      },
      resourceYaml() {
        this.$refs.resourceYaml.open();
      },
      updateFlow() {
        this.$refs.updateFlow.init(this.flow);
        this.$refs.updateFlow.open();
      },
      removeFlow() {
        const item = this.flow;
        this.$store.commit('SET_CONFIRM', {
          title: this.$root.$t('operate.delete_c', [this.$root.$t('resource.flow')]),
          content: {
            text: `${this.$root.$t('operate.delete_c', [this.$root.$t('resource.flow')])} ${item.metadata.name}`,
            type: 'delete',
            name: item.metadata.name,
          },
          param: { item },
          doFunc: async (param) => {
            const action = item.kind === 'Flow' ? deleteFlowData : deleteClusterFlowData;
            await action(this.$route.query.cluster, this.$route.query.namespace, param.item.metadata.name);
            this.$router.push({
              name: this.AdminViewport ? 'admin-log-config' : 'log-config',
              params: this.$route.params,
              query: {
                cluster: this.$route.query.cluster,
                namespace: this.$route.query.namespace,
                proj: this.$route.query.proj,
                env: this.$route.query.env,
                tab: 'flow',
              },
            });
          },
        });
      },
    },
  };
</script>
