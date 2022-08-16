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
  <v-flex class="my-1">
    <v-menu
      bottom
      :close-delay="200"
      :close-on-content-click="false"
      max-width="200px"
      offset-y
      open-on-hover
      origin="top center"
      transition="scale-transition"
    >
      <template #activator="{ on }">
        <span class="kubegems__pointer" v-on="on">
          <v-icon color="primary" small>mdi-medical-bag</v-icon>
          {{ title }}
        </span>
      </template>
      <v-card flat>
        <v-flex class="text-body-2 text-center primary white--text py-2">
          <v-icon color="white" left small> mdi-eyedropper </v-icon>
          <span>{{ title }}</span>
        </v-flex>
        <v-list class="pa-0 kubegems__tip" dense>
          <v-list-item>
            <v-list-item-content>
              <template v-if="item.httpGet">
                <v-list-item class="float-left pa-0" two-line>
                  <v-list-item-content class="py-0">
                    <v-list-item-title> {{ $t('tip.http_check') }} </v-list-item-title>
                    <v-list-item-content class="text-caption kubegems__text">
                      {{ $t('tip.delay_msg', [item.initialDelaySeconds, item.timeoutSeconds, item.periodSeconds]) }}
                    </v-list-item-content>
                  </v-list-item-content>
                </v-list-item>
                <v-list-item class="float-left pa-0" two-line>
                  <v-list-item-content class="py-0">
                    <v-list-item-title> {{ $root.$t('resource.type') }} </v-list-item-title>
                    <v-list-item-content class="text-caption kubegems__text">
                      {{ item.httpGet.scheme }}
                    </v-list-item-content>
                  </v-list-item-content>
                </v-list-item>
                <v-list-item class="float-left pa-0" two-line>
                  <v-list-item-content class="py-0">
                    <v-list-item-title> {{ $t('tip.path') }} </v-list-item-title>
                    <v-list-item-content class="text-caption kubegems__text">
                      {{ item.httpGet.path }}
                    </v-list-item-content>
                  </v-list-item-content>
                </v-list-item>
                <v-list-item class="float-left pa-0" two-line>
                  <v-list-item-content class="py-0">
                    <v-list-item-title> {{ $t('tip.port') }} </v-list-item-title>
                    <v-list-item-content class="text-caption kubegems__text">
                      {{ item.httpGet.port }}
                    </v-list-item-content>
                  </v-list-item-content>
                </v-list-item>
              </template>
              <template v-else-if="item.exec">
                <v-list-item class="float-left pa-0" two-line>
                  <v-list-item-content class="py-0">
                    <v-list-item-title> {{ $t('tip.shell_check') }} </v-list-item-title>
                    <v-list-item-content class="text-caption kubegems__text">
                      {{ $t('tip.delay_msg', [item.initialDelaySeconds, item.timeoutSeconds, item.periodSeconds]) }}
                    </v-list-item-content>
                  </v-list-item-content>
                </v-list-item>
                <v-list-item class="float-left pa-0" two-line>
                  <v-list-item-content class="py-0">
                    <v-list-item-title> {{ $t('tip.command') }} </v-list-item-title>
                    <v-list-item-content class="text-caption kubegems__text kubegems__break-all">
                      <template v-for="command in item.exec.command">
                        {{ command }}
                      </template>
                    </v-list-item-content>
                  </v-list-item-content>
                </v-list-item>
              </template>
              <template v-else-if="item.tcpSocket">
                <v-list-item class="float-left pa-0" two-line>
                  <v-list-item-content class="py-0">
                    <v-list-item-title> {{ $t('tip.tcp_check') }} </v-list-item-title>
                    <v-list-item-content class="text-caption kubegems__text">
                      {{ $t('tip.delay_msg', [item.initialDelaySeconds, item.timeoutSeconds, item.periodSeconds]) }}
                    </v-list-item-content>
                  </v-list-item-content>
                </v-list-item>
                <v-list-item class="float-left pa-0" two-line>
                  <v-list-item-content class="py-0">
                    <v-list-item-title> {{ $t('tip.port') }} </v-list-item-title>
                    <v-list-item-content class="text-caption kubegems__text">
                      {{ item.tcpSocket.port }}
                    </v-list-item-content>
                  </v-list-item-content>
                </v-list-item>
              </template>
            </v-list-item-content>
          </v-list-item>
        </v-list>
      </v-card>
    </v-menu>
  </v-flex>
</template>

<script>
  import messages from '../i18n';

  export default {
    name: 'ProbeTip',
    i18n: {
      messages: messages,
    },
    props: {
      item: {
        type: Object,
        default: () => {},
      },
      title: {
        type: String,
        default: () => '',
      },
    },
  };
</script>
