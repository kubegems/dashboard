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
    :close-on-content-click="false"
    left
    max-height="350px"
    max-width="200px"
    min-width="100px"
    nudge-bottom="5px"
    open-on-hover
    transition="scale-transition"
  >
    <template #activator="{ on }">
      <span class="kubegems__pointer" v-on="on">
        <slot name="trigger" />
      </span>
    </template>
    <v-card flat>
      <v-list class="pa-0" dense>
        <v-flex class="text-body-2 text-center primary white--text py-2">
          <v-icon color="white" left small> mdi-alert </v-icon>
          <span>{{ $t('tip.error_info') }}</span>
        </v-flex>
        <v-list-item>
          <v-list-item-content>
            <v-list-item class="float-left pa-0" two-line>
              <v-list-item-content class="py-0">
                <v-list-item-title> {{ $t('tip.error_info') }} </v-list-item-title>
                <v-list-item-content class="text-caption kubegems__text kubegems__break-all">
                  {{ item.SyncMessage ? item.SyncMessage : $root.$t('data.no_data') }}
                </v-list-item-content>
              </v-list-item-content>
            </v-list-item>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-card>
  </v-menu>
</template>

<script>
  import messages from '../i18n';

  export default {
    name: 'StatusTip',
    i18n: {
      messages: messages,
    },
    props: {
      item: {
        type: Object,
        default: () => {},
      },
    },
  };
</script>
