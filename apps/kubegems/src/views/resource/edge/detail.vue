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
    <BaseViewportHeader />
    <BaseBreadcrumb>
      <template #extend>
        <v-flex class="kubegems__full-right">
          <BaseDatetimePicker v-if="tab === 0" v-model="date" :default-value="30" />
          <v-menu left>
            <template #activator="{ on }">
              <v-btn icon>
                <v-icon color="primary" small v-on="on"> mdi-dots-vertical </v-icon>
              </v-btn>
            </template>
            <v-card>
              <v-card-text class="pa-2 text-center">
                <v-flex>
                  <v-btn color="primary" small text @click="openTerminal"> Kubectl </v-btn>
                </v-flex>
                <v-flex>
                  <v-btn color="primary" small text @click="updateEdgeCluster"> {{ $root.$t('operate.edit') }} </v-btn>
                </v-flex>
              </v-card-text>
            </v-card>
          </v-menu>
        </v-flex>
      </template>
    </BaseBreadcrumb>

    <v-card>
      <v-card-text class="pa-3">
        <v-tabs v-model="tab" class="rounded-t" height="30" @change="tabChange">
          <v-tab v-for="item in tabItems" :key="item.tab">
            {{ item.text }}
          </v-tab>
        </v-tabs>
      </v-card-text>
    </v-card>

    <component :is="tabItems[tab].value" :date="date" />

    <EdgeClusterForm ref="edgeCluster" in-env @refresh="getEdgeCluster" />
    <Terminal ref="terminal" />
  </v-container>
</template>

<script lang="ts" setup>
  import { EdgeCluster } from '@kubegems/api/typed/edge_cluster';
  import Terminal from '@kubegems/components/logicComponents/Terminal/index.vue';
  import { useRouter } from '@kubegems/extension/proxy';
  import { useParams, useQuery } from '@kubegems/extension/router';
  import { useStore } from '@kubegems/extension/store';
  import { nextTick, onMounted, ref } from 'vue';

  import EdgeClusterC from './components/EdgeCluster.vue';
  import Namespace from './components/Namespace.vue';
  import Node from './components/Node.vue';
  import { useI18n } from './i18n';
  import EdgeClusterForm from '@/views/resource/cluster/components/EdgeClusterForm/index.vue';

  const router = useRouter();
  const i18nLocal = useI18n();
  const store = useStore();
  const query = useQuery();
  const routeParams = useParams();

  onMounted(() => {
    nextTick(() => {
      store.commit('SET_EDGE', routeParams.value.name);
    });
  });

  const tabMap = {
    edge: 0,
    node: 1,
    namespace: 2,
  };

  const tab = ref<number>(tabMap[query.value.tab as string] || 0);

  const tabItems = [
    { text: i18nLocal.t('tab.detail'), value: EdgeClusterC, tab: 'edge' },
    { text: i18nLocal.t('tab.node'), value: Node, tab: 'node' },
    { text: i18nLocal.t('tab.namespace'), value: Namespace, tab: 'namespace' },
  ];

  const tabChange = (): void => {
    router.replace({
      query: { ...query.value, tab: tabItems[tab.value].tab },
    });
  };

  const date = ref([]);

  const getEdgeCluster = async (): Promise<EdgeCluster> => {
    const item: EdgeCluster = await new EdgeCluster({ metadata: { name: routeParams.value.name } }).getEdgeCluster();
    return item;
  };

  const edgeCluster = ref(null);
  const updateEdgeCluster = async (): Promise<void> => {
    const item: EdgeCluster = await getEdgeCluster();
    edgeCluster.value.init(item);
    edgeCluster.value.open();
  };

  const terminal = ref(null);
  const openTerminal = async (): Promise<void> => {
    const item: EdgeCluster = await getEdgeCluster();
    terminal.value.init(null, item, 'kubectl', true);
    terminal.value.open();
  };
</script>
