<template>
  <BaseDialog v-model="dialog" :width="1000" title="创建采集器" icon="mdi-arrange-send-backward" @reset="reset">
    <template #content>
      <component :is="formComponent" :ref="formComponent" title="Flow/ClusterFlow" />
    </template>
    <template #action>
      <v-btn class="float-right" color="primary" text :loading="Circular" @click="addFlow"> 确定 </v-btn>
    </template>
    <template #header-action>
      <v-switch
        :key="switchKey"
        v-model="yaml"
        class="ma-0 pl-2 ml-2 mt-1"
        style="margin-top: 8px !important"
        color="white"
        hide-details
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
  import FlowBaseForm from './FlowBaseForm';
  import FlowSchema from '../mixins/schema';
  import { postFlowData, postClusterFlowData } from '@/api';
  import BaseResource from '@/mixins/resource';
  import { randomString } from '@/utils/helpers';

  export default {
    name: 'AddFlow',
    components: {
      FlowBaseForm,
    },
    mixins: [BaseResource, FlowSchema],
    data: () => ({
      dialog: false,
      yaml: false,
      formComponent: 'FlowBaseForm',
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
      async addFlow() {
        if (!this.$refs[this.formComponent]) {
          return;
        }
        if (!this.$refs[this.formComponent].checkSaved()) {
          this.$store.commit('SET_SNACKBAR', {
            text: '请保存数据',
            color: 'warning',
          });
          return;
        }
        if (this.$refs[this.formComponent].validate()) {
          let data = '';
          if (this.formComponent === 'BaseYamlForm') {
            data = this.$refs[this.formComponent].getYaml();
            data = this.$yamlload(data);
            if (!this.m_resource_validateJsonSchema(this.schema, data)) {
              return;
            }
            data = this.m_resource_beautifyData(data);
          } else if (this.formComponent === 'FlowBaseForm') {
            data = this.$refs[this.formComponent].getData();
            data = this.m_resource_beautifyData(data);
          }
          const action = data.kind === 'Flow' ? postFlowData : postClusterFlowData;
          await action(this.$route.query.cluster, this.$route.query.namespace, data.metadata.name, data);
          this.reset();
          this.$emit('refresh');
        }
      },
      onYamlSwitchChange() {
        if (this.yaml) {
          const data = this.$refs[this.formComponent].getData();
          this.m_resource_addNsToData(data, this.$route.query.namespace);
          this.formComponent = 'BaseYamlForm';
          this.$nextTick(() => {
            this.$refs[this.formComponent].setYaml(this.$yamldump(data));
          });
        } else {
          const yaml = this.$refs[this.formComponent].getYaml();
          const data = this.$yamlload(yaml);
          this.m_resource_addNsToData(data, this.$route.query.namespace);
          if (!this.m_resource_validateJsonSchema(this.schema, data)) {
            this.yaml = true;
            this.switchKey = randomString(6);
            return;
          }
          this.formComponent = 'FlowBaseForm';
          this.$nextTick(() => {
            this.$refs[this.formComponent].setData(data);
          });
        }
      },
      reset() {
        this.dialog = false;
        this.$refs[this.formComponent].reset();
        this.formComponent = 'FlowBaseForm';
        this.yaml = false;
      },
    },
  };
</script>
