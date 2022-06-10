<template>
  <BaseDialog v-model="dialog" :width="500" title="更新租户" icon="mdi-account-multiple-plus" @reset="reset">
    <template #content>
      <BaseSubTitle title="租户定义" />
      <v-card-text class="pa-2 mt-2">
        <v-form ref="form" v-model="valid" lazy-validation @submit.prevent>
          <v-sheet>
            <v-text-field
              v-model="obj.TenantName"
              class="my-0"
              :rules="objRules.tenantNameRules"
              required
              label="名称"
              readonly
            />
            <v-textarea
              v-model="obj.Remark"
              class="my-0"
              :rules="objRules.remarkRules"
              auto-grow
              required
              label="说明"
            />
          </v-sheet>
        </v-form>
      </v-card-text>
    </template>
    <template #action>
      <v-btn class="float-right" color="primary" text :loading="Circular" @click="updateTenant"> 确定 </v-btn>
    </template>
  </BaseDialog>
</template>

<script>
  import { mapGetters, mapState } from 'vuex';
  import { putUpdateTenant } from '@/api';
  import BaseSelect from '@/mixins/select';
  import { deepCopy } from '@/utils/helpers';
  import { required } from '@/utils/rules';

  export default {
    name: 'UpdateTenant',
    mixins: [BaseSelect],
    data: () => ({
      dialog: false,
      valid: false,
      obj: {
        TenantID: 0,
        TenantName: '',
        Remark: '',
      },
      objRules: {
        tenantNameRules: [required],
        remarkRules: [required],
      },
    }),
    computed: {
      ...mapState(['Circular']),
      ...mapGetters(['Tenant']),
    },
    methods: {
      // eslint-disable-next-line vue/no-unused-properties
      open() {
        this.dialog = true;
      },
      async updateTenant() {
        if (this.$refs.form.validate(true)) {
          await putUpdateTenant(this.obj.TenantID, this.obj);
          await this.m_select_tenantSelectData();
          this.reset();
          this.$emit('refresh');
        }
      },
      // eslint-disable-next-line vue/no-unused-properties
      init(item) {
        const tenant = deepCopy(item);
        this.obj = {
          TenantID: tenant.ID,
          TenantName: tenant.TenantName,
          Remark: tenant.Remark,
        };
      },
      reset() {
        this.dialog = false;
        this.$refs.form.reset();
      },
    },
  };
</script>
