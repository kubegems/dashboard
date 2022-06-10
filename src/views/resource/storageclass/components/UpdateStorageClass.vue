<template>
  <BaseDialog v-model="dialog" :width="1000" title="更新存储类型" icon="mdi-database" @reset="reset">
    <template #content>
      <BaseYamlForm ref="yamlForm" :item="item" title="StorageClass" />
    </template>
    <template #action>
      <v-btn class="float-right" color="primary" text :loading="Circular" @click="updateStorageClass"> 确定 </v-btn>
    </template>
    <template #header-action>
      <div class="text-h6 ml-2 white--text mt-1">Yaml</div>
    </template>
  </BaseDialog>
</template>

<script>
  import { mapState } from 'vuex';
  import { patchUpdateStorageClass, getStorageClassDetail } from '@/api';
  import BaseResource from '@/mixins/resource';
  import { deepCopy } from '@/utils/helpers';

  export default {
    name: 'UpdateStorageClass',
    mixins: [BaseResource],
    data: () => ({
      dialog: false,
      item: null,
    }),
    computed: {
      ...mapState(['Circular']),
    },
    methods: {
      // eslint-disable-next-line vue/no-unused-properties
      open() {
        this.dialog = true;
      },
      async updateStorageClass() {
        if (this.$refs.yamlForm.validate()) {
          let data = this.$refs.yamlForm.getYaml();
          data = this.$yamlload(data);
          if (!this.m_resource_checkDataWithOutNS(data)) return;
          data = this.m_resource_beautifyData(data);
          await patchUpdateStorageClass(this.ThisCluster, this.item.metadata.name, data);
          this.reset();
          this.$emit('refresh');
        }
      },
      // eslint-disable-next-line vue/no-unused-properties
      async init(item) {
        const data = await getStorageClassDetail(this.ThisCluster, item.metadata.name);
        this.item = deepCopy(data);
      },
      reset() {
        this.dialog = false;
        this.$refs.yamlForm.reset();
      },
    },
  };
</script>
