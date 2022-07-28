<!--
 * Copyright 2022 The kubegems.io Authors
 * 
 * Licensed under the Apache License, Version 2.0 (the "Licens");
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
          <v-btn class="primary--text" small text @click="syncModelIndex">
            <v-icon left small> mdi-clipboard-search </v-icon>
            更新索引
          </v-btn>
          <v-menu v-if="m_permisson_resourceAllow" left>
            <template #activator="{ on }">
              <v-btn icon>
                <v-icon color="primary" x-small v-on="on"> fas fa-ellipsis-v </v-icon>
              </v-btn>
            </template>
            <v-card>
              <v-card-text class="pa-2">
                <v-flex>
                  <v-btn color="primary" small text @click="updateModelRegistry"> 编辑 </v-btn>
                </v-flex>
                <v-flex>
                  <v-btn color="error" small text @click="removeModelRegistry"> 删除 </v-btn>
                </v-flex>
              </v-card-text>
            </v-card>
          </v-menu>
        </v-flex>
      </template>
    </BaseBreadcrumb>
    <v-row class="mt-0">
      <v-col class="pt-0" cols="2">
        <BaseResourceInfo :item="item" />
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

        <component :is="tabItems[tab].value" :ref="tabItems[tab].value" class="mt-3" :item="item" />
      </v-col>
    </v-row>

    <UpdateModelRegistry ref="updateModelRegistry" @refresh="modelRegistryDetail" />
  </v-container>
</template>

<script>
  import { mapState } from 'vuex';

  import BaseResourceInfo from './components/BaseResourceInfo';
  import ModelList from './components/ModelList';
  import UpdateModelRegistry from './components/UpdateModelRegistry';
  import { deleteModelSource, getModelSourceDetail } from '@/api';
  import BasePermission from '@/mixins/permission';
  import BaseResource from '@/mixins/resource';

  export default {
    name: 'ModelRegistryDetail',
    components: {
      BaseResourceInfo,
      ModelList,
      UpdateModelRegistry,
    },
    mixins: [BasePermission, BaseResource],
    data: () => ({
      item: null,
      tab: 0,
      tabItems: [{ text: '模型列表', value: 'ModelList' }],
    }),
    computed: {
      ...mapState(['JWT']),
    },
    mounted() {
      if (this.JWT) {
        this.$nextTick(() => {
          this.modelRegistryDetail();
        });
      }
    },
    methods: {
      async modelRegistryDetail() {
        const data = await getModelSourceDetail(this.$route.params.name);
        this.item = data;
      },
      updateModelRegistry() {
        this.$refs.updateModelRegistry.init(this.item);
        this.$refs.updateModelRegistry.open();
      },
      removeModelRegistry() {
        this.$store.commit('SET_CONFIRM', {
          title: `删除算法模型商店`,
          content: {
            text: `删除算法模型商店 ${this.item.name}`,
            type: 'delete',
            name: this.item.name,
          },
          param: {},
          doFunc: async () => {
            await deleteModelSource(this.item.name);
            this.$router.push({ name: 'model-repository-list' });
          },
        });
      },
      syncModelIndex() {
        this.$store.commit('SET_CONFIRM', {
          title: `更新索引`,
          content: {
            text: `更新 ${this.$route.params.name} 索引`,
            type: 'confirm',
          },
          param: {},
          doFunc: async () => {},
        });
      },
    },
  };
</script>
