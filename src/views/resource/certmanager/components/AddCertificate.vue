<template>
  <BaseDialog v-model="dialog" icon="mdi-book-open" title="创建证书" :width="1000" @reset="reset">
    <template #content>
      <component :is="formComponent" :ref="formComponent" title="Certificate" />
    </template>
    <template #action>
      <v-btn class="float-right" color="primary" :loading="Circular" text @click="addCertificate"> 确定 </v-btn>
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

  import CertificateBaseForm from './CertificateBaseForm';
  import { postAddCertificate } from '@/api';
  import BaseResource from '@/mixins/resource';
  import { randomString } from '@/utils/helpers';
  import CertmanagerSchema from '@/views/resource/certmanager/mixins/schema';

  export default {
    name: 'AddCertificate',
    components: {
      CertificateBaseForm,
    },
    mixins: [BaseResource, CertmanagerSchema],
    data: () => ({
      dialog: false,
      yaml: false,
      formComponent: 'CertificateBaseForm',
      switchKey: '',
    }),
    computed: {
      ...mapState(['Circular', 'AdminViewport']),
    },
    methods: {
      open() {
        this.dialog = true;
      },
      async addCertificate() {
        if (this.$refs[this.formComponent].validate()) {
          const hasDns = this.$refs[this.formComponent].getData()?.spec?.dnsNames?.length > 0;
          if (!hasDns) {
            this.$store.commit('SET_SNACKBAR', {
              text: '请添加域名',
              color: 'warning',
            });
            return;
          }
          let data = '';
          if (this.formComponent === 'BaseYamlForm') {
            data = this.$refs[this.formComponent].getYaml();
            data = this.$yamlload(data);
            if (!this.m_resource_validateJsonSchema(this.schema, data)) {
              return;
            }
            data = this.m_resource_beautifyData(data);
          } else if (this.formComponent === 'CertificateBaseForm') {
            data = this.$refs[this.formComponent].getData();
            data = this.m_resource_beautifyData(data);
          }
          const namespace = this.AdminViewport ? data?.metadata?.namespace : this.ThisNamespace;
          if (!this.m_resource_checkDataWithNS(data, namespace)) {
            return;
          }
          await postAddCertificate(this.ThisCluster, namespace, data.metadata.name, data);
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
          this.formComponent = 'CertificateBaseForm';
          this.$nextTick(() => {
            this.$refs[this.formComponent].setData(data);
            this.$refs[this.formComponent].init();
          });
        }
      },
      reset() {
        this.dialog = false;
        this.$refs[this.formComponent].reset();
        this.formComponent = 'CertificateBaseForm';
        this.yaml = false;
      },
    },
  };
</script>
