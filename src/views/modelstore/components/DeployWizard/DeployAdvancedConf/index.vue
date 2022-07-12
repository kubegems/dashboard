<template>
  <div>
    <v-tabs v-model="tab" height="30">
      <v-tab v-for="item in tabItems" :key="item.value">
        {{ item.text }}
      </v-tab>
    </v-tabs>
    <component :is="tabItems[tab].value" :ref="tabItems[tab].value" :base="base" :item="item" :spec="spec" />
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
    props: {
      base: {
        type: Object,
        default: () => null,
      },
      item: {
        type: Object,
        default: () => null,
      },
      spec: {
        type: Object,
        default: () => null,
      },
    },
    data() {
      return {
        tab: 0,
        tabItems: [
          { text: '模型部署', value: 'ModelDeploy' },
          // { text: '镜像部署', value: 'ImageDeploy' },
        ],
      };
    },
    methods: {
      validate() {
        return this.$refs[this.tabItems[this.tab].value].validate();
      },
      getData() {
        return this.$refs[this.tabItems[this.tab].value].getData();
      },
      reset() {
        this.$refs[this.tabItems[this.tab].value].reset();
      },
    },
  };
</script>
