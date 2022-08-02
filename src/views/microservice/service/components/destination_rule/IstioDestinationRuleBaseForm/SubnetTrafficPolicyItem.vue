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
    <v-sheet v-for="(subset, index) in subsets" :key="index" class="grey lighten-4 rounded mb-3">
      <v-list-item two-line>
        <v-list-item-content class="py-2">
          <v-list-item-subtitle class="text-subtitle-2 py-1 primary--text">
            {{ subset.name }}
          </v-list-item-subtitle>
          <v-list-item-subtitle class="text-body-2 py-0">
            <v-list-item class="float-left py-0 pl-0" :style="{ width: `200px` }" two-line>
              <v-list-item-content class="py-0">
                <v-list-item-title class="text-subtitle-2 py-1">
                  {{
                    subset.trafficPolicy && JSON.stringify(subset.trafficPolicy.loadBalancer) !== '{}'
                      ? '已设置'
                      : '未设置'
                  }}
                </v-list-item-title>
                <v-list-item-subtitle class="text-body-2 py-1"> loadBalancer </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
            <v-list-item class="float-left py-0 pl-0" :style="{ width: `200px` }" two-line>
              <v-list-item-content class="py-0">
                <v-list-item-title class="text-subtitle-2 py-1">
                  {{
                    subset.trafficPolicy && JSON.stringify(subset.trafficPolicy.connectionPool) !== '{}'
                      ? '已设置'
                      : '未设置'
                  }}
                </v-list-item-title>
                <v-list-item-subtitle class="text-body-2 py-1"> connectionPool </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
            <v-list-item class="float-left py-0 pl-0" :style="{ width: `200px` }" two-line>
              <v-list-item-content class="py-0">
                <v-list-item-title class="text-subtitle-2 py-1">
                  {{
                    subset.trafficPolicy && JSON.stringify(subset.trafficPolicy.outlierDetection) !== '{}'
                      ? '已设置'
                      : '未设置'
                  }}
                </v-list-item-title>
                <v-list-item-subtitle class="text-body-2 py-1"> outlierDetection </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
            <v-list-item class="float-left py-0 pl-0" :style="{ width: `200px` }" two-line>
              <v-list-item-content class="py-0">
                <v-list-item-title class="text-subtitle-2 py-1">
                  {{ subset.trafficPolicy && JSON.stringify(subset.trafficPolicy.tls) !== '{}' ? '已设置' : '未设置' }}
                </v-list-item-title>
                <v-list-item-subtitle class="text-body-2 py-1"> tls </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
            <v-list-item class="float-left py-0 pl-0" :style="{ width: `200px` }" two-line>
              <v-list-item-content class="py-0">
                <v-list-item-title class="text-subtitle-2 py-1">
                  {{
                    subset.trafficPolicy &&
                    subset.trafficPolicy.portLevelSettings &&
                    subset.trafficPolicy.portLevelSettings.length > 0
                      ? '已设置'
                      : '未设置'
                  }}
                </v-list-item-title>
                <v-list-item-subtitle class="text-body-2 py-1"> portLevelSettings </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
          </v-list-item-subtitle>
          <div class="kubegems__clear-float" />
        </v-list-item-content>
        <v-btn color="primary" dark fab right text x-small @click="updateTrafficPolicy(index)">
          <v-icon>mdi-pencil</v-icon>
        </v-btn>
        <v-btn color="error" dark fab right text x-small @click="removeTrafficPolicy(index)">
          <v-icon>mdi-delete</v-icon>
        </v-btn>
      </v-list-item>
    </v-sheet>
    <v-flex class="grey lighten-4 rounded">
      <v-list-item two-line>
        <v-list-item-content class="py-2">
          <v-list-item-subtitle class="text-body-2 py-0 text-center">
            <v-btn color="primary" text @click="expandCard">
              <v-icon left small> mdi-plus </v-icon>
              添加流量策略子集
            </v-btn>
          </v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>
    </v-flex>
  </v-flex>
</template>

<script>
  export default {
    name: 'SubnetTrafficPolicyItem',
    props: {
      subsets: {
        type: Array,
        default: () => [],
      },
    },
    methods: {
      updateTrafficPolicy(index) {
        this.$emit('updateSubnetTrafficPolicy', index);
      },
      removeTrafficPolicy(index) {
        this.$emit('removeSubnetTrafficPolicy', index);
      },
      expandCard() {
        this.$emit('expandCard', 'subnetTrafficPolicyForm');
      },
    },
  };
</script>
