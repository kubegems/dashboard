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
    <v-col class="py-0" cols="6">
      <BaseInfoCard
        icon="mdi-cloud"
        :num="virtualspace && virtualspace.Environments ? virtualspace.Environments.length : 0"
        :title="$root.$t('resource.environment')"
      />
    </v-col>
    <!-- <v-col cols="4" class="py-0">
      <BaseInfoCard :num="0" title="应用" icon="bi:app" />
    </v-col> -->
    <v-col class="py-0" cols="6">
      <BaseInfoCard
        icon="mdi-account"
        :num="virtualspace && virtualspace.Users ? virtualspace.Users.length : 0"
        :title="$root.$t('resource.member')"
      />
    </v-col>
  </v-row>
</template>

<script>
  export default {
    name: 'DashboardCard',
    props: {
      virtualspace: {
        type: Object,
        default: () => {
          return {
            Users: [],
            Environments: [],
          };
        },
      },
    },
  };
</script>
