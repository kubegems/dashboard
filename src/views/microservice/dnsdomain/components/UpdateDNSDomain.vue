<template>
  <BaseDialog
    v-model="dialog"
    :width="500"
    title="更新DNS"
    icon="mdi-dns"
    @reset="reset"
  >
    <template #content>
      <component
        :is="formComponent"
        :ref="formComponent"
      />
    </template>
    <template #action>
      <v-btn
        class="float-right"
        color="primary"
        text
        :loading="Circular"
        @click="updateDNSDomain"
      >
        确定
      </v-btn>
    </template>
  </BaseDialog>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
import { putUpdateDNSDomain, getDnsDomainDetail } from '@/api'
import DNSDomainBaseForm from './DNSDomainBaseForm'
import BaseResource from '@/mixins/resource'

export default {
  name: 'UpdateDNSDomain',
  components: {
    DNSDomainBaseForm,
  },
  mixins: [BaseResource],
  data: () => ({
    dialog: false,
    formComponent: 'DNSDomainBaseForm',
  }),
  computed: {
    ...mapState(['Circular']),
    ...mapGetters(['Tenant']),
  },
  methods: {
    // eslint-disable-next-line vue/no-unused-properties
    open() {
      this.dialog = true
    },
    async updateDNSDomain() {
      if (this.$refs[this.formComponent].$refs.form.validate(true)) {
        const data = this.$refs[this.formComponent].obj
        await putUpdateDNSDomain(data.ID, data)
        this.reset()
        this.$emit('refresh')
      }
    },
    // eslint-disable-next-line vue/no-unused-properties
    async init(item) {
      const data = await getDnsDomainDetail(item.ID)
      this.$refs.DNSDomainBaseForm.obj = {
        ...data,
        VirtualDomainID: data.ID,
      }
    },
    reset() {
      this.dialog = false
      this.$refs[this.formComponent].reset()
    },
  },
}
</script>
