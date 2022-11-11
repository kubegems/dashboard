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
    <v-flex :id="`${plugin.name}-${index}m`" />
    <v-menu
      v-if="plugin.message"
      :attach="`#${plugin.name}-${index}m`"
      :close-delay="200"
      max-width="250px"
      min-width="170px"
      nudge-bottom="30px"
      nudge-left="20px"
      offset-y
      open-on-hover
      origin="bottom center"
      right
      top
      transition="scale-transition"
    >
      <template #activator="{ on }">
        <div class="float-left plugins__tip" v-on="on">
          <v-icon class="plugins__icon" color="error" right small> mdi-alert-circle </v-icon>
        </div>
      </template>
      <v-card>
        <v-flex class="text-body-2 text-center primary white--text py-2">
          <v-icon color="white" left small> mdi-alert-circle </v-icon>
          <span>{{ $t('tip.message') }}</span>
        </v-flex>
        <v-list class="pa-0" dense :style="{ height: '120px', overflowY: 'auto' }">
          <v-list-item>
            <v-list-item-content>
              <v-list-item class="float-left pa-0" two-line>
                <v-list-item-content class="py-0">
                  <v-list-item-title> {{ $t('tip.message') }} </v-list-item-title>
                  <v-list-item-content class="text-caption kubegems__text kubegems__break-all">
                    {{ plugin.message }}
                  </v-list-item-content>
                </v-list-item-content>
              </v-list-item>
            </v-list-item-content>
          </v-list-item>
        </v-list>
      </v-card>
    </v-menu>
  </div>
</template>

<script>
  import messages from '../i18n';

  export default {
    name: 'UpgradeMessage',
    i18n: {
      messages: messages,
    },
    props: {
      index: {
        type: Number,
        default: () => 0,
      },
      plugin: {
        type: Object,
        default: () => {
          return {};
        },
      },
    },
  };
</script>

<style lang="scss" scoped>
  .plugins {
    &__tip {
      line-height: 28px;
    }

    &__icon {
      margin-top: -2px;
    }
  }
</style>
