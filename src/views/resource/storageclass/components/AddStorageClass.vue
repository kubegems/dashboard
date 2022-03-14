<template>
  <BaseDialog
    v-model="dialog"
    :width="1000"
    title="创建存储类型"
    icon="mdi-database-plus"
    @reset="reset"
  >
    <template #content>
      <BaseYamlForm
        ref="yamlForm"
        title="StorageClass"
      />
    </template>
    <template #action>
      <v-btn
        class="float-right"
        color="primary"
        text
        :loading="Circular"
        @click="addStorageClass"
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
import { postAddStorageClass } from '@/api'
import BaseResource from '@/mixins/resource'

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
    // eslint-disable-next-line vue/no-unused-properties
    open() {
      this.dialog = true
    },
    async addStorageClass() {
      if (this.$refs.yamlForm.$refs.form.validate(true)) {
        let data = this.$refs.yamlForm.kubeyaml
        data = this.$yamlload(data)
        if (!this.m_resource_checkDataWithOutNS(data)) return
        data = this.m_resource_beautifyData(data)
        await postAddStorageClass(this.ThisCluster, data.metadata.name, data)
        this.reset()
        this.$emit('refresh')
      }
    },
    reset() {
      this.dialog = false
      this.$refs.yamlForm.reset()
    },
  },
}
</script>
