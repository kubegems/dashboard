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
  <FormWizard
    ref="wizard"
    :back-button-text="$root.$t('operate.previous')"
    :class="`px-8 pt-8`"
    color="#1e88e5"
    error-color="#e74c3c"
    :finish-button-text="$root.$t('operate.deploy')"
    :next-button-text="$root.$t('operate.next')"
    shape="tab"
    :start-index="0"
    step-size="sm"
    subtitle=""
    title=""
  >
    <TabContent
      :before-change="validateBaseInfo"
      :class="`kubegems__wizard-tab-content mt-8`"
      icon="mdi mdi-information"
      :title="$t('tip.basic_config')"
    >
      <DeployBaseConf ref="baseConf" :base="obj.base" :item="item" />
    </TabContent>
    <TabContent
      :class="`kubegems__wizard-tab-content mt-12`"
      icon="mdi mdi-cog"
      :lazy="false"
      :title="$t('tip.detail_config')"
    >
      <DeployAdvancedConf ref="advancedConf" :base="obj.base" :item="item" :spec="obj.spec" />
    </TabContent>
    <TabContent
      :class="`kubegems__wizard-tab-content mt-12`"
      icon="mdi mdi-check"
      :lazy="false"
      :title="$t('tip.complete')"
    >
      <DeployStatus :base="obj.base" :item="item" :processing="processing" @showDeployStatus="showDeployStatus" />
    </TabContent>
    <template #footer="props">
      <v-flex class="kubegems__wizard-footer" :style="`right:${footerWidth}px;`">
        <v-btn v-show="props.activeTabIndex > 0" color="primary" text @click.native="props.prevTab()">
          {{ $root.$t('operate.previous') }}
        </v-btn>
        <v-btn v-if="props.activeTabIndex === 0" color="primary" text @click.native="nextStep(props)">
          {{ $root.$t('operate.next') }}
        </v-btn>

        <v-btn v-if="props.activeTabIndex === 1" color="primary" :loading="Circular" text @click="deploy">
          {{ $root.$t('operate.deploy') }}
        </v-btn>
      </v-flex>
    </template>
  </FormWizard>
</template>

<script>
  import { FormWizard, TabContent } from 'vue-form-wizard';
  import { mapGetters, mapState } from 'vuex';

  import messages from '../../i18n';
  import DeployAdvancedConf from './DeployAdvancedConf';
  import DeployBaseConf from './DeployBaseConf';
  import DeployStatus from './DeployStatus';
  import { postDeployModel } from '@/api';
  import BaseSelect from '@/mixins/select';

  import 'vue-form-wizard/dist/vue-form-wizard.min.css';

  export default {
    name: 'DeployWizard',
    i18n: {
      messages: messages,
    },
    components: {
      DeployAdvancedConf,
      DeployBaseConf,
      DeployStatus,
      FormWizard,
      TabContent,
    },
    mixins: [BaseSelect],
    props: {
      item: {
        type: Object,
        default: () => null,
      },
    },
    data() {
      return {
        obj: {
          base: {
            name: '',
            tenant: '',
            project: '',
            environment: '',
            version: '',
          },
          metadata: {
            name: '',
          },
          spec: {
            host: '',
            model: {
              name: '',
              url: '',
              version: '',
              source: '',
            },
            server: {
              args: [],
              command: [],
              env: [],
              image: '',
              ports: [],
              resources: {
                limits: {
                  cpu: 2,
                  memory: '4Gi',
                },
              },
            },
            replicas: 1,
          },
        },
        processing: false,
      };
    },
    computed: {
      ...mapState(['AdminViewport', 'Scale', 'Circular']),
      ...mapGetters(['Tenant']),
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
        await props.nextTab();
      },
      validateBaseInfo() {
        const validate = this.$refs.baseConf.validate();
        if (validate) {
          const base = this.$refs.baseConf.getData();
          this.obj.base = base;
        }
        return validate;
      },
      async deploy() {
        if (this.$refs.advancedConf.validate()) {
          const spec = this.$refs.advancedConf.getData();
          this.obj.spec = spec;
          this.obj.spec.model.source = this.item.source;
          this.obj.spec.model.name = this.item.name;
          this.obj.metadata.name = this.obj.base.name;
          this.obj.spec.model.version = this.obj.base.version;

          await postDeployModel(this.Tenant().TenantName, this.obj.base.project, this.obj.base.environment, {
            metadata: this.obj.metadata,
            spec: this.obj.spec,
          });
          this.$refs.wizard.nextTab();
          this.processing = true;
        }
      },
      reset() {
        this.$refs.wizard.reset();
        this.processing = false;
        if (this.$refs.baseConf) this.$refs.baseConf.reset();
        if (this.$refs.advancedConf) this.$refs.advancedConf.reset();
        this.obj = this.$options.data().obj;
      },
      showDeployStatus(base) {
        this.$emit('dispose');
        this.$router.push({
          name: 'app-list',
          params: {
            tenant: this.Tenant().TenantName,
            project: base.project,
            environment: base.environment,
          },
          query: {
            kind: 'modelstore',
            tab: 'modelstore',
          },
        });
      },
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
