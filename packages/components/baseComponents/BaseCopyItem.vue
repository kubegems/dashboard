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
  <v-menu
    bottom
    :close-delay="200"
    :close-on-content-click="false"
    :max-width="300"
    nudge-bottom="30px"
    open-on-hover
    right
  >
    <template #activator="{ on }">
      <div class="item" :style="{ maxWidth: `${maxWidth}px` }" v-on="on">
        {{ item }}
      </div>
    </template>
    <v-card class="pa-2" flat>
      <div class="ma-1 text-caption kubegems__text">
        <strong class="mr-1"> {{ item }} </strong>
        <v-btn v-clipboard:copy="item" v-clipboard:success="copyed" color="primary" icon small>
          <v-icon small>mdi-content-copy</v-icon>
        </v-btn>
      </div>
    </v-card>
  </v-menu>
</template>

<script lang="ts" setup>
  import { useGlobalI18n } from '@kubegems/extension/i18n';
  import { useStore } from '@kubegems/extension/store';

  const store = useStore();
  const i18n = useGlobalI18n();

  withDefaults(
    defineProps<{
      maxWidth?: number;
      item?: string;
    }>(),
    {
      maxWidth: 500,
      item: '',
    },
  );

  const copyed = () => {
    store.commit('SET_SNACKBAR', {
      text: i18n.t('tip.copyed'),
      color: 'success',
    });
  };
</script>

<style lang="scss" scoped>
  .item {
    word-break: break-all;
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
  }
</style>
