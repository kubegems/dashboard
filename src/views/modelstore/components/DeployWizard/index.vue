<template>
  <FormWizard
    back-button-text="上一步"
    :class="`px-8 pt-8`"
    color="#1e88e5"
    error-color="#e74c3c"
    finish-button-text="部署"
    next-button-text="下一步"
    shape="tab"
    :start-index="0"
    step-size="sm"
    subtitle=""
    title=""
  >
    <TabContent
      :before-change="validateBaseInfo"
      :class="`kubegems__wizard-tab-content mt-8`"
      icon="ti-info-alt"
      title="基本配置"
    >
      <DeployBaseConf />
    </TabContent>
    <TabContent :class="`kubegems__wizard-tab-content mt-12`" icon="ti-settings" :lazy="false" title="详细配置">
      <DeployAdvancedConf />
    </TabContent>
    <TabContent :class="`kubegems__wizard-tab-content mt-12`" icon="ti-check" :lazy="false" title="完成">
      <DeployStatus />
    </TabContent>
    <template #footer="props">
      <v-flex class="kubegems__wizard-footer" :style="`right:${footerWidth}px;`">
        <v-btn v-show="props.activeTabIndex > 0" color="primary" text @click.native="props.prevTab()"> 上一步 </v-btn>
        <v-btn v-if="props.activeTabIndex === 0" color="primary" text @click.native="nextStep(props)"> 下一步 </v-btn>

        <v-btn v-if="props.activeTabIndex === 1" color="primary" :loading="Circular" text> 部署 </v-btn>
      </v-flex>
    </template>
  </FormWizard>
</template>

<script>
  import { FormWizard, TabContent } from 'vue-form-wizard';
  import { mapState } from 'vuex';

  import DeployAdvancedConf from './DeployAdvancedConf';
  import DeployBaseConf from './DeployBaseConf';
  import DeployStatus from './DeployStatus';
  import BaseSelect from '@/mixins/select';

  import 'vue-form-wizard/dist/vue-form-wizard.min.css';

  export default {
    name: 'DeployWizard',
    components: {
      DeployAdvancedConf,
      DeployBaseConf,
      DeployStatus,
      FormWizard,
      TabContent,
    },
    mixins: [BaseSelect],
    props: {},
    data() {
      return {};
    },
    computed: {
      ...mapState(['AdminViewport', 'Scale']),
      footerWidth() {
        return (window.innerWidth / this.Scale / 12) * 9 + 10;
      },
    },
    destroyed() {
      if (this.timeout) {
        clearTimeout(this.timeout);
      }
    },
    methods: {
      async nextStep(props) {
        this.tab = 1;
        await props.nextTab();
      },
      validateBaseInfo() {},
    },
  };
</script>

<style lang="scss">
  /* 覆盖样式 */
  .vue-form-wizard .wizard-tab-content {
    padding: 0 0 0;
  }
  .vue-form-wizard .wizard-card-footer {
    padding: 0 0;
  }
  .wizard-form-content {
    margin-bottom: 0;
    padding: 0;
  }
  .vue-form-wizard .wizard-header {
    padding: 0;
  }
  .vue-form-wizard {
    padding-bottom: 0;
  }
</style>
