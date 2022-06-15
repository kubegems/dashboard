<template>
  <BaseDialog v-model="dialog" icon="mdi-star" title="配置第三方认证" :width="1000" @reset="reset">
    <template #content>
      <BaseSubTitle :title="`${obj.vendor} 认证定义`" />
      <v-form ref="form" v-model="valid" lazy-validation @submit.prevent>
        <v-card-text class="pa-2">
          <v-row>
            <v-col cols="6">
              <v-text-field v-model="obj.name" class="my-0" label="名称" readonly required :rules="objRules.nameRule" />
            </v-col>
          </v-row>
        </v-card-text>
        <component :is="formComponent" :ref="formComponent" :edit="edit" :item="item" :vendor="obj.vendor" />
      </v-form>
    </template>
    <template #action>
      <v-btn class="float-right" color="primary" :loading="Circular" text @click="updateAuthSource"> 确定 </v-btn>
    </template>
  </BaseDialog>
</template>

<script>
  import { mapState } from 'vuex';

  import OauthBaseForm from './auth_source/OauthBaseForm';
  import OpenLdapBaseForm from './auth_source/OpenLdapBaseForm';

  import { putAuthSourceConfig, postAuthSourceConfig } from '@/api';
  import BaseResource from '@/mixins/resource';
  import { deepCopy } from '@/utils/helpers';
  import { required } from '@/utils/rules';

  export default {
    name: 'ConfigAuthSource',
    components: {
      OauthBaseForm,
      OpenLdapBaseForm,
    },
    mixins: [BaseResource],
    data: () => ({
      dialog: false,
      valid: false,
      item: null,
      edit: false,
      formComponent: 'OauthBaseForm',
      formComponents: {
        oauth: 'OauthBaseForm',
        ldap: 'OpenLdapBaseForm',
        gitlab: 'OauthBaseForm',
        github: 'OauthBaseForm',
      },
      obj: {
        name: '',
        kind: 'OAUTH',
        vendor: '',
      },
    }),
    computed: {
      ...mapState(['Circular']),
      objRules() {
        return {
          vendorRule: [required],
          nameRule: [required],
        };
      },
    },
    methods: {
      open() {
        this.dialog = true;
      },
      init(item, edit) {
        this.edit = edit;
        this.obj = deepCopy(item);
        this.formComponent = this.formComponents[this.obj.vendor];
        if (this.edit) {
          this.$nextTick(() => {
            this.item = deepCopy(item);
          });
        }
      },
      async updateAuthSource() {
        if (this.$refs.form.validate(true) && this.$refs[this.formComponent].validate()) {
          if (this.formComponent === 'OauthBaseForm' || this.formComponent === 'OpenLdapBaseForm') {
            const data = Object.assign(this.obj, this.$refs[this.formComponent].getData());
            if (this.edit) {
              await putAuthSourceConfig(this.obj.id, data);
            } else {
              await postAuthSourceConfig(data);
            }
          }
          this.reset();
          this.$emit('refresh');
        }
      },
      reset() {
        this.dialog = false;
        this.$refs[this.formComponent].reset();
        this.formComponent = '';
      },
    },
  };
</script>
