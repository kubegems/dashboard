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
  <v-row class="mt-4 mx-2">
    <v-col class="py-0 mb-3" cols="4">
      <BaseInfoCard
        :elevation="4"
        full-center
        full-height
        icon="mdi-desktop-classic"
        :large="false"
        :num="item ? item.stream.node : ''"
        :title="$root.$t('resource.host')"
      />
    </v-col>
    <v-col class="py-0 mb-3" cols="4">
      <BaseInfoCard
        :elevation="4"
        full-height
        icon="mdi-cube"
        :large="false"
        :num="item ? item.stream.pod : ''"
        :title="$root.$t('resource.pod')"
      />
    </v-col>
    <v-col class="py-0 mb-3" cols="4">
      <BaseInfoCard
        :elevation="4"
        full-center
        full-height
        icon="mdi-lan"
        :large="false"
        :num="item ? item.stream.instance : ''"
        :title="$root.$t('resource.service')"
      />
    </v-col>
  </v-row>
</template>

<script>
  import messages from '../../../../i18n';

  export default {
    name: 'DashboardCard',
    i18n: {
      messages: messages,
    },
    props: {
      item: {
        type: Object,
        default: () => null,
      },
    },
  };
</script>
