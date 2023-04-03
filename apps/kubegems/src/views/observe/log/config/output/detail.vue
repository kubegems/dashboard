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
                  <v-btn color="primary" small text @click="updateOutput"> {{ $root.$t('operate.edit') }} </v-btn>
                </v-flex>
                <v-flex>
                  <v-btn color="error" small text @click="removeOutput"> {{ $root.$t('operate.delete') }} </v-btn>
                </v-flex>
              </v-card-text>
            </v-card>
          </v-menu>
        </v-flex>
      </template>
    </BaseBreadcrumb>
    <v-row v-if="output" class="mt-0">
      <!-- 基本信息 -->
      <v-col class="pt-0" cols="2">
        <BasicResourceInfo :item="output" />
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
        <component :is="tabItems[tab].value" :ref="tabItems[tab].value" class="mt-3" :item="output" />
      </v-col>
      <!-- 配置 -->
    </v-row>

    <ResourceYaml ref="resourceYaml" :item="output" />

    <UpdateOutput ref="updateOutput" @refresh="getOutputDetail" />
  </v-container>
</template>

<script>
  import { mapState } from 'vuex';

  import ResourceInfo from './components/ResourceInfo';
  import UpdateOutput from './components/UpdateOutput';
  import { deleteClusterOutputData, deleteOutputData, getClusterOutputDetailData, getOutputDetailData } from '@/api';
  import BasePermission from '@/mixins/permission';
  import BasicResourceInfo from '@/views/resource/components/common/BasicResourceInfo';
  import ResourceYaml from '@/views/resource/components/common/ResourceYaml';
  import Metadata from '@/views/resource/components/metadata/Metadata';

  export default {
    name: 'OutputDetail',
    components: {
      BasicResourceInfo,
      Metadata,
      ResourceInfo,
      ResourceYaml,
      UpdateOutput,
    },
    mixins: [BasePermission],
    data() {
      return {
        output: null,
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
      this.getOutputDetail();
    },
    methods: {
      async getOutputDetail() {
        const { cluster, namespace } = this.$route.query;
        const { name, kind } = this.$route.params;
        const action = kind === 'Output' ? getOutputDetailData : getClusterOutputDetailData;
        this.output = await action(cluster, namespace, name);
      },
      resourceYaml() {
        this.$refs.resourceYaml.open();
      },
      updateOutput() {
        this.$refs.updateOutput.init(this.output);
        this.$refs.updateOutput.open();
      },
      removeOutput() {
        const item = this.output;
        this.$store.commit('SET_CONFIRM', {
          title: this.$root.$t('operate.create_c', [this.$root.$t('resource.output')]),
          content: {
            text: `${this.$root.$t('operate.create_c', [this.$root.$t('resource.output')])} ${item.metadata.name}`,
            type: 'delete',
            name: item.metadata.name,
          },
          param: { item },
          doFunc: async (param) => {
            const action = item.kind === 'Output' ? deleteOutputData : deleteClusterOutputData;
            await action(this.$route.query.cluster, this.$route.query.namespace, param.item.metadata.name);
            this.$router.push({
              name: this.AdminViewport ? 'admin-log-config' : 'log-config',
              params: this.$route.params,
              query: {
                cluster: this.$route.query.cluster,
                namespace: this.$route.query.namespace,
                proj: this.$route.query.proj,
                env: this.$route.query.env,
                tab: 'output',
              },
            });
          },
        });
      },
    },
  };
</script>
