<template>
  <BaseDialog
    v-model="dialog"
    :width="1000"
    title="更新集群"
    icon="mdi-server-plus"
    @reset="reset"
  >
    <template #content>
      <component
        :is="formComponent"
        :ref="formComponent"
        :edit="true"
        :control="control"
      />
    </template>
    <template #action>
      <v-btn
        class="float-right"
        color="primary"
        text
        :loading="Circular"
        @click="updateCluster"
      >
        确定
      </v-btn>
    </template>
  </BaseDialog>
</template>

<script>
import { mapState } from 'vuex'
import { putUpdateCluster, getClusterDetail } from '@/api'
import ClusterBaseForm from './ClusterBaseForm'
import BaseFilter from '@/mixins/base_filter'
import BaseSelect from '@/mixins/select'
import { deepCopy } from '@/utils/helpers'

export default {
  name: 'UpdateCluster',
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
    item: {},
  }),
  computed: {
    ...mapState(['Circular']),
  },
  methods: {
    // eslint-disable-next-line vue/no-unused-properties
    open() {
      this.dialog = true
    },
    async updateCluster() {
      if (this.$refs[this.formComponent].$refs.form.validate(true)) {
        const data = deepCopy(this.$refs[this.formComponent].obj)
        const config = this.$yamlload(data.KubeConfig)
        if (!data.KubeConfig) return
        await putUpdateCluster(data.ClusterID, {
          ClusterName: data.ClusterName,
          KubeConfig: config,
        })
        this.reset()
        this.$emit('refresh')
      }
    },
    // eslint-disable-next-line vue/no-unused-properties
    async init(item) {
      const data = await getClusterDetail(item.ID)
      this.item = data
      this.$refs[this.formComponent].setData({
        ClusterID: data.ID,
        ClusterName: data.ClusterName,
        Runtime: data.Runtime && data.Runtime !== '' ? data.Runtime : 'docker',
        KubeConfig: this.$yamldump(data.KubeConfig),
        Primary: data.Primary,
      })
    },
    reset() {
      this.dialog = false
      this.$refs[this.formComponent].reset()
    },
  },
}
</script>
