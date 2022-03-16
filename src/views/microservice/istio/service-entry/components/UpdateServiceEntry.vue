<template>
  <BaseDialog
    v-model="dialog"
    :width="1000"
    title="更新istio服务入口"
    icon="mdi-login-variant"
    @reset="reset"
  >
    <template #content>
      <component
        :is="formComponent"
        :ref="formComponent"
        :item="item"
        :edit="true"
        title="ServiceEntry"
      />
    </template>
    <template #action>
      <v-btn
        class="float-right"
        color="primary"
        text
        :loading="Circular"
        @click="updateIstioServiceEntry"
      >
        确定
      </v-btn>
    </template>
  </BaseDialog>
</template>

<script>
import { mapState } from 'vuex'
import { patchUpdateIstioServiceEntry, getIstioServiceEntryDetail } from '@/api'
import BaseResource from '@/mixins/resource'
import IstioServiceEntrySchema from '@/views/microservice/istio/service-entry/mixins/schema'
import { deepCopy } from '@/utils/helpers'

export default {
  name: 'UpdateServiceEntry',
  mixins: [BaseResource, IstioServiceEntrySchema],
  data: () => ({
    dialog: false,
    item: null,
    formComponent: 'BaseYamlForm',
  }),
  computed: {
    ...mapState(['Circular', 'EnvironmentFilter']),
  },
  methods: {
    // eslint-disable-next-line vue/no-unused-properties
    open() {
      this.dialog = true
    },
    async updateIstioServiceEntry() {
      if (this.$refs[this.formComponent].$refs.form.validate(true)) {
        let data = ''
        if (this.formComponent === 'BaseYamlForm') {
          data = this.$refs[this.formComponent].kubeyaml
          data = this.$yamlload(data)
          if (!this.m_resource_checkDataWithOutNS(data)) return
          data = this.m_resource_beautifyData(data)
        }
        await patchUpdateIstioServiceEntry(
          this.EnvironmentFilter.cluster,
          this.item.metadata.namespace,
          this.item.metadata.name,
          data,
        )
        this.reset()
        this.$emit('refresh')
      }
    },
    // eslint-disable-next-line vue/no-unused-properties
    async init(item) {
      const data = await getIstioServiceEntryDetail(
        this.EnvironmentFilter.cluster,
        item.metadata.namespace,
        item.metadata.name,
      )
      this.item = deepCopy(data)
    },
    reset() {
      this.dialog = false
      this.$refs[this.formComponent].reset()
      this.formComponent = 'BaseYamlForm'
    },
  },
}
</script>
