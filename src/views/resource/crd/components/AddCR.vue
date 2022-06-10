m
<template>
  <BaseDialog v-model="dialog" :width="1000" title="创建自定义资源" icon="mdi-collage" @reset="reset">
    <template #content>
      <BaseYamlForm ref="yamlForm" :item="item" :title="crd ? crd.spec.names.kind : ''" />
    </template>
    <template #action>
      <v-btn class="float-right" color="primary" text :loading="Circular" @click="addCR"> 确定 </v-btn>
    </template>
    <template #header-action>
      <div class="text-h6 ml-2 white--text mt-1">Yaml</div>
    </template>
  </BaseDialog>
</template>

<script>
  import { mapState } from 'vuex';
  import { postAddCR } from '@/api';
  import BaseResource from '@/mixins/resource';
  import { deepCopy } from '@/utils/helpers';

  export default {
    name: 'AddCR',
    mixins: [BaseResource],
    data: () => ({
      dialog: false,
      item: null,
      crd: null,
    }),
    computed: {
      ...mapState(['Circular']),
    },
    methods: {
      // eslint-disable-next-line vue/no-unused-properties
      open() {
        this.dialog = true;
      },
      async addCR() {
        if (this.$refs.yamlForm.validate()) {
          let data = this.$refs.yamlForm.getYaml();
          data = this.$yamlload(data);
          let namespace = '';
          if (this.crd.spec.scope === 'Cluster') {
            namespace = '';
            if (!this.m_resource_checkDataWithOutNS(data)) return;
          } else {
            namespace = this.AdminViewport ? data?.metadata?.namespace : this.ThisNamespace;
            if (!this.m_resource_checkDataWithNS(data, namespace)) {
              return;
            }
          }
          data = this.m_resource_beautifyData(data);
          await postAddCR(
            this.ThisCluster,
            namespace,
            data.metadata.name,
            this.crd.spec.group,
            this.crd.status.storedVersions[0],
            this.crd.spec.names.plural,
            this.crd.spec.scope,
            data,
          );
          this.reset();
          this.$emit('refresh');
        }
      },
      // eslint-disable-next-line vue/no-unused-properties
      async init(crd) {
        this.crd = deepCopy(crd);
      },
      reset() {
        this.dialog = false;
        this.$refs.yamlForm.reset();
      },
    },
  };
</script>
