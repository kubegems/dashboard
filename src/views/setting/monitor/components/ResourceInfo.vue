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
  <div>
    <v-card>
      <v-sheet class="pa-2">
        <BaseListItemForDetail :mt="0" :title="i18nLocal.t('tip.start')">
          <template #content>
            {{ template ? template.start : '' }}
          </template>
        </BaseListItemForDetail>

        <BaseListItemForDetail :title="i18nLocal.t('tip.end')">
          <template #content>
            {{ template ? template.end : '' }}
          </template>
        </BaseListItemForDetail>

        <BaseListItemForDetail :title="i18nLocal.t('tip.step')">
          <template #content>
            {{ template ? template.step : '' }}
          </template>
        </BaseListItemForDetail>
      </v-sheet>
    </v-card>

    <v-card class="mt-3" flat>
      <BaseSubTitle class="pt-2" :divider="false" :title="i18nLocal.t('tip.rule')" />
      <v-simple-table class="mx-2 pa-2 pb-3">
        <template #default>
          <thead>
            <tr>
              <th class="text-left">{{ i18nLocal.t('table.name') }}</th>
              <th class="text-left">{{ i18nLocal.t('table.generator') }}</th>
              <th class="text-left">{{ i18nLocal.t('table.unit') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in template ? template.graphs : []" :key="index">
              <td> {{ item.name }} </td>
              <td>
                <div v-for="(target, idx) in item.targets" :key="idx">
                  {{ target.targetName }}:
                  <template v-if="target.promqlGenerator">
                    {{ target.promqlGenerator.scope }} | {{ target.promqlGenerator.resource }} |
                    {{ target.promqlGenerator.rule }}
                  </template>
                  <template v-else>
                    {{ target.expr }}
                  </template>
                </div>
              </td>
              <td> {{ item.unit }} </td>
            </tr>
          </tbody>
        </template>
      </v-simple-table>
    </v-card>
  </div>
</template>

<script lang="ts" setup>
  import { useI18n } from '../i18n';
  import { MonitorTemplate } from '@/types/monitor_template';

  const i18nLocal = useI18n();

  withDefaults(
    defineProps<{
      template?: MonitorTemplate;
    }>(),
    {
      template: undefined,
    },
  );
</script>
