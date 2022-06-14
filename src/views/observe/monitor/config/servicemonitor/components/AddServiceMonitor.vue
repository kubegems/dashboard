<template>
  <BaseDialog v-model="dialog" icon="mdi-eyedropper" title="创建采集器" :width="1000" @reset="reset">
    <template #content>
      <component :is="formComponent" :ref="formComponent" title="ServiceMonitor" />
    </template>
    <template #action>
      <v-btn class="float-right" color="primary" :loading="Circular" text @click="addServiceMonitor"> 确定 </v-btn>
    </template>
    <template #header-action>
      <v-switch
        :key="switchKey"
        v-model="yaml"
        class="ma-0 pl-2 ml-2 mt-1"
        color="white"
        hide-details
        style="margin-top: 8px !important"
        @change="onYamlSwitchChange"
      >
        <template #label>
          <span class="text-subject-1 white--text font-weight-medium"> YAML </span>
        </template>
      </v-switch>
    </template>
  </BaseDialog>
</template>

<script>
  import { mapState } from 'vuex';

  import ServiceMonitorSchema from '../mixins/schema';
  import ServiceMonitorBaseForm from './ServiceMonitorBaseForm';

  import { postAddServiceMonitor } from '@/api';
  import BaseResource from '@/mixins/resource';
  import { randomString } from '@/utils/helpers';

  export default {
    name: 'AddServiceMonitor',
    components: {
      ServiceMonitorBaseForm,
    },
    mixins: [BaseResource, ServiceMonitorSchema],
    data: () => ({
      dialog: false,
      yaml: false,
      formComponent: 'ServiceMonitorBaseForm',
      switchKey: '',
    }),
    computed: {
      ...mapState(['Circular', 'AdminViewport']),
    },
    methods: {
      // eslint-disable-next-line vue/no-unused-properties
      open() {
        this.dialog = true;
      },
      async addServiceMonitor() {
        if (this.$refs[this.formComponent].validate()) {
          let data = '';
          if (this.formComponent === 'BaseYamlForm') {
            data = this.$refs[this.formComponent].getYaml();
            data = this.$yamlload(data);
            if (!this.checkDataWithNS(data, this.$route.query.namespace)) {
              return;
            }
            if (!this.m_resource_validateJsonSchema(this.schema, data)) {
              return;
            }
          } else if (this.formComponent === 'ServiceMonitorBaseForm') {
            data = this.$refs[this.formComponent].getData();
          }
          await postAddServiceMonitor(this.$route.query.cluster, this.$route.query.namespace, data.metadata.name, data);
          this.reset();
          this.$emit('refresh');
        }
      },
      onYamlSwitchChange() {
        if (this.yaml) {
          const data = this.$refs[this.formComponent].getData();
          this.formComponent = 'BaseYamlForm';
          this.$nextTick(() => {
            this.$refs[this.formComponent].setYaml(this.$yamldump(data));
          });
        } else {
          const yaml = this.$refs[this.formComponent].getYaml();
          const data = this.$yamlload(yaml);
          if (!this.m_resource_validateJsonSchema(this.schema, data)) {
            this.yaml = true;
            this.switchKey = randomString(6);
            return;
          }
          this.formComponent = 'ServiceMonitorBaseForm';
          this.$nextTick(() => {
            this.$refs[this.formComponent].setData(data);
          });
        }
      },
      reset() {
        this.dialog = false;
        this.formComponent = 'ServiceMonitorBaseForm';
        if (this.$refs[this.formComponent]) {
          this.$refs[this.formComponent]?.reset();
        }
        this.yaml = false;
      },
    },
  };
</script>
