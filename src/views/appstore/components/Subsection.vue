<template>
  <v-flex class="my-0 mt-0">
    <BaseSubTitle
      :title="label"
      :color="pathLevel === 1 ? 'grey lighten-3' : ''"
      class="my-0 mt-0"
      :divider="false"
    />
    <v-flex
      :v-if="param.children && param.children.length > 0"
      class="my-0 mt-0"
    >
      <Param
        v-for="(childrenParam, index) in param.children"
        :id="`${id}-${index}`"
        :key="`${id}-${index}`"
        :param="childrenParam"
        :all-params="allParams"
        :app-values="appValues"
        :cluster-name="clusterName"
        class="my-0 mt-0"
        v-bind="$attrs"
        v-on="$listeners"
      />
    </v-flex>
  </v-flex>
</template>

<script>
export default {
  name: 'Subsection',
  // 异步加载, 解决与Param组件循环引用的问题
  components: { Param: () => import('./DeployWizard/Param') },
  props: {
    appValues: {
      type: Object,
      default: () => {},
    },
    label: {
      type: String,
      default: () => '',
    },
    param: {
      type: Object,
      default: () => {},
    },
    allParams: {
      type: Array,
      default: () => [],
    },
    id: {
      type: String,
      default: () => '',
    },
    clusterName: {
      type: String,
      default: () => '',
    },
  },
  computed: {
    pathLevel() {
      return this.param.path.split('/').length
    },
  },
}
</script>

<style lang="scss" scoped>
.item-section {
  display: flex;
}
.item-value-section {
  width: 90%;
}
.item-action-section {
  width: 10%;
}
.item-action-section .item-action-button {
  margin-left: 2px;
  margin-top: 1px;
  width: 100%;
}
.el-form-item--mini.el-form-item,
.el-form-item--small.el-form-item {
  margin-bottom: 15px !important;
}

.env-diff {
  background: #f0ffff;
}

.subsection {
  border: 2px solid var(--cds-alias-object-border-color, #f1f1f1);
  border-radius: 5px;
  padding: 10px;
}
</style>
