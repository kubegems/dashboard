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
    <span
      :class="`v-avatar mr-2 ${
        item.task && (item.task.status.status === 'Running' || item.task.status.status === 'Pending')
          ? 'kubegems__waiting-flashing'
          : ''
      }`"
      :style="{
        height: '10px',
        minWidth: '10px',
        width: '10px',
        backgroundColor: `${
          $APP_TASK_STATUS_COLOR[item.task ? item.task.status.status : '']
            ? $APP_TASK_STATUS_COLOR[item.task ? item.task.status.status : '']
            : 'grey'
        }`,
      }"
    />
    <template v-if="item.task && (item.task.status.status === 'Running' || item.task.status.status === 'Pending')">
      <span> {{ $t('status.running') }} </span>
    </template>
    <template v-else-if="item.task && item.task.status.status === 'Success'">
      <span> {{ $t('status.complete') }} </span>
    </template>
    <template v-else-if="item.task && item.task.status.status === 'Error'">
      <v-menu
        bottom
        :close-on-content-click="false"
        left
        max-width="200px"
        nudge-bottom="5px"
        offset-y
        open-on-hover
        :origin="`${size - index <= 5 || (items.length <= 5 && index >= 1) ? 'bottom center' : 'top center'}`"
        :top="size - index <= 5 || (items.length <= 5 && index >= 1)"
        transition="scale-transition"
      >
        <template #activator="{ on }">
          <span class="kubegems__pointer" v-on="on"> {{ $t('status.failed') }} </span>
        </template>
        <v-card flat>
          <v-flex class="text-body-2 text-center primary white--text py-2">
            <v-icon color="white" left small> mdi-alert </v-icon>
            <span>{{ $t('tip.error_info') }}</span>
          </v-flex>
          <v-list class="pa-0 kubegems__tip" dense>
            <v-list-item>
              <v-list-item-content>
                <v-list-item class="float-left pa-0" two-line>
                  <v-list-item-content class="py-0">
                    <v-list-item-title> {{ $t('tip.error_info') }} </v-list-item-title>
                    <v-list-item-content class="text-caption kubegems__text kubegems__break-all">
                      {{ item.task ? item.task.status.message : '' }}
                    </v-list-item-content>
                  </v-list-item-content>
                </v-list-item>
              </v-list-item-content>
            </v-list-item>
          </v-list>
        </v-card>
      </v-menu>
    </template>
    <template v-else>{{ $root.$t('data.no_data') }}</template>
  </div>
</template>

<script>
  import messages from '../i18n';

  export default {
    name: 'TaskStatusTip',
    i18n: {
      messages: messages,
    },
    props: {
      index: {
        type: Number,
        default: () => 1,
      },
      item: {
        type: Object,
        default: () => {},
      },
      size: {
        type: Number,
        default: () => 10,
      },
    },
  };
</script>
