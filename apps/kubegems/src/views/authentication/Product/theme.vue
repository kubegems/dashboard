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
    <v-btn class="primary--text font-weight-medium mb-1 float-left" color="white" dark depressed>
      {{ i18nLocal.t('tip.theme') }}:
    </v-btn>
    <v-menu v-for="(item, index) in themeItems" :key="index" :close-delay="200" left :nudge-top="22" open-on-hover top>
      <template #activator="{ on }">
        <div
          class="float-left kubegems__pointer"
          :style="{ backgroundColor: item.value, width: '24px', height: '18px', marginTop: '8px' }"
          v-on="on"
          @click="changeTheme(item.value)"
        />
      </template>
      <v-card>
        <v-card-text class="pa-2 text-caption"> {{ i18nLocal.t(`theme.${item.text}`) }} </v-card-text>
      </v-card>
    </v-menu>
    <div class="kubegems__clear-float" />
  </div>
</template>

<script lang="ts" setup>
  import { useVuetify } from '@kubegems/extension/proxy';
  import { useStore } from '@kubegems/extension/store';

  import { refreshColor } from '../../../loadConfig';
  import { useI18n } from '../i18n';

  const i18nLocal = useI18n();
  const store = useStore();

  const themeItems = [
    { text: 'default', value: '#1e88e5' },
    { text: 'navy_blue', value: '#2E4E7E' },
    { text: 'rock_blue', value: '#1685A9' },
    { text: 'cyanine', value: '#003472' },
    { text: 'fei_hong', value: '#ED5736' },
    { text: 'b_orange', value: '#FA7E23' },
    { text: 'b_green', value: '#789262' },
    { text: 'p_green', value: '#1C8B7C' },
    { text: 'p_blue', value: '#512DA8' },
    { text: 'brown', value: '#622A1D' },
  ];

  const vuetify = useVuetify();
  const changeTheme = (theme: string): void => {
    store.commit('SET_THEME_COLOR', theme);
    refreshColor();
    vuetify.theme.themes.light.primary = theme;
  };
</script>
