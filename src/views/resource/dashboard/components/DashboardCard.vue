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
  <v-row>
    <v-col class="mb-2" cols="2">
      <v-card>
        <v-card-text class="pa-5">
          <div class="d-flex align-center">
            <Icon class="mr-3 primary--text" height="35px" icon="mdi:server" width="35px" />
            <div class="ml-2 mr-1">
              <h2 class="text-h5">
                {{ statistics ? statistics['count.clusters'] : 0 }}
              </h2>
              <div class="text-subtitle-2 font-weight-regular dashboard__resource__div">集群</div>
            </div>
          </div>
        </v-card-text>
      </v-card>
    </v-col>
    <v-col class="pb-0" cols="2">
      <v-card>
        <v-card-text class="pa-5">
          <div class="d-flex align-center">
            <Icon class="mr-3 primary--text" height="35px" icon="mdi:cube-outline" width="35px" />
            <div class="ml-2 mr-1">
              <h2 class="text-h5">
                {{ statistics ? statistics['count.projects'] : 0 }}
              </h2>
              <div class="text-subtitle-2 font-weight-regular dashboard__resource__div">项目</div>
            </div>
          </div>
        </v-card-text>
      </v-card>
    </v-col>
    <v-col class="pb-0" cols="2">
      <v-card>
        <v-card-text class="pa-5">
          <div class="d-flex align-center">
            <Icon class="mr-3 primary--text" height="35px" icon="mdi:cloud" width="35px" />
            <div class="ml-2 mr-1">
              <h2 class="text-h5">
                {{ statistics ? statistics['count.environments'] : 0 }}
              </h2>
              <div class="text-subtitle-2 font-weight-regular dashboard__resource__div">环境</div>
            </div>
          </div>
        </v-card-text>
      </v-card>
    </v-col>
    <v-col class="pb-0" cols="2">
      <v-card>
        <v-card-text class="pa-5">
          <div class="d-flex align-center">
            <Icon class="mr-3 primary--text" height="35px" icon="mdi:vector-arrange-above" width="35px" />
            <div class="ml-2 mr-1">
              <h2 class="text-h5">
                {{ statistics ? statistics['count.workloads'] : 0 }}
              </h2>
              <div class="text-subtitle-2 font-weight-regular dashboard__resource__div">工作负载</div>
            </div>
          </div>
        </v-card-text>
      </v-card>
    </v-col>
    <v-col class="pb-0" cols="2">
      <v-card>
        <v-card-text class="pa-5">
          <div class="d-flex align-center">
            <Icon class="mr-3 primary--text" height="35px" icon="mdi:cube" width="35px" />
            <div class="ml-2 mr-1">
              <h2 class="text-h5">
                {{ statistics ? statistics['count.pods'] : 0 }}
              </h2>
              <div class="text-subtitle-2 font-weight-regular dashboard__resource__div">容器组</div>
            </div>
          </div>
        </v-card-text>
      </v-card>
    </v-col>
    <v-col class="pb-0" cols="2">
      <v-card>
        <v-card-text class="pa-5">
          <div class="d-flex align-center">
            <Icon class="mr-3 primary--text" height="35px" icon="mdi:account" width="35px" />
            <div class="ml-2 mr-1">
              <h2 class="text-h5">
                {{ statistics ? statistics['count.users'] : 0 }}
              </h2>
              <div class="text-subtitle-2 font-weight-regular dashboard__resource__div">用户</div>
            </div>
          </div>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>

<script>
  export default {
    name: 'DashboardCard',
    props: {
      statistics: {
        type: Object,
        default: () => null,
      },
    },
  };
</script>

<style lang="scss" scoped>
  .dashboard__resource__div {
    max-height: 44px;
    overflow: hidden;
    background: none;
    border: none;
  }
</style>
