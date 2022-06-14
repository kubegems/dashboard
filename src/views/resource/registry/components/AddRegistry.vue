<template>
  <BaseDialog v-model="dialog" icon="mdi-database" title="创建镜像仓库" :width="500" @reset="reset">
    <template #content>
      <component :is="formComponent" :ref="formComponent" />
    </template>
    <template #action>
      <v-btn class="float-right" color="primary" :loading="Circular" text @click="addRegistry"> 确定 </v-btn>
    </template>
  </BaseDialog>
</template>

<script>
  import { mapGetters, mapState } from 'vuex';

  import RegistryBaseForm from './RegistryBaseForm';

  import { postAddRegistry } from '@/api';
  import BaseResource from '@/mixins/resource';

  export default {
    name: 'AddRegistry',
    components: {
      RegistryBaseForm,
    },
    mixins: [BaseResource],
    data: () => ({
      dialog: false,
      formComponent: 'RegistryBaseForm',
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
      async addRegistry() {
        if (this.$refs[this.formComponent].validate()) {
          const data = this.$refs[this.formComponent].getData();
          await postAddRegistry({ projectid: data.ProjectID }, data);
          this.reset();
          this.$emit('refresh');
        }
      },
      reset() {
        this.dialog = false;
        this.$refs[this.formComponent].reset();
      },
    },
  };
</script>
