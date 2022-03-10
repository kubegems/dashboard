<template>
  <BaseDialog
    v-model="dialog"
    :width="1000"
    title="更新istio端点认证"
    icon="mdi-vector-point"
    @reset="reset"
  >
    <template #content>
      <component
        :is="formComponent"
        :ref="formComponent"
        :item="item"
        :edit="true"
        title="PeerAuthentication"
      />
    </template>
    <template #action>
      <v-btn
        class="float-right"
        color="primary"
        text
        :loading="Circular"
        @click="updateIstioPeerAuthentication"
      >
        确定
      </v-btn>
    </template>
  </BaseDialog>
</template>

<script>
import { mapState } from 'vuex'
import {
  patchUpdateIstioPeerAuthentication,
  getIstioPeerAuthenticationDetail,
} from '@/api'
import YamlForm from '@/views/resource/components/common/YamlForm'
import BaseResource from '@/mixins/resource'
import IstioPeerAuthenticationSchema from '@/views/microservice/istio/peer-authentication/mixins/schema'
import { deepCopy } from '@/utils/helpers'

export default {
  name: 'UpdatePeerAuthentication',
  components: {
    YamlForm,
  },
  mixins: [BaseResource, IstioPeerAuthenticationSchema],
  data: () => ({
    dialog: false,
    item: null,
    formComponent: 'YamlForm',
  }),
  computed: {
    ...mapState(['Circular', 'EnvironmentFilter']),
  },
  methods: {
    // eslint-disable-next-line vue/no-unused-properties
    open() {
      this.dialog = true
    },
    async updateIstioPeerAuthentication() {
      if (this.$refs[this.formComponent].$refs.form.validate(true)) {
        let data = ''
        if (this.formComponent === 'YamlForm') {
          data = this.$refs[this.formComponent].kubeyaml
          data = this.$yamlload(data)
          if (!this.m_resource_checkDataWithOutNS(data)) return
          data = this.m_resource_beautifyData(data)
        }
        await patchUpdateIstioPeerAuthentication(
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
      const data = await getIstioPeerAuthenticationDetail(
        this.EnvironmentFilter.cluster,
        item.metadata.namespace,
        item.metadata.name,
      )
      this.item = deepCopy(data)
    },
    reset() {
      this.dialog = false
      this.$refs[this.formComponent].reset()
      this.formComponent = 'YamlForm'
    },
  },
}
</script>
