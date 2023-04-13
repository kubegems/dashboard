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
    <Breadcrumb sync-status @setOnline="setOnline">
      <template #extend>
        <v-flex class="kubegems__full-right">
          <v-btn class="primary--text" small text @click="deployModel">
            <v-icon left small> mdi-rocket </v-icon>
            {{ i18n.t('operate.deploy') }}
          </v-btn>
          <v-btn v-if="!state.online" class="primary--text" small text @click="refreshModel">
            <v-icon left small>mdi-refresh</v-icon>
            {{ i18n.t('operate.refresh') }}
          </v-btn>
          <v-btn class="primary--text" small text @click="returnModel">
            <v-icon left small>mdi-reply</v-icon>
            {{ i18n.t('operate.return') }}
          </v-btn>
        </v-flex>
      </template>
    </Breadcrumb>
    <v-row class="mt-0">
      <v-col class="pt-0" cols="3">
        <ModelInfo :item="aiModel" @refresh="refresh" @selcetVersion="selcetVersion" />
      </v-col>
      <v-col class="pt-0" cols="9">
        <v-card flat>
          <v-card-text>
            <v-tabs v-model="state.tab" height="30">
              <v-tab v-for="item in tabItems" :key="item.tab">
                {{ item.text }}
              </v-tab>
            </v-tabs>
          </v-card-text>
        </v-card>
        <component :is="tabItems[state.tab].value" :ref="tabItems[state.tab].tab" :item="aiModel" @refresh="refresh" />
      </v-col>
    </v-row>

    <Deploy ref="deploy" :item="aiModel" />
  </v-container>
</template>

<script lang="ts" setup>
  import { AIModel } from '@kubegems/api/typed/ai_model';
  import { useGlobalI18n } from '@kubegems/extension/i18n';
  import { useRouter } from '@kubegems/extension/proxy';
  import { useParams, useQuery } from '@kubegems/extension/router';
  import { useStore } from '@kubegems/extension/store';
  import { nextTick, onMounted, reactive, ref, watch } from 'vue';

  import Breadcrumb from './components/Breadcrumb.vue';
  import Deploy from './components/Deploy.vue';
  // import Certificate from './components/detail_tabs/Certificate/index.vue';
  import Comment from './components/detail_tabs/Comment/index.vue';
  import Description from './components/detail_tabs/Description/index.vue';
  import Files from './components/detail_tabs/Files.vue';
  import Runtime from './components/detail_tabs/Runtime/index.vue';
  import ModelInfo from './components/ModelInfo/index.vue';
  import { useI18n } from './i18n';

  const i18nLocal = useI18n();
  const i18n = useGlobalI18n();
  const router = useRouter();
  const store = useStore();
  const query = useQuery();
  const params = useParams();

  const tabMap = {
    description: 0,
    files: 1,
    comment: 2,
    runtime: 3,
    certificate: 4,
  };
  const tabItems = [
    { text: i18nLocal.t('tab.description'), value: Description, tab: 'description' },
    { text: i18nLocal.t('tab.files'), value: Files, tab: 'files' },
    { text: i18nLocal.t('tab.comment'), value: Comment, tab: 'comment' },
    { text: i18nLocal.t('tab.runtime'), value: Runtime, tab: 'runtime' },
    // { text: i18nLocal.t('tab.certificate'), value: Certificate, tab: 'certificate' },
  ];

  const state = reactive({
    tab: tabMap[query.value.tab] || 0,
    online: true,
  });
  watch(
    () => state.tab,
    () => {
      router.replace({
        params: { ...params.value },
        query: { ...query.value, tab: tabItems[state.tab].tab },
      });
    },
  );

  const aiModel = ref<AIModel>(undefined);
  const getModelDetail = async (): Promise<void> => {
    const data = await new AIModel({ name: params.value.name }).getModel(query.value.registry);
    const ratingData = await new AIModel({
      source: query.value.registry,
      name: params.value.name,
    }).getModelRateInfo();
    aiModel.value = new AIModel({ ...data, rating: { ...ratingData } });
  };

  onMounted(() => {
    nextTick(() => {
      getModelDetail();
    });
  });

  const deploy = ref(null);
  const deployModel = (): void => {
    deploy.value.open();
  };

  const refresh = (): void => {
    getModelDetail();
  };

  const returnModel = (): void => {
    router.push({
      name: 'modelstore-center',
      query: {
        registry: query.value.registry,
      },
    });
  };

  const version = ref<string>('');
  const selcetVersion = (ver: string): void => {
    version.value = ver;
  };
  watch(
    () => version,
    (newValue) => {
      if (!newValue) return;
      aiModel.value = { ...aiModel.value, v: newValue };
    },
    { immediate: true, deep: true },
  );

  const refreshModel = (): void => {
    store.commit('SET_CONFIRM', {
      title: i18n.t('operate.refresh'),
      content: {
        text: `${i18n.t('operate.refresh')} ${params.value.name}`,
        type: 'confirm',
      },
      param: {},
      doFunc: async () => {
        await new AIModel({ source: query.value.registry, name: params.value.name }).syncModel();
        getModelDetail();
      },
    });
  };

  const setOnline = (online: boolean): void => {
    state.online = online;
  };
</script>
