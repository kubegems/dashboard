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
  <v-flex>
    <v-sheet v-if="trafficPolicy && JSON.stringify(trafficPolicy) !== '{}'" class="grey lighten-4 rounded mb-3">
      <v-list-item two-line>
        <v-list-item-content class="py-2">
          <v-list-item-subtitle class="text-body-2 py-0">
            <v-list-item class="float-left py-0 pl-0" :style="{ width: `200px` }" two-line>
              <v-list-item-content class="py-0">
                <v-list-item-title class="text-subtitle-2 py-1">
                  {{ JSON.stringify(trafficPolicy.loadBalancer) !== '{}' ? '已设置' : '未设置' }}
                </v-list-item-title>
                <v-list-item-subtitle class="text-body-2 py-1"> loadBalancer </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
            <v-list-item class="float-left py-0 pl-0" :style="{ width: `200px` }" two-line>
              <v-list-item-content class="py-0">
                <v-list-item-title class="text-subtitle-2 py-1">
                  {{ JSON.stringify(trafficPolicy.connectionPool) !== '{}' ? '已设置' : '未设置' }}
                </v-list-item-title>
                <v-list-item-subtitle class="text-body-2 py-1"> connectionPool </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
            <v-list-item class="float-left py-0 pl-0" :style="{ width: `200px` }" two-line>
              <v-list-item-content class="py-0">
                <v-list-item-title class="text-subtitle-2 py-1">
                  {{ JSON.stringify(trafficPolicy.outlierDetection) !== '{}' ? '已设置' : '未设置' }}
                </v-list-item-title>
                <v-list-item-subtitle class="text-body-2 py-1"> outlierDetection </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
            <v-list-item class="float-left py-0 pl-0" :style="{ width: `200px` }" two-line>
              <v-list-item-content class="py-0">
                <v-list-item-title class="text-subtitle-2 py-1">
                  {{ JSON.stringify(trafficPolicy.tls) !== '{}' ? '已设置' : '未设置' }}
                </v-list-item-title>
                <v-list-item-subtitle class="text-body-2 py-1"> tls </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
            <v-list-item class="float-left py-0 pl-0" :style="{ width: `200px` }" two-line>
              <v-list-item-content class="py-0">
                <v-list-item-title class="text-subtitle-2 py-1">
                  {{
                    trafficPolicy.portLevelSettings && trafficPolicy.portLevelSettings.length > 0 ? '已设置' : '未设置'
                  }}
                </v-list-item-title>
                <v-list-item-subtitle class="text-body-2 py-1"> portLevelSettings </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
          </v-list-item-subtitle>
          <div class="kubegems__clear-float" />
        </v-list-item-content>
        <v-btn color="primary" dark fab right text x-small @click="updateTrafficPolicy">
          <v-icon>mdi-pencil</v-icon>
        </v-btn>
        <v-btn color="error" dark fab right text x-small @click="removeTrafficPolicy">
          <v-icon>mdi-delete</v-icon>
        </v-btn>
      </v-list-item>
    </v-sheet>
    <v-flex v-else class="grey lighten-4 rounded">
      <v-list-item two-line>
        <v-list-item-content class="py-2">
          <v-list-item-subtitle class="text-body-2 py-0 text-center">
            <v-btn color="primary" text @click="expandCard">
              <v-icon left small> mdi-plus </v-icon>
              添加流量策略
            </v-btn>
          </v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>
    </v-flex>
  </v-flex>
</template>

<script>
  export default {
    name: 'TrafficPolicyItem',
    props: {
      trafficPolicy: {
        type: Object,
        default: () => {},
      },
    },
    methods: {
      updateTrafficPolicy() {
        this.$emit('updateTrafficPolicy');
      },
      removeTrafficPolicy() {
        this.$emit('removeTrafficPolicy');
      },
      expandCard() {
        this.$emit('expandCard', 'trafficPolicyForm');
      },
    },
  };
</script>
