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
  <v-card class="mt-3" flat>
    <v-card-text>
      <v-data-table
        disable-sort
        :headers="headers"
        hide-default-footer
        item-key="creationTimestamp"
        :items="pagination.items"
        :items-per-page="pagination.size"
        :no-data-text="i18n.t('data.no_data')"
        :page.sync="pagination.page"
      >
        <template #item.name="{ item }">
          <a class="text-subtitle-2 kubegems__inline_flex" @click.stop="toEnvironmentModelList(item)">
            {{ item.name }}
          </a>
        </template>
        <template #item.phase="{ item }">
          <span
            :class="`v-avatar mr-2 ${['Pending'].indexOf(item.phase) > -1 ? 'kubegems__waiting-flashing' : ''}`"
            :style="{
              height: '10px',
              minWidth: '10px',
              width: '10px',
              backgroundColor: `${POD_STATUS_COLOR[item.phase] || '#ff5252'}`,
            }"
          />
          <span>
            {{ item.phase || 'No Status' }}
          </span>
        </template>
        <template #item.url="{ item }">
          <div class="py-1">
            <v-icon color="primary">mdi-alpha-h</v-icon>
            HTTP: {{ item.url }}
            <v-btn v-if="item.url" v-clipboard:copy="item.url" v-clipboard:success="copyed" color="primary" icon small>
              <v-icon color="primary" small> mdi-content-copy </v-icon>
            </v-btn>
          </div>
          <div class="py-1">
            <v-icon color="primary">mdi-alpha-g</v-icon>
            GRPC: {{ item.grpcURL }}
            <v-btn
              v-if="item.grpcURL"
              v-clipboard:copy="item.grpcURL"
              v-clipboard:success="copyed"
              color="primary"
              icon
              small
            >
              <v-icon color="primary" small> mdi-content-copy </v-icon>
            </v-btn>
          </div>
        </template>
        <template #item.preview="{ item }">
          <v-btn
            v-if="item.phase === 'Running' && (query.registry === 'huggingface' || query.registry === 'openmmlab')"
            color="primary"
            small
            text
            @click="experienceModel(item)"
          >
            <v-icon color="primary" left> mdi-eye </v-icon>
            {{ i18nLocal.t('operate.experience') }}
          </v-btn>
        </template>
      </v-data-table>
      <BasePagination
        v-if="pagination.pageCount >= 1"
        v-model="pagination.page"
        :page-count="pagination.pageCount"
        :size="pagination.size"
        @changepage="pageChange"
        @changesize="sizeChange"
        @loaddata="getRuntimeList"
      />
    </v-card-text>

    <ModelExperience ref="experience" :item="item" />
  </v-card>
</template>

<script lang="ts" setup>
  import { onMounted, reactive, ref } from 'vue';

  import { useI18n } from '../../../i18n';
  import ModelExperience from './components/ModelExperience.vue';
  import { useAiModelRuntimePagination } from '@/composition/ai_model';
  import { useEnvironmentAllow, useProjectAllow, useTenantAllow } from '@/composition/permission';
  import { useRouter } from '@/composition/router';
  import { POD_STATUS_COLOR } from '@/constants/resource';
  import { useGlobalI18n } from '@/i18n';
  import { useParams, useQuery } from '@/router';
  import { useStore } from '@/store';
  import { AIModel, AIModelRuntime } from '@/types/ai_model';

  withDefaults(
    defineProps<{
      item?: AIModel;
    }>(),
    {
      item: undefined,
    },
  );

  const i18n = useGlobalI18n();
  const i18nLocal = useI18n();
  const store = useStore();
  const router = useRouter();
  const query = useQuery();
  const params = useParams();

  const headers = [
    { text: i18nLocal.t('table.deploy_instance'), value: 'name', align: 'start' },
    { text: i18nLocal.t('table.model_version'), value: 'modelVersion', align: 'start' },
    { text: i18nLocal.t('table.status'), value: 'phase', align: 'start' },
    { text: i18n.t('resource.cluster'), value: 'cluster', align: 'start' },
    { text: i18n.t('resource.namespace'), value: 'namespace', align: 'start' },
    { text: i18nLocal.t('table.creator'), value: 'creator', align: 'start' },
    { text: 'Api(http/grpc)', value: 'url', align: 'start' },
    { text: '', value: 'preview', align: 'start', width: 50 },
  ];

  let pagination: Pagination<AIModelRuntime> = reactive<Pagination<AIModelRuntime>>({
    page: 1,
    size: 10,
    pageCount: 0,
    items: [],
  });

  const pageChange = (page: number): void => {
    pagination.page = page;
  };

  const sizeChange = (size: number): void => {
    pagination.page = 1;
    pagination.size = size;
  };

  const getRuntimeList = async (param: KubePaginationRequest = pagination): Promise<void> => {
    const data: Pagination<AIModelRuntime> = await useAiModelRuntimePagination(
      new AIModelRuntime(),
      query.value.registry,
      params.value.name,
      param.page,
      param.size,
    );
    pagination = Object.assign(pagination, data);
  };

  onMounted(() => {
    getRuntimeList();
  });

  const toEnvironmentModelList = (item: AIModelRuntime): void => {
    if (useEnvironmentAllow(item.environment) || useProjectAllow(item.project) || useTenantAllow(item.tenant)) {
      router.push({
        name: 'app-list',
        params: {
          tenant: item.tenant,
          project: item.project,
          environment: item.environment,
        },
        query: {
          kind: 'modelstore',
          tab: 'modelstore',
        },
      });
    } else {
      store.commit('SET_SNACKBAR', {
        text: i18nLocal.t('tip.no_access'),
        color: 'warning',
      });
    }
  };

  const experience = ref(null);
  const experienceModel = (item: AIModelRuntime): void => {
    if (item?.phase !== 'Running') {
      store.commit('SET_SNACKBAR', {
        text: i18nLocal.t('tip.status_error'),
        color: 'warning',
      });
      return;
    }
    experience.value.init(item);
    experience.value.open();
  };

  const copyed = (): void => {
    store.commit('SET_SNACKBAR', {
      text: i18nLocal.t('tip.copyed'),
      color: 'success',
    });
  };
</script>
