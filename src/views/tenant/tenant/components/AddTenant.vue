<template>
  <BaseDialog v-model="dialog" icon="mdi-account-multiple-plus" title="创建租户" :width="500" @reset="reset">
    <template #content>
      <BaseSubTitle title="租户定义" />
      <v-card-text class="pa-2 mt-2">
        <v-form ref="form" v-model="valid" lazy-validation @submit.prevent>
          <v-sheet>
            <v-text-field
              v-model="obj.TenantName"
              class="my-0"
              label="名称"
              required
              :rules="objRules.tenantNameRules"
            />
            <v-textarea
              v-model="obj.Remark"
              auto-grow
              class="my-0"
              label="说明"
              required
              :rules="objRules.remarkRules"
            />
          </v-sheet>
        </v-form>
      </v-card-text>
    </template>
    <template #action>
      <v-btn class="float-right" color="primary" :loading="Circular" text @click="addTenant"> 确定 </v-btn>
    </template>
  </BaseDialog>
</template>

<script>
  import { mapState } from 'vuex';

  import { postAddTenant } from '@/api';
  import BaseResource from '@/mixins/resource';
  import BaseSelect from '@/mixins/select';
  import { k8sLabel, required } from '@/utils/rules';

  export default {
    name: 'AddTenant',
    mixins: [BaseResource, BaseSelect],
    data: () => ({
      dialog: false,
      valid: false,
      obj: {
        TenantName: '',
        Remark: '',
      },
    }),
    computed: {
      ...mapState(['Circular']),
      objRules() {
        return {
          tenantNameRules: [required, (v) => !!(v && v.length <= 20) || '超出20字符限制', k8sLabel],
          remarkRules: [required],
        };
      },
    },
    methods: {
      // eslint-disable-next-line vue/no-unused-properties
      open() {
        this.dialog = true;
      },
      async addTenant() {
        if (this.$refs.form.validate(true)) {
          await postAddTenant(this.obj);
          this.reset();
          this.$emit('refresh');
          this.$store.dispatch('UPDATE_TENANT_DATA');
        }
      },
      reset() {
        this.dialog = false;
        this.$refs.form.reset();
      },
    },
  };
</script>
