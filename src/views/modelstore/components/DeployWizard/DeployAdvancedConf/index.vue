<template>
  <div>
    <v-tabs v-model="tab" height="30">
      <v-tab v-for="item in tabItems" :key="item.value">
        {{ item.text }}
      </v-tab>
    </v-tabs>
    <component :is="tabItems[tab].value" :ref="tabItems[tab].value" />
  </div>
</template>

<script>
  import ImageDeploy from './ImageDeploy';
  import ModelDeploy from './ModelDeploy';

  export default {
    name: 'DeployAdvancedConf',
    components: {
      ModelDeploy,
      ImageDeploy,
    },
    data: function () {
      return {
        tab: 0,
        tabItems: [
          { text: '模型部署', value: 'ModelDeploy' },
          { text: '镜像部署', value: 'ImageDeploy' },
        ],
      };
    },
  };
</script>
