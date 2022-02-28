<template>
  <BaseDialog
    v-model="dialog"
    :width="1000"
    title="创建集群"
    icon="mdi-server-plus"
    @reset="reset"
  >
    <template #content>
      <component
        :is="formComponent"
        :ref="formComponent"
        :control="control"
      />
    </template>
    <template #action>
      <v-btn
        class="float-right"
        color="primary"
        text
        :loading="Circular"
        @click="addCluster"
      >
        确定
      </v-btn>
    </template>
  </BaseDialog>
</template>

<script>
import { mapState } from 'vuex'
import { postAddCluster } from '@/api'
import ClusterBaseForm from './ClusterBaseForm'
import BaseFilter from '@/mixins/base_filter'
import BaseSelect from '@/mixins/select'

export default {
  name: 'AddCluster',
  components: {
    ClusterBaseForm,
  },
  mixins: [BaseFilter, BaseSelect],
  props: {
    control: {
      type: Boolean,
      default: () => false,
    },
  },
  data: () => ({
    dialog: false,
    formComponent: 'ClusterBaseForm',
  }),
  computed: {
    ...mapState(['Circular']),
  },
  methods: {
    // eslint-disable-next-line vue/no-unused-properties
    open() {
      this.dialog = true
    },
    async addCluster() {
      if (this.$refs[this.formComponent].$refs.form.validate(true)) {
        const data = this.$refs[this.formComponent].obj
        const config = this.$yamlload(data.KubeConfig)
        if (!config) return
        await postAddCluster({
          ClusterName: data.ClusterName,
          Runtime: data.Runtime,
          Primary: data.Primary,
          KubeConfig: config,
        })
        this.reset()
        this.$emit('refresh')
      }
    },
    reset() {
      this.dialog = false
      this.$refs[this.formComponent].reset()
    },
  },
}
</script>
