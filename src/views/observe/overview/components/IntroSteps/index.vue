<template>
  <v-row>
    <v-col cols="6">
      <v-card class="pa-4">
        <LeftSteps v-model="current" />
      </v-card>
    </v-col>
    <v-col cols="6" style="height: 100%">
      <v-card class="pa-4" style="height: 296px">
        <component :is="current" />
      </v-card>
    </v-col>
  </v-row>
</template>

<script>
  import Metrics from './Metrics';
  import Logs from './Logs';
  import Traces from './Traces';
  import LeftSteps from './LeftSteps';

  export default {
    name: 'IntroSteps',
    components: {
      Metrics,
      Logs,
      LeftSteps,
      Traces,
    },
    data() {
      return {
        current: 'install',
      };
    },
  };
</script>
