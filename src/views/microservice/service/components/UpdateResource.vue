m
<template>
  <BaseDialog
    v-model="dialog"
    :width="1000"
    :title="title"
    icon="mdi-collage"
    @reset="reset"
  >
    <template #content>
      <BaseYamlForm
        ref="yamlForm"
        :item="item"
        :title="item ? item.kind : ''"
      />
    </template>
    <template #action>
      <v-btn
        class="float-right"
        color="primary"
        text
        :loading="Circular"
        @click="updateCR"
      >
        确定
      </v-btn>
    </template>
    <template #header-action>
      <div class="text-h6 ml-2 primary--text mt-1">Yaml</div>
    </template>
  </BaseDialog>
</template>

<script>
import { mapState } from 'vuex'
import { patchUpdateCR, getCrDetail } from '@/api'
import BaseResource from '@/mixins/resource'
import { deepCopy } from '@/utils/helpers'

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
    // eslint-disable-next-line vue/no-unused-properties
    open() {
      this.dialog = true
    },
    async updateCR() {
      if (this.$refs.yamlForm.$refs.form.validate(true)) {
        let data = this.$refs.yamlForm.kubeyaml
        data = this.$yamlload(data)
        const namespace = this.AdminViewport
          ? data?.metadata?.namespace
          : this.ThisNamespace
        if (!this.m_resource_checkDataWithNS(data, namespace)) {
          return
        }
        data = this.m_resource_beautifyData(data)
        await patchUpdateCR(
          this.EnvironmentFilter.cluster,
          this.EnvironmentFilter.namespace,
          this.item.metadata.name,
          'networking.istio.io',
          'v1beta1',
          data.kind,
          '',
          data,
        )
        this.reset()
        this.$emit('refresh')
      }
    },
    // eslint-disable-next-line vue/no-unused-properties
    async init(item) {
      const data = await getCrDetail(
        this.EnvironmentFilter.cluster,
        item.namespace,
        'networking.istio.io',
        'v1beta1',
        item.objectType,
        item.name,
        '',
      )
      this.item = deepCopy(data)
    },
    reset() {
      this.dialog = false
      this.$refs.yamlForm.reset()
    },
  },
}
</script>
