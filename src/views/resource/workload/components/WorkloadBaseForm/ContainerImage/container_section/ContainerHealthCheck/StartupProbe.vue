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
  <v-sheet class="grey lighten-4 rounded ma-2">
    <v-list-item two-line>
      <v-list-item-content class="py-2">
        <v-list-item-subtitle class="text-body-2 py-0">
          <v-list-item class="float-left pa-0" two-line>
            <v-list-item-content class="py-0">
              <v-list-item-title class="text-subtitle-2 py-1"> {{ $t('tip.startup_probe') }} </v-list-item-title>
              <v-list-item-subtitle class="text-body-2 py-1"> {{ $root.$t('resource.type') }} </v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
          <template v-if="containerCopy.startupProbe.httpGet">
            <v-list-item class="float-left pa-0 kubegems__three-width" two-line>
              <v-list-item-content class="py-0">
                <v-list-item-title class="text-subtitle-2 py-1">
                  {{
                    $t('tip.delay_msg', [
                      containerCopy.startupProbe.initialDelaySeconds,
                      containerCopy.startupProbe.timeoutSeconds,
                    ])
                  }}
                </v-list-item-title>
                <v-list-item-subtitle class="text-body-2 py-1"> {{ $t('tip.http_check') }} </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
            <v-list-item class="float-left pa-0" two-line>
              <v-list-item-content class="py-0">
                <v-list-item-title class="text-subtitle-2 py-1">
                  {{ containerCopy.startupProbe.httpGet.scheme }}
                </v-list-item-title>
                <v-list-item-subtitle class="text-body-2 py-1"> {{ $root.$t('resource.type') }} </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
            <v-list-item class="float-left pa-0 kubegems__three-width" two-line>
              <v-list-item-content class="py-0">
                <v-list-item-title class="text-subtitle-2 py-1">
                  {{ containerCopy.startupProbe.httpGet.path }}
                </v-list-item-title>
                <v-list-item-subtitle class="text-body-2 py-1"> {{ $t('tip.path') }} </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
            <v-list-item class="float-left pa-0" two-line>
              <v-list-item-content class="py-0">
                <v-list-item-title class="text-subtitle-2 py-1">
                  {{ containerCopy.startupProbe.httpGet.port }}
                </v-list-item-title>
                <v-list-item-subtitle class="text-body-2 py-1"> {{ $t('tip.port') }} </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
          </template>
          <template v-else-if="containerCopy.startupProbe.exec">
            <v-list-item class="float-left pa-0 kubegems__three-width" two-line>
              <v-list-item-content class="py-0">
                <v-list-item-title class="text-subtitle-2 py-1">
                  {{
                    $t('tip.delay_msg', [
                      containerCopy.startupProbe.initialDelaySeconds,
                      containerCopy.startupProbe.timeoutSeconds,
                    ])
                  }}
                </v-list-item-title>
                <v-list-item-subtitle class="text-body-2 py-1"> {{ $t('tip.shell_check') }} </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
            <v-list-item class="float-left pa-0" two-line>
              <v-list-item-content class="py-0">
                <v-list-item-title class="text-subtitle-2 py-1 kubegems__break-all">
                  <template v-for="command in containerCopy.startupProbe.exec.command">
                    {{ command }}
                  </template>
                </v-list-item-title>
                <v-list-item-subtitle class="text-body-2 py-1"> {{ $t('tip.command') }} </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
          </template>
          <template v-else-if="containerCopy.startupProbe.tcpSocket">
            <v-list-item class="float-left pa-0 kubegems__three-width" two-line>
              <v-list-item-content class="py-0">
                <v-list-item-title class="text-subtitle-2 py-1">
                  {{
                    $t('tip.delay_msg', [
                      containerCopy.startupProbe.initialDelaySeconds,
                      containerCopy.startupProbe.timeoutSeconds,
                    ])
                  }}
                </v-list-item-title>
                <v-list-item-subtitle class="text-body-2 py-1"> {{ $t('tip.tcp_check') }} </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
            <v-list-item class="float-left pa-0" two-line>
              <v-list-item-content class="py-0">
                <v-list-item-title class="text-subtitle-2 py-1">
                  {{ containerCopy.startupProbe.tcpSocket.port }}
                </v-list-item-title>
                <v-list-item-subtitle class="text-body-2 py-1"> {{ $t('tip.port') }} </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
          </template>
        </v-list-item-subtitle>
        <div class="kubegems__clear-float" />
      </v-list-item-content>
      <v-btn color="primary" dark fab right text x-small @click="updateData('startupProbe')">
        <v-icon>mdi-pencil</v-icon>
      </v-btn>
      <v-btn color="error" dark fab right text x-small @click="removeData('startupProbe')">
        <v-icon>mdi-delete</v-icon>
      </v-btn>
    </v-list-item>
  </v-sheet>
</template>

<script>
  import messages from '../../../../../i18n';

  export default {
    name: 'StartupProbe',
    i18n: {
      messages: messages,
    },
    props: {
      containerCopy: {
        type: Object,
        default: () => {},
      },
    },
    methods: {
      updateData(type) {
        this.$emit('updateData', type);
      },
      removeData(type) {
        this.$emit('removeData', type);
      },
    },
  };
</script>
