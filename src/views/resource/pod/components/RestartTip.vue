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
    :disabled="disabled"
    left
    max-width="200px"
    nudge-bottom="5px"
    offset-y
    open-on-hover
    :origin="`${top ? 'bottom center' : 'top center'}`"
    :top="top"
    transition="scale-transition"
  >
    <template #activator="{ on }">
      <span class="kubegems__pointer kubegems__attach-position" v-on="on">
        <slot name="trigger" />
      </span>
    </template>
    <v-card flat width="100%">
      <v-flex class="text-body-2 text-center primary white--text py-2">
        <v-icon color="white" left small> mdi-bell-ring </v-icon>
        <span>{{ $t('tip.last_state') }}</span>
      </v-flex>
      <v-list class="pa-0 kubegems__tip" dense>
        <template v-for="(state, index) in pod ? pod.status.containerStatuses : []">
          <v-list-item v-if="state.lastState.terminated" :key="`t${index}`">
            <v-list-item-content class="pb-0">
              <v-list-item-title class="kubegems__break-all">
                {{ $root.$t('resource.container') }} : {{ state.name }}
              </v-list-item-title>
              <v-list-item class="float-left pa-0 list__item" two-line>
                <v-list-item-content class="py-0">
                  <v-list-item-title> {{ $t('tip.last_start_at') }} </v-list-item-title>
                  <v-list-item-content class="text-caption kubegems__text kubegems__break-all py-0">
                    {{
                      state.state.running && state.state.running.startedAt
                        ? $moment(state.state.running.startedAt).format('lll')
                        : ''
                    }}
                  </v-list-item-content>
                </v-list-item-content>
              </v-list-item>
              <v-list-item class="float-left pa-0 list__item" two-line>
                <v-list-item-content class="py-0">
                  <v-list-item-title> {{ $t('tip.reason') }} </v-list-item-title>
                  <v-list-item-content class="text-caption kubegems__text kubegems__break-all py-0">
                    {{ state.lastState.terminated.reason }}
                  </v-list-item-content>
                </v-list-item-content>
              </v-list-item>
              <v-list-item class="float-left pa-0 list__item" two-line>
                <v-list-item-content class="py-0">
                  <v-list-item-title> {{ $t('tip.exit_code') }} </v-list-item-title>
                  <v-list-item-content class="text-caption kubegems__text kubegems__break-all py-0">
                    {{ state.lastState.terminated.exitCode }}
                  </v-list-item-content>
                </v-list-item-content>
              </v-list-item>
              <v-list-item class="float-left pa-0 list__item" two-line>
                <v-list-item-content class="py-0">
                  <v-list-item-title> {{ $t('tip.started_at') }} </v-list-item-title>
                  <v-list-item-content class="text-caption kubegems__text kubegems__break-all py-0">
                    {{
                      state.lastState.terminated.startedAt
                        ? $moment(state.lastState.terminated.startedAt).format('lll')
                        : ''
                    }}
                  </v-list-item-content>
                </v-list-item-content>
              </v-list-item>
              <v-list-item class="float-left pa-0 list__item" two-line>
                <v-list-item-content class="py-0">
                  <v-list-item-title> {{ $t('tip.finished_at') }} </v-list-item-title>
                  <v-list-item-content class="text-caption kubegems__text kubegems__break-all py-0">
                    {{
                      state.lastState.terminated.finishedAt
                        ? $moment(state.lastState.terminated.finishedAt).format('lll')
                        : ''
                    }}
                  </v-list-item-content>
                </v-list-item-content>
              </v-list-item>
            </v-list-item-content>
          </v-list-item>

          <v-list-item v-else-if="state.lastState.waiting" :key="`w${index}`">
            <v-list-item-content class="pb-0">
              <v-list-item-title class="kubegems__break-all">
                {{ $root.$t('resource.container') }} : {{ state.name }}
              </v-list-item-title>
              <v-list-item class="float-left pa-0 list__item" two-line>
                <v-list-item-content class="py-0">
                  <v-list-item-title> {{ $t('tip.last_start_at') }} </v-list-item-title>
                  <v-list-item-content class="text-caption kubegems__text kubegems__break-all py-0">
                    {{
                      state.state.running && state.state.running.startedAt
                        ? $moment(state.state.running.startedAt).format('lll')
                        : ''
                    }}
                  </v-list-item-content>
                </v-list-item-content>
              </v-list-item>
              <v-list-item class="float-left pa-0 list__item" two-line>
                <v-list-item-content class="py-0">
                  <v-list-item-title> {{ $t('tip.last_state') }} </v-list-item-title>
                  <v-list-item-content class="text-caption kubegems__text kubegems__break-all py-0">
                    waiting
                  </v-list-item-content>
                </v-list-item-content>
              </v-list-item>
            </v-list-item-content>
          </v-list-item>

          <v-list-item v-else :key="`o${index}`">
            <v-list-item-content class="pb-0">
              <v-list-item-title class="kubegems__break-all">
                {{ $root.$t('resource.container') }} : {{ state.name }}
              </v-list-item-title>
              <v-list-item class="float-left pa-0 list__item" two-line>
                <v-list-item-content class="py-0">
                  <v-list-item-title> {{ $t('tip.last_state') }} </v-list-item-title>
                  <v-list-item-content class="text-caption kubegems__text kubegems__break-all py-0">
                    {{ $root.$t('data.no_data') }}
                  </v-list-item-content>
                </v-list-item-content>
              </v-list-item>
            </v-list-item-content>
          </v-list-item>

          <v-divider :key="`d${index}`" class="mx-3" />
        </template>

        <v-flex
          v-if="pod && pod.status.containerStatuses.length === 0"
          :key="`n${index}`"
          class="text-caption kubegems__text text-center"
        >
          {{ $root.$t('data.no_data') }}
        </v-flex>
      </v-list>
    </v-card>
  </v-menu>
</template>

<script>
  import messages from '../i18n';
  import { deepCopy } from '@/utils/helpers';

  export default {
    name: 'RestartTip',
    i18n: {
      messages: messages,
    },
    props: {
      disabled: {
        type: Boolean,
        default: () => false,
      },
      item: {
        type: Object,
        default: () => {},
      },
      top: {
        type: Boolean,
        default: () => false,
      },
    },
    data() {
      return {
        pod: null,
      };
    },
    watch: {
      item: {
        handler(newValue) {
          if (newValue) {
            this.pod = deepCopy(this.item);
          }
        },
        deep: true,
        immediate: true,
      },
    },
  };
</script>

<style lang="scss" scoped>
  .list {
    &__item {
      min-height: 44px !important;
    }
  }
</style>
