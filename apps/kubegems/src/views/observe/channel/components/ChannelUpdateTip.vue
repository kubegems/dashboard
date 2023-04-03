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
  <BaseDialog
    v-model="state.dialog"
    icon="mdi-arrow-up-bold-circle"
    :title="i18nLocal.t('table.status')"
    :width="500"
    @reset="reset"
  >
    <template #content>
      <div class="text-body-2 orange--text px-2">
        <v-icon color="orange" small> mdi-information-variant </v-icon>
        {{ i18nLocal.t('tip.receiver_update') }}
      </div>
      <v-data-table
        class="px-2"
        dense
        :headers="headers"
        hide-default-footer
        item-key="value"
        :items="updateStatusItems"
        :items-per-page="100"
        :no-data-text="i18n.t('data.no_data')"
        :page="1"
      >
        <template #item.cascadeName="{ item }">
          {{ item.cascadeName }}
        </template>
        <template #item.status="{ item }">
          <v-icon v-if="item.status" color="success" small> mdi-check-circle </v-icon>
          <v-icon v-else color="error" small> mdi-close-circle </v-icon>
        </template>
      </v-data-table>
    </template>
  </BaseDialog>
</template>

<script lang="ts" setup>
  import { useGlobalI18n } from '@kubegems/extension/i18n';
  import { ComputedRef, computed, reactive } from 'vue';

  import { useI18n } from '../i18n';

  const i18nLocal = useI18n();
  const i18n = useGlobalI18n();

  const props = withDefaults(
    defineProps<{
      status?: any;
    }>(),
    {
      status: undefined,
    },
  );

  const state = reactive({
    dialog: false,
  });

  const headers = [
    { text: i18nLocal.t('table.cascade_name'), value: 'cascadeName', align: 'start' },
    { text: i18nLocal.t('table.status'), value: 'status', align: 'start' },
  ];

  const updateStatusItems: ComputedRef<{ [key: string]: string | boolean }[]> = computed(() => {
    return Object.keys(props.status).map((k) => {
      return { cascadeName: k, status: props.status[k] };
    });
  });

  const open = (): void => {
    state.dialog = true;
  };

  const reset = (): void => {
    state.dialog = false;
  };

  defineExpose({
    open,
  });
</script>
