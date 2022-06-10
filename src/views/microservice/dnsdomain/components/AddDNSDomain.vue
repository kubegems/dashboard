<template>
  <BaseDialog
    v-model="dialog"
    :width="500"
    title="创建DNS"
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
        @click="addDNSDomain"
      >
        确定
      </v-btn>
    </template>
  </BaseDialog>
</template>

<script>
import { mapState } from 'vuex'
import { postAddDNSDomain } from '@/api'
import DNSDomainBaseForm from './DNSDomainBaseForm'
import BaseResource from '@/mixins/resource'

export default {
  name: 'AddDNSDomain',
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
  },
  methods: {
    // eslint-disable-next-line vue/no-unused-properties
    open() {
      this.dialog = true
    },
    async addDNSDomain() {
      if (this.$refs[this.formComponent].validate()) {
        const data = this.$refs[this.formComponent].getData()
        await postAddDNSDomain(data)
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
