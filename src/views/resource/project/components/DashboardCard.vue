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
    <v-col class="py-0" cols="3">
      <BaseInfoCard icon="mdi-cube-scan" :num="basic.environments" :title="$root.$t('resource.environment')" />
    </v-col>
    <v-col class="py-0" cols="3">
      <BaseInfoCard icon="mdi-apps" :num="basic.applications" :title="$root.$t('resource.app')" />
    </v-col>
    <v-col class="py-0" cols="3">
      <BaseInfoCard icon="mdi-account" :num="basic.person" :title="$root.$t('resource.account')" />
    </v-col>
    <v-col class="py-0" cols="3">
      <BaseInfoCard icon="mdi-account-convert" :num="4" :title="$root.$t('resource.role')" />
    </v-col>
  </v-row>
</template>

<script>
  export default {
    name: 'DashboardCard',
    props: {
      basic: {
        type: Object,
        default: () => null,
      },
    },
  };
</script>
