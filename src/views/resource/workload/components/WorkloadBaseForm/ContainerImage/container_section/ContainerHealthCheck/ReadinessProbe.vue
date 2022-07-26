<!-- 
  Copyright 2022 The kubegems.io Authors

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License. 
-->

<template>
  <v-sheet class="grey lighten-4 rounded ma-2">
    <v-list-item two-line>
      <v-list-item-content class="py-2">
        <v-list-item-subtitle class="text-body-2 py-0">
          <v-list-item class="float-left pa-0" two-line>
            <v-list-item-content class="py-0">
              <v-list-item-title class="text-subtitle-2 py-1"> 就绪检查 </v-list-item-title>
              <v-list-item-subtitle class="text-body-2 py-1"> 类型 </v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
          <template v-if="containerCopy.readinessProbe.httpGet">
            <v-list-item class="float-left pa-0 kubegems__three-width" two-line>
              <v-list-item-content class="py-0">
                <v-list-item-title class="text-subtitle-2 py-1">
                  初始延迟{{ containerCopy.readinessProbe.initialDelaySeconds }}s&nbsp;超时{{
                    containerCopy.readinessProbe.timeoutSeconds
                  }}s
                </v-list-item-title>
                <v-list-item-subtitle class="text-body-2 py-1"> HTTP请求检查 </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
            <v-list-item class="float-left pa-0" two-line>
              <v-list-item-content class="py-0">
                <v-list-item-title class="text-subtitle-2 py-1">
                  {{ containerCopy.readinessProbe.httpGet.scheme }}
                </v-list-item-title>
                <v-list-item-subtitle class="text-body-2 py-1"> 类型 </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
            <v-list-item class="float-left pa-0 kubegems__three-width" two-line>
              <v-list-item-content class="py-0">
                <v-list-item-title class="text-subtitle-2 py-1">
                  {{ containerCopy.readinessProbe.httpGet.path }}
                </v-list-item-title>
                <v-list-item-subtitle class="text-body-2 py-1"> 路径 </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
            <v-list-item class="float-left pa-0" two-line>
              <v-list-item-content class="py-0">
                <v-list-item-title class="text-subtitle-2 py-1">
                  {{ containerCopy.readinessProbe.httpGet.port }}
                </v-list-item-title>
                <v-list-item-subtitle class="text-body-2 py-1"> 端口 </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
          </template>
          <template v-else-if="containerCopy.readinessProbe.exec">
            <v-list-item class="float-left pa-0 kubegems__three-width" two-line>
              <v-list-item-content class="py-0">
                <v-list-item-title class="text-subtitle-2 py-1">
                  初始延迟{{ containerCopy.readinessProbe.initialDelaySeconds }}s&nbsp;超时{{
                    containerCopy.readinessProbe.timeoutSeconds
                  }}s
                </v-list-item-title>
                <v-list-item-subtitle class="text-body-2 py-1"> 执行命令检查 </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
            <v-list-item class="float-left pa-0" two-line>
              <v-list-item-content class="py-0">
                <v-list-item-title class="text-subtitle-2 py-1 kubegems__break-all">
                  <template v-for="command in containerCopy.readinessProbe.exec.command">
                    {{ command }}
                  </template>
                </v-list-item-title>
                <v-list-item-subtitle class="text-body-2 py-1"> 命令 </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
          </template>
          <template v-else-if="containerCopy.readinessProbe.tcpSocket">
            <v-list-item class="float-left pa-0 kubegems__three-width" two-line>
              <v-list-item-content class="py-0">
                <v-list-item-title class="text-subtitle-2 py-1">
                  初始延迟{{ containerCopy.readinessProbe.initialDelaySeconds }}s&nbsp;超时{{
                    containerCopy.readinessProbe.timeoutSeconds
                  }}s
                </v-list-item-title>
                <v-list-item-subtitle class="text-body-2 py-1"> TCP端口检查 </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
            <v-list-item class="float-left pa-0" two-line>
              <v-list-item-content class="py-0">
                <v-list-item-title class="text-subtitle-2 py-1">
                  {{ containerCopy.readinessProbe.tcpSocket.port }}
                </v-list-item-title>
                <v-list-item-subtitle class="text-body-2 py-1"> 端口 </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
          </template>
        </v-list-item-subtitle>
        <div class="kubegems__clear-float" />
      </v-list-item-content>
      <v-btn color="primary" dark fab right text x-small @click="updateData('readinessProbe')">
        <v-icon>mdi-pencil</v-icon>
      </v-btn>
      <v-btn color="error" dark fab right text x-small @click="removeData('readinessProbe')">
        <v-icon>mdi-delete</v-icon>
      </v-btn>
    </v-list-item>
  </v-sheet>
</template>

<script>
  export default {
    name: 'ReadinessProbe',
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
