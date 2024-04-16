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
              backgroundColor: `${POD_STATUS_COLOR[item.phase] || config.theme.THEME_COLOR_EXTEND.error}`,
            }"
          />
          <span>
            {{ item.phase || 'No Status' }}
          </span>
        </template>
        <template #item.url="{ item }">
          <div class="py-1">
            <v-icon class="float-left" color="primary">mdi-alpha-h</v-icon>
            <div class="url">HTTP: {{ item.url }}</div>
            <v-btn
              v-if="item.url"
              v-clipboard:copy="item.url"
              v-clipboard:success="copyed"
              class="float-left url__btn"
              color="primary"
              icon
              small
            >
              <v-icon color="primary" small> mdi-content-copy </v-icon>
            </v-btn>
            <div class="kubegems__clear-float" />
          </div>
          <div v-if="item.grpcURL" class="py-1">
            <v-icon class="float-left" color="primary">mdi-alpha-g</v-icon>
            <div class="url"> GRPC: {{ item.grpcURL }}</div>
            <v-btn
              v-if="item.grpcURL"
              v-clipboard:copy="item.grpcURL"
              v-clipboard:success="copyed"
              class="float-left url__btn"
              color="primary"
              icon
              small
            >
              <v-icon color="primary" small> mdi-content-copy </v-icon>
            </v-btn>
            <div class="kubegems__clear-float" />
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
  import { useAiModelRuntimePagination } from '@kubegems/api/hooks/ai_model';
  import { AIModel, AIModelRuntime } from '@kubegems/api/typed/ai_model';
  import { useGlobalI18n } from '@kubegems/extension/i18n';
  import { useEnvironmentAllow, useProjectAllow, useTenantAllow } from '@kubegems/extension/permission';
  import { useRouter } from '@kubegems/extension/proxy';
  import { useParams, useQuery } from '@kubegems/extension/router';
  import { useStore } from '@kubegems/extension/store';
  import config from '@kubegems/libs/constants/global';
  import { POD_STATUS_COLOR } from '@kubegems/libs/constants/resource';
  import { onMounted, reactive, ref } from 'vue';

  import { useI18n } from '../../../i18n';
  import ModelExperience from './components/ModelExperience.vue';

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
    { text: 'Api(http/grpc)', value: 'url', align: 'start', width: 520 },
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

<style lang="scss" scoped>
  .url {
    width: 440px;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: auto;
    float: left;
    line-height: 24px;

    &__btn {
      margin-top: -2px;
    }
  }
</style>
