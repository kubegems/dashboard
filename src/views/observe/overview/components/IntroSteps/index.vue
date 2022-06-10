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
  import LeftSteps from './LeftSteps';
  import Install from './Install';
  import Collect from './Collect';
  import Analyze from './Analyze';

  export default {
    name: 'IntroSteps',
    components: {
      LeftSteps,
      Install,
      Collect,
      Analyze,
    },
    data() {
      return {
        current: 'install',
      };
    },
  };
</script>
