<template>
  <BaseDialog
    v-model="dialog"
    :width="500"
    title="更新网关实例"
    icon="mdi-gateway"
    @reset="reset"
  >
    <template #content>
      <component
        :is="formComponent"
        :ref="formComponent"
        :edit="true"
      />
    </template>
    <template #action>
      <v-btn
        class="float-right"
        color="primary"
        text
        :loading="Circular"
        @click="updateIstioGatewayInstance"
      >
        确定
      </v-btn>
    </template>
  </BaseDialog>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
import { putUpdateIstioGatewayInstance, getIstioGatewayInstanceDetail } from '@/api'
import IstioGatewayBaseForm from './IstioGatewayBaseForm'

export default {
  name: 'UpdateIstioGateway',
  components: {
    IstioGatewayBaseForm,
  },
  data: () => ({
    dialog: false,
    formComponent: 'IstioGatewayBaseForm',
  }),
  computed: {
    ...mapState(['Circular']),
    ...mapGetters(['VirtualSpace']),
  },
  methods: {
    // eslint-disable-next-line vue/no-unused-properties
    open() {
      this.dialog = true
    },
    async updateIstioGatewayInstance() {
      if (this.$refs[this.formComponent].$refs.form.validate(true)) {
        const data = this.$refs[this.formComponent].obj
        await putUpdateIstioGatewayInstance(
          this.VirtualSpace().ID,
          this.$route.query.clusterid,
          data,
        )
        this.reset()
        this.$emit('refresh')
      }
    },
    // eslint-disable-next-line vue/no-unused-properties
    async init(item) {
      const data = await getIstioGatewayInstanceDetail(
        this.VirtualSpace().ID,
        this.$route.query.clusterid,
        item.Name,
      )
      this.$refs[this.formComponent].setData(data)
    },
    reset() {
      this.dialog = false
      this.$refs[this.formComponent].reset()
    },
  },
}
</script>
