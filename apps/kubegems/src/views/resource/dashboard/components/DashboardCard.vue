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
  <v-row>
    <v-col class="mb-2" cols="2">
      <BaseInfoCard
        icon="mdi-server"
        :num="statistics ? statistics['count.clusters'] : 0"
        :title="$t('resource.cluster')"
      />
    </v-col>
    <v-col class="pb-0" cols="2">
      <BaseInfoCard
        icon="mdi-cube-outline"
        :num="statistics ? statistics['count.projects'] : 0"
        :title="$t('resource.project')"
      />
    </v-col>
    <v-col class="pb-0" cols="2">
      <BaseInfoCard
        icon="mdi-cloud"
        :num="statistics ? statistics['count.environments'] : 0"
        :title="$t('resource.environment')"
      />
    </v-col>
    <v-col class="pb-0" cols="2">
      <BaseInfoCard
        icon="mdi-vector-arrange-above"
        :num="statistics ? statistics['count.workloads'] : 0"
        :title="$t('resource.workload')"
      />
    </v-col>
    <v-col class="pb-0" cols="2">
      <BaseInfoCard icon="mdi-cube" :num="statistics ? statistics['count.pods'] : 0" :title="$t('resource.pod')" />
    </v-col>
    <v-col class="pb-0" cols="2">
      <BaseInfoCard
        icon="mdi-account"
        :num="statistics ? statistics['count.users'] : 0"
        :title="$t('resource.account')"
      />
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
