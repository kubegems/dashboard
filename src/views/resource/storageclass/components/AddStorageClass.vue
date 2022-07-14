<template>
  <BaseDialog v-model="dialog" icon="mdi-database-plus" title="创建存储类型" :width="1000" @reset="reset">
    <template #content>
      <BaseYamlForm ref="yamlForm" title="StorageClass" />
    </template>
    <template #action>
      <v-btn class="float-right" color="primary" :loading="Circular" text @click="addStorageClass"> 确定 </v-btn>
    </template>
    <template #header-action>
      <div class="text-h6 ml-2 white--text mt-1">Yaml</div>
    </template>
  </BaseDialog>
</template>

<script>
  import { mapState } from 'vuex';

  import { postAddStorageClass } from '@/api';
  import BaseResource from '@/mixins/resource';

  export default {
    name: 'AddStorageClass',
    mixins: [BaseResource],
    data: () => ({
      dialog: false,
    }),
    computed: {
      ...mapState(['Circular']),
    },
    methods: {
      open() {
        this.dialog = true;
      },
      async addStorageClass() {
        if (this.$refs.yamlForm.validate()) {
          let data = this.$refs.yamlForm.getYaml();
          data = this.$yamlload(data);
          if (!this.m_resource_checkDataWithOutNS(data)) return;
          data = this.m_resource_beautifyData(data);
          await postAddStorageClass(this.ThisCluster, data.metadata.name, data);
          this.reset();
          this.$emit('refresh');
        }
      },
      reset() {
        this.dialog = false;
        this.$refs.yamlForm.reset();
      },
    },
  };
</script>
