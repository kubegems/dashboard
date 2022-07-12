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
