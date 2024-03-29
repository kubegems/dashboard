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
  <v-card class="mt-3">
    <v-card-title class="py-4">
      <v-spacer />
    </v-card-title>
    <v-data-table
      class="mx-4"
      disable-sort
      :headers="headers"
      hide-default-footer
      :items="pagination.items"
      :items-per-page="pagination.size"
      :no-data-text="i18n.t('data.no_data')"
      :page.sync="pagination.page"
    >
      <template #[`item.name`]="{ item }">
        <a class="text-subtitle-2" @click.stop>
          {{ item.metadata.name }}
        </a>
      </template>
      <template #[`item.label`]="{ item, index }">
        <BaseCollapseChips
          :id="`edge_ns_label_${index}`"
          :chips="item.metadata.labels || {}"
          icon="mdi-label"
          single-line
        />
      </template>
      <template #[`item.status`]="{ item }">
        {{ item.status.phase }}
      </template>
      <template #[`item.createAt`]="{ item }">
        {{ item.metadata.creationTimestamp ? moment(item.metadata.creationTimestamp).format('lll') : '' }}
      </template>
    </v-data-table>

    <BasePagination
      v-if="pagination.pageCount >= 1"
      v-model="pagination.page"
      :page-count="pagination.pageCount"
      :size="pagination.size"
      @changepage="pageChange"
      @changesize="sizeChange"
      @loaddata="getNamespaceList"
    />
  </v-card>
</template>

<script lang="ts" setup>
  import { useNamespacePagination } from '@kubegems/api/hooks/namespace';
  import { Namespace } from '@kubegems/api/typed/namespace';
  import { useGlobalI18n } from '@kubegems/extension/i18n';
  import { useRouter } from '@kubegems/extension/proxy';
  import { useParams, useQuery } from '@kubegems/extension/router';
  import moment from 'moment';
  import { onMounted, reactive } from 'vue';

  import { useI18n } from '../i18n';

  onMounted(() => {
    getNamespaceList();
  });

  const router = useRouter();
  const i18n = useGlobalI18n();
  const i18nLocal = useI18n();
  const query = useQuery();
  const routeParams = useParams();

  const headers = [
    { text: i18nLocal.t('table.name'), value: 'name', align: 'start' },
    { text: i18nLocal.t('table.label'), value: 'label', align: 'start' },
    { text: i18nLocal.t('table.status'), value: 'status', align: 'start' },
    { text: i18nLocal.t('table.create_at'), value: 'createAt', align: 'start', width: 180 },
    { text: '', value: 'action', align: 'center', width: 20 },
  ];

  let pagination: Pagination<Namespace> = reactive<Pagination<Namespace>>({
    page: 1,
    size: 10,
    pageCount: 0,
    items: [],
  });

  const getNamespaceList = async (params: KubePaginationRequest = pagination): Promise<void> => {
    const data: Pagination<Namespace> = await useNamespacePagination(
      new Namespace(),
      routeParams.value.name,
      params.page,
      params.size,
    );
    pagination = Object.assign(pagination, data);
    router.replace({ query: { ...query.value, page: pagination.page.toString(), size: pagination.size.toString() } });
  };

  const pageChange = (page: number): void => {
    pagination.page = page;
  };

  const sizeChange = (size: number): void => {
    pagination.page = 1;
    pagination.size = size;
  };
</script>
