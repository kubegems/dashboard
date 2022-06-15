m
<template>
  <BaseDialog v-model="dialog" icon="mdi-collage" :title="title" :width="1000" @reset="reset">
    <template #content>
      <BaseYamlForm ref="yamlForm" :item="item" :title="item ? item.kind : ''" />
    </template>
    <template #action>
      <v-btn class="float-right" color="primary" :loading="Circular" text @click="updateCR"> 确定 </v-btn>
    </template>
    <template #header-action>
      <div class="text-h6 ml-2 white--text mt-1">Yaml</div>
    </template>
  </BaseDialog>
</template>

<script>
  import { mapState } from 'vuex';

  import { patchUpdateCR, getCrDetail } from '@/api';
  import BaseResource from '@/mixins/resource';
  import { deepCopy } from '@/utils/helpers';

  export default {
    name: 'UpdateResource',
    mixins: [BaseResource],
    props: {
      title: {
        type: String,
        default: () => '',
      },
    },
    data: () => ({
      dialog: false,
      item: null,
    }),
    computed: {
      ...mapState(['Circular', 'EnvironmentFilter']),
    },
    methods: {
      open() {
        this.dialog = true;
      },
      async updateCR() {
        if (this.$refs.yamlForm.validate()) {
          let data = this.$refs.yamlForm.getYaml();
          data = this.$yamlload(data);
          const namespace = this.AdminViewport ? data?.metadata?.namespace : this.ThisNamespace;
          if (!this.m_resource_checkDataWithNS(data, namespace)) {
            return;
          }
          data = this.m_resource_beautifyData(data);
          await patchUpdateCR(
            this.EnvironmentFilter.cluster,
            this.EnvironmentFilter.namespace,
            this.item.metadata.name,
            'networking.istio.io',
            'v1beta1',
            data.kind,
            '',
            data,
          );
          this.reset();
          this.$emit('refresh');
        }
      },
      async init(item) {
        const data = await getCrDetail(
          this.EnvironmentFilter.cluster,
          item.namespace,
          'networking.istio.io',
          'v1beta1',
          item.objectType,
          item.name,
          '',
        );
        this.item = deepCopy(data);
      },
      reset() {
        this.dialog = false;
        this.$refs.yamlForm.reset();
      },
    },
  };
</script>
