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
  <v-container fluid>
    <BaseBreadcrumb />

    <v-row class="mt-0">
      <v-col class="pt-0">
        <ChannelCard />
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
  import ChannelCard from './components/ChannelCard';
  import messages from './i18n';

  export default {
    name: 'AlertChannel',
    i18n: {
      messages: messages,
    },
    components: {
      ChannelCard,
    },
  };
</script>
