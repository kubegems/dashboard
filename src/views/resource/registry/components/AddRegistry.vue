<template>
  <BaseDialog
    v-model="dialog"
    :width="500"
    title="创建镜像仓库"
    icon="mdi-database"
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
        @click="addRegistry"
      >
        确定
      </v-btn>
    </template>
  </BaseDialog>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
import { postAddRegistry } from '@/api'
import RegistryBaseForm from './RegistryBaseForm'
import BaseResource from '@/mixins/resource'

export default {
  name: 'AddRegistry',
  components: {
    RegistryBaseForm,
  },
  mixins: [BaseResource],
  data: () => ({
    dialog: false,
    formComponent: 'RegistryBaseForm',
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
    async addRegistry() {
      if (this.$refs[this.formComponent].$refs.form.validate(true)) {
        const data = this.$refs[this.formComponent].generateData()
        await postAddRegistry({ projectid: data.ProjectID }, data)
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
