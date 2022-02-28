<template>
  <BaseDialog
    v-model="dialog"
    :width="500"
    title="更新镜像仓库"
    icon="mdi-database"
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
        @click="updateRegistry"
      >
        确定
      </v-btn>
    </template>
  </BaseDialog>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
import { putUpdateRegistry, getRegistryDetail } from '@/api'
import RegistryBaseForm from './RegistryBaseForm'

export default {
  name: 'UpdateRegistry',
  components: {
    RegistryBaseForm,
  },
  data: () => ({
    dialog: false,
    formComponent: 'RegistryBaseForm',
  }),
  computed: {
    ...mapState(['Circular', 'User']),
    ...mapGetters(['Tenant']),
  },
  methods: {
    // eslint-disable-next-line vue/no-unused-properties
    open() {
      this.dialog = true
    },
    async updateRegistry() {
      if (this.$refs[this.formComponent].$refs.form.validate(true)) {
        const data = this.$refs[this.formComponent].generateData()
        await putUpdateRegistry(
          { projectid: data.ProjectID, registryid: data.RegistryID },
          data,
        )
        this.reset()
        this.$emit('refresh')
      }
    },
    splitRegistry(registry, type) {
      const regExp = new RegExp(/([http|https]+):\/\/([\w|\.|-|\/|\d]+)?/, 'g')
      const match = regExp.exec(registry)
      if (match) {
        if (type === 'scheme') {
          return match[1]
        } else if (type === 'address') {
          return match[2]
        }
        return ''
      }
      return ''
    },
    // eslint-disable-next-line vue/no-unused-properties
    async init(item) {
      const data = await getRegistryDetail({
        projectid: item.ProjectID,
        registryid: item.ID,
      })
      this.$refs[this.formComponent].scheme = this.splitRegistry(
        data.RegistryAddress,
        'scheme',
      )
      this.$refs[this.formComponent].setData({
        RegistryID: data.ID,
        RegistryName: data.RegistryName,
        RegistryAddress: this.splitRegistry(data.RegistryAddress, 'address'),
        Username: data.Username,
        UpdateTime: new Date(),
        CreatorID: data.CreatorID,
        TenantID: this.Tenant().ID,
        ProjectID: data.ProjectID,
        IsDefault: data.IsDefault,
      })
    },
    reset() {
      this.dialog = false
      this.$refs[this.formComponent].reset()
    },
  },
}
</script>
