<template>
  <BaseDialog v-model="dialog" icon="mdi-road" title="更新路由器" :width="1000" @reset="reset">
    <template #content>
      <component :is="formComponent" :ref="formComponent" :edit="true" :item="item" title="Output/ClusterOutput" />
    </template>
    <template #action>
      <v-btn class="float-right" color="primary" :loading="Circular" text @click="updateOutput"> 确定 </v-btn>
    </template>
    <template #header-action>
      <v-switch
        :key="switchKey"
        v-model="yaml"
        class="ma-0 pl-2 ml-2 mt-1"
        color="white"
        hide-details
        :style="{ marginTop: `8px !important` }"
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

  import OutputSchema from '../mixins/schema';
  import OutputBaseForm from './OutputBaseForm';
  import { getClusterOutputDetailData, getOutputDetailData, patchClusterOutputData, patchOutputData } from '@/api';
  import BaseResource from '@/mixins/resource';
  import { deepCopy, randomString } from '@/utils/helpers';

  export default {
    name: 'UpdateOutput',
    components: {
      OutputBaseForm,
    },
    mixins: [BaseResource, OutputSchema],
    data: () => ({
      dialog: false,
      yaml: false,
      item: null,
      formComponent: 'OutputBaseForm',
      switchKey: '',
    }),
    computed: {
      ...mapState(['Circular', 'AdminViewport']),
    },
    methods: {
      open() {
        this.dialog = true;
      },
      async init(item) {
        this.item = null;
        const action = item.kind === 'Output' ? getOutputDetailData : getClusterOutputDetailData;
        const data = await action(this.$route.query.cluster, item.metadata.namespace, item.metadata.name);
        this.item = deepCopy(data);
      },
      async updateOutput() {
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
          } else if (this.formComponent === 'OutputBaseForm') {
            data = this.$refs[this.formComponent].getData();
            data = this.m_resource_beautifyData(data);
          }
          const action = data.kind === 'Output' ? patchOutputData : patchClusterOutputData;
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
          this.formComponent = 'OutputBaseForm';
          this.$nextTick(() => {
            this.$refs[this.formComponent].setData(data);
          });
        }
      },
      reset() {
        this.dialog = false;
        this.$refs[this.formComponent].reset();
        this.formComponent = 'OutputBaseForm';
        this.yaml = false;
      },
    },
  };
</script>
