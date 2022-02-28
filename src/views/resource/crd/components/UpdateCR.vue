m
<template>
  <BaseDialog
    v-model="dialog"
    :width="1000"
    title="更新自定义资源"
    icon="mdi-collage"
    @reset="reset"
  >
    <template #content>
      <YamlForm
        ref="yamlForm"
        :item="item"
        :title="crd ? crd.spec.names.kind : ''"
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
import YamlForm from '@/views/resource/components/common/YamlForm'
import BaseResource from '@/mixins/resource'
import { deepCopy } from '@/utils/helpers'

export default {
  name: 'UpdateCR',
  components: {
    YamlForm,
  },
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
      this.dialog = true
    },
    async updateCR() {
      if (this.$refs.yamlForm.$refs.form.validate(true)) {
        let data = this.$refs.yamlForm.kubeyaml
        data = this.$yamlload(data)
        if (this.crd.spec.scope === 'Cluster') {
          if (!this.checkDataWithOutNS(data)) return
        } else {
          const namespace = this.AdminViewport
            ? data.metadata.namespace
            : this.ThisNamespace
          if (!this.checkDataWithNS(data, namespace)) {
            return
          }
        }
        data = this.beautifyData(data)
        await patchUpdateCR(
          this.ThisCluster,
          this.item.metadata.namespace,
          this.item.metadata.name,
          this.crd.spec.group,
          this.crd.status.storedVersions[0],
          this.crd.spec.names.plural,
          this.crd.spec.scope,
          data,
        )
        this.reset()
        this.$emit('refresh')
      }
    },
    // eslint-disable-next-line vue/no-unused-properties
    async init(item, crd) {
      const data = await getCrDetail(
        this.ThisCluster,
        item.metadata.namespace,
        crd.spec.group,
        crd.status.storedVersions[0],
        crd.spec.names.plural,
        item.metadata.name,
        crd.spec.scope,
      )
      this.item = deepCopy(data)
      this.crd = deepCopy(crd)
    },
    reset() {
      this.dialog = false
      this.$refs.yamlForm.reset()
    },
  },
}
</script>
