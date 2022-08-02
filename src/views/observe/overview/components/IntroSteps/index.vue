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
    <v-col cols="5">
      <v-card class="pa-2" flat height="100%">
        <LeftSteps v-model="current" />
      </v-card>
    </v-col>
    <v-col cols="7">
      <v-card class="pa-4" flat height="100%">
        <component :is="current" />
      </v-card>
    </v-col>
  </v-row>
</template>

<script>
  import LeftSteps from './LeftSteps';
  import Logs from './Logs';
  import Metrics from './Metrics';
  import Traces from './Traces';

  export default {
    name: 'IntroSteps',
    components: {
      LeftSteps,
      Logs,
      Metrics,
      Traces,
    },
    data() {
      return {
        current: 'Metrics',
      };
    },
  };
</script>
