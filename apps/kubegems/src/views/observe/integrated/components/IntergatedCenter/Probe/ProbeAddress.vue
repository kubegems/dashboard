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
  <v-card flat>
    <v-row class="pa-0 ma-0 mt-3">
      <v-col class="py-1 pl-0" cols="6">
        <v-card elevation="2" flat height="350px">
          <v-card-text>
            <v-flex class="px-1 mb-2">{{ i18nLocal.t('tip.all_probe_address') }}</v-flex>
            <v-list dense height="250px" :style="{ overflowY: `auto` }">
              <v-list-item v-for="(user, index) in []" :key="index" link>
                <v-list-item-avatar class="my-1">
                  <v-avatar class="white--text font-weight-medium" color="primary" :size="32">
                    {{ user.Username[0].toLocaleUpperCase() }}
                  </v-avatar>
                </v-list-item-avatar>
                <v-list-item-content class="text-subtitle-1">
                  {{ user.Username }}
                </v-list-item-content>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col class="py-1 pr-0" cols="6">
        <v-card elevation="2" flat height="350px">
          <v-card-text>
            <v-flex class="px-1 mb-2">
              {{ i18nLocal.t('tip.need_probe_address') }}
            </v-flex>
            <v-list dense height="250px" :style="{ overflowY: `auto` }">
              <v-list-item v-for="(user, index) in []" :key="index" link>
                <v-list-item-avatar class="my-1">
                  <v-avatar class="white--text font-weight-medium" color="primary" :size="32">
                    {{ user.Username[0].toLocaleUpperCase() }}
                  </v-avatar>
                </v-list-item-avatar>
                <v-list-item-content class="text-subtitle-1">
                  {{ user.Username }}
                </v-list-item-content>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-card>
</template>

<script lang="ts" setup>
  import { useI18n } from '../../../i18n';

  const i18nLocal = useI18n();
</script>
