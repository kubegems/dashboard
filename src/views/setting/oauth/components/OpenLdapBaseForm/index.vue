<template>
  <BaseDialog
    v-model="dialog"
    :width="1000"
    title="配置OpenLdap"
    icon="mdi-star"
    @reset="reset"
  >
    <template #content>
      <component
        :is="formComponent"
        :ref="formComponent"
        :item="item"
        :edit="true"
        title="OpenLdap"
      />
    </template>
    <template #action>
      <v-btn
        class="float-right"
        color="primary"
        text
        :loading="Circular"
        @click="settingOpenLdap"
      >
        确定
      </v-btn>
    </template>
  </BaseDialog>
</template>

<script>
import { mapState } from 'vuex'
import BaseForm from './BaseForm'
import BaseResource from '@/mixins/resource'
import { deepCopy } from '@/utils/helpers'

export default {
  name: 'OAuthSetting',
  components: {
    BaseForm,
  },
  mixins: [BaseResource],
  data: () => ({
    dialog: false,
    yaml: null,
    item: null,
    formComponent: 'BaseForm',
  }),
  computed: {
    ...mapState(['Circular']),
  },
  methods: {
    // eslint-disable-next-line vue/no-unused-properties
    open() {
      this.dialog = true
    },
    async settingOpenLdap() {
      if (this.$refs[this.formComponent].$refs.form.validate(true)) {
        let data = ''
        if (this.formComponent === 'BaseForm') {
          data = this.$refs[this.formComponent].obj
          this.beautifyData(data)
        }
        this.reset()
        this.$emit('refresh')
      }
    },
    // eslint-disable-next-line vue/no-unused-properties
    async init() {
      this.item = null
      const data = {}
      this.item = deepCopy(data)
      this.$refs[this.formComponent].setData(deepCopy(data))
    },
    reset() {
      this.dialog = false
      this.$refs[this.formComponent].reset()
      this.formComponent = 'BaseForm'
      this.yaml = false
    },
  },
}
</script>
