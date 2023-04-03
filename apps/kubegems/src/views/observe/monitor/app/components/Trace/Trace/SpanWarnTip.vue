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
    :close-delay="200"
    :close-on-content-click="false"
    max-width="250px"
    nudge-bottom="5px"
    offset-y
    open-on-hover
    origin="top center"
    right
    transition="scale-transition"
  >
    <template #activator="{ on }">
      <span class="kubegems__pointer kubegems__attach-position" v-on="on">
        <slot name="trigger" />
      </span>
    </template>
    <v-card flat width="100%">
      <v-flex class="text-body-2 text-center primary white--text py-2">
        <v-icon color="white" left small> mdi-alert-circle </v-icon>
        <span>{{ i18nLocal.t('tip.alert') }}</span>
      </v-flex>
      <v-list class="pa-0 kubegems__tip" dense>
        <v-list-item>
          <v-list-item-content>
            <v-list-item v-for="(warning, index) in warnings || []" :key="index" class="float-left pa-0" two-line>
              <v-list-item-content class="py-0">
                <v-list-item-title> {{ `${i18nLocal.t('tip.alert')}-${index + 1}` }} </v-list-item-title>
                <v-list-item-content class="text-caption kubegems__text kubegems__break-all">
                  {{ warning }}
                </v-list-item-content>
              </v-list-item-content>
            </v-list-item>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-card>
  </v-menu>
</template>

<script lang="ts" setup>
  import { useI18n } from '../../../../i18n';

  withDefaults(
    defineProps<{
      warnings?: string[];
    }>(),
    {
      warnings: undefined,
    },
  );

  const i18nLocal = useI18n();
</script>
