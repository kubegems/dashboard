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
  <v-flex>
    <v-sheet v-for="(item, index) in rules || []" :key="index" class="grey lighten-4 rounded mb-3">
      <v-list-item two-line>
        <v-list-item-content class="py-2">
          <v-list-item-subtitle class="text-subtitle-2 py-1 primary--text">
            {{ item.targetName }}
          </v-list-item-subtitle>
          <v-list-item-subtitle v-if="mode === 'template'" class="text-body-2 py-0">
            <v-list-item class="float-left py-0 pl-0" :style="{ width: `250px` }" two-line>
              <v-list-item-content class="py-0">
                <v-list-item-title class="text-subtitle-2 py-1">
                  {{ item.promqlGenerator.rule }}&nbsp;
                </v-list-item-title>
                <v-list-item-subtitle class="text-body-2 py-1"> {{ i18nLocal.t('tip.rule') }} </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
            <v-list-item class="float-left py-0" :style="{ width: `250px` }" two-line>
              <v-list-item-content class="py-0">
                <v-list-item-title class="text-subtitle-2 py-1">
                  {{ item.promqlGenerator.unit }} &nbsp;
                </v-list-item-title>
                <v-list-item-subtitle class="text-body-2 py-1"> {{ i18nLocal.t('tip.unit') }} </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
          </v-list-item-subtitle>
          <v-list-item-subtitle v-else-if="mode === 'ql'" class="text-body-2 py-0">
            <v-list-item class="float-left py-0 pl-0" :style="{ width: `750px` }" two-line>
              <v-list-item-content class="py-0">
                <v-list-item-title class="text-subtitle-2 py-1"> {{ item.expr }}&nbsp; </v-list-item-title>
                <v-list-item-subtitle class="text-body-2 py-1">
                  {{ i18nLocal.t('tip.query_ql') }}
                </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
          </v-list-item-subtitle>
          <div class="kubegems__clear-float" />
        </v-list-item-content>
        <v-btn color="primary" dark fab right text x-small @click="update(index)">
          <v-icon>mdi-pencil</v-icon>
        </v-btn>
        <v-btn color="error" dark fab right text x-small @click="remove(index)">
          <v-icon>mdi-delete</v-icon>
        </v-btn>
      </v-list-item>
    </v-sheet>
    <v-flex class="grey lighten-4 rounded">
      <v-list-item two-line>
        <v-list-item-content class="py-2">
          <v-list-item-subtitle class="text-body-2 py-0 text-center">
            <v-btn color="primary" text @click="expand">
              <v-icon left small> mdi-plus </v-icon>
              {{ i18n.t('operate.add_c', [i18nLocal.t('tip.rule')]) }}
            </v-btn>
          </v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>
    </v-flex>
  </v-flex>
</template>

<script lang="ts" setup>
  import { MonitorTarget } from '@kubegems/api/typed/monitor';
  import { useGlobalI18n } from '@kubegems/extension/i18n';

  import { useI18n } from '../../../i18n';

  const i18nLocal = useI18n();
  const i18n = useGlobalI18n();

  withDefaults(
    defineProps<{
      mode?: string;
      rules?: MonitorTarget[];
    }>(),
    {
      mode: 'template',
      rules: undefined,
    },
  );

  const emits = defineEmits(['updateRule', 'removeRule', 'expandCard']);
  const expand = () => {
    emits('expandCard', 'ruleForm');
  };
  const update = (index: number): void => {
    emits('updateRule', index);
  };
  const remove = (index: number): void => {
    emits('removeRule', index);
  };
</script>
