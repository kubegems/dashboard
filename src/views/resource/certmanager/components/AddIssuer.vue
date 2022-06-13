<template>
  <BaseDialog v-model="dialog" :width="1000" title="创建颁发机构" icon="mdi-book-open" @reset="reset">
    <template #content>
      <component :is="formComponent" :ref="formComponent" title="Issuer" />
    </template>
    <template #action>
      <v-btn class="float-right" color="primary" text :loading="Circular" @click="addIssuer"> 确定 </v-btn>
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
  import IssuerBaseForm from './IssuerBaseForm';
  import { postAddIssuer } from '@/api';
  import BaseResource from '@/mixins/resource';
  import IssuerSchema from '@/views/resource/certmanager/mixins/issuerSchema';
  import { randomString } from '@/utils/helpers';

  export default {
    name: 'AddIssuer',
    components: {
      IssuerBaseForm,
    },
    mixins: [BaseResource, IssuerSchema],
    data: () => ({
      dialog: false,
      yaml: false,
      formComponent: 'IssuerBaseForm',
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
      async addIssuer() {
        if (this.$refs[this.formComponent].validate()) {
          let data = '';
          if (this.formComponent === 'BaseYamlForm') {
            data = this.$refs[this.formComponent].getYaml();
            data = this.$yamlload(data);
            if (!this.m_resource_validateJsonSchema(this.schema, data)) {
              return;
            }
            data = this.m_resource_beautifyData(data);
          } else if (this.formComponent === 'IssuerBaseForm') {
            data = this.$refs[this.formComponent].getData();
            data = this.m_resource_beautifyData(data);
          }
          const namespace = this.AdminViewport ? data?.metadata?.namespace : this.ThisNamespace;
          if (!this.m_resource_checkDataWithNS(data, namespace)) {
            return;
          }
          await postAddIssuer(this.ThisCluster, namespace, data.metadata.name, data);
          this.reset();
          this.$emit('refresh');
        }
      },
      onYamlSwitchChange() {
        if (this.yaml) {
          const data = this.$refs[this.formComponent].getData();
          this.m_resource_addNsToData(data, this.AdminViewport ? data?.metadata?.namespace : this.ThisNamespace);
          this.formComponent = 'BaseYamlForm';
          this.$nextTick(() => {
            this.$refs[this.formComponent].setYaml(this.$yamldump(data));
          });
        } else {
          const yaml = this.$refs[this.formComponent].getYaml();
          const data = this.$yamlload(yaml);
          this.m_resource_addNsToData(data, this.AdminViewport ? data?.metadata?.namespace : this.ThisNamespace);
          if (!this.m_resource_validateJsonSchema(this.schema, data)) {
            this.yaml = true;
            this.switchKey = randomString(6);
            return;
          }
          this.formComponent = 'IssuerBaseForm';
          this.$nextTick(() => {
            this.$refs[this.formComponent].setData(data);
            this.$refs[this.formComponent].init();
          });
        }
      },
      reset() {
        this.dialog = false;
        this.$refs[this.formComponent].reset();
        this.formComponent = 'IssuerBaseForm';
        this.yaml = false;
      },
    },
  };
</script>
