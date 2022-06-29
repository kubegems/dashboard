<template>
  <v-form lazy-validation @submit.prevent>
    <BaseSubTitle class="mt-3" color="grey lighten-3" :divider="false" title="模型信息" />
    <v-card-text class="pa-2">
      <v-row>
        <v-col cols="12">
          <v-autocomplete
            label="Processor"
            :menu-props="{
              bottom: true,
              left: true,
              origin: `top center`,
            }"
          />
        </v-col>
        <v-col cols="2">
          <v-checkbox hide-details label="在线导入" />
        </v-col>
        <v-col cols="4">
          <v-checkbox hide-details label="kubegems modelx 导入" />
        </v-col>
      </v-row>
    </v-card-text>

    <ResourceConf />
  </v-form>
</template>

<script>
  import ResourceConf from './ResourceConf';

  export default {
    name: 'ModelDeploy',
    components: {
      ResourceConf,
    },
  };
</script>
