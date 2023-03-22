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
    <v-sheet v-for="(item, index) in labelMatchers" :key="index" class="grey lighten-4 rounded mb-3">
      <v-list-item two-line>
        <v-list-item-content class="py-2">
          <v-list-item-subtitle class="text-body-2 py-0">
            <v-list-item class="float-left py-0 pl-0" :style="{ width: `270px` }" two-line>
              <v-list-item-content class="py-0">
                <v-list-item-title class="text-subtitle-2 py-1 primary--text">
                  {{ i18nLocal.t('tip.label') }}
                </v-list-item-title>
                <v-list-item-subtitle class="text-body-2 py-1">
                  {{ item.name }}
                </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
            <v-list-item class="float-left py-0 pl-0" :style="{ width: `100px` }" two-line>
              <v-list-item-content class="py-0">
                <v-list-item-title class="text-subtitle-2 py-1 primary--text">
                  {{ i18nLocal.t('tip.operate') }}
                </v-list-item-title>
                <v-list-item-subtitle class="text-body-2 py-1">
                  {{ item.type }}
                </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
            <v-list-item class="float-left py-0 pl-0" :style="{ width: `440px` }" two-line>
              <v-list-item-content class="py-0">
                <v-list-item-title class="text-subtitle-2 py-1 primary--text">
                  {{ i18nLocal.t('tip.label_value') }}
                </v-list-item-title>
                <v-list-item-subtitle class="text-body-2 py-1">
                  {{ item.value || i18n.t('data.no_data') }}
                </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
          </v-list-item-subtitle>
          <div class="kubegems__clear-float" />
        </v-list-item-content>
        <v-btn color="primary" dark fab right text x-small @click="updateMatcher(index)">
          <v-icon>mdi-pencil</v-icon>
        </v-btn>
        <v-btn color="error" dark fab right text x-small @click="removeMatcher(index)">
          <v-icon>mdi-delete</v-icon>
        </v-btn>
      </v-list-item>
    </v-sheet>
    <v-flex class="grey lighten-4 rounded">
      <v-list-item two-line>
        <v-list-item-content class="py-2">
          <v-list-item-subtitle class="text-body-2 py-0 text-center">
            <v-btn color="primary" text @click="expandCard">
              <v-icon left small> mdi-plus </v-icon>
              {{ i18n.t('operate.add_c', [i18nLocal.t('tip.label_match')]) }}
            </v-btn>
          </v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>
    </v-flex>
  </v-flex>
</template>

<script lang="ts" setup>
  import { useI18n } from '../../../../../i18n';
  import { useGlobalI18n } from '@/i18n';

  type Matcher = {
    type?: string;
    name?: string;
    value?: string;
  };

  withDefaults(
    defineProps<{
      labelMatchers?: Matcher[];
    }>(),
    {
      labelMatchers: undefined,
    },
  );

  const i18nLocal = useI18n();
  const i18n = useGlobalI18n();

  const emits = defineEmits(['updateMatcher', 'removeMatcher', 'expandCard']);
  const updateMatcher = (index: number): void => {
    emits('updateMatcher', index);
  };

  const removeMatcher = (index: number): void => {
    emits('removeMatcher', index);
  };

  const expandCard = (): void => {
    emits('expandCard', 'labelMatchersForm');
  };
</script>
