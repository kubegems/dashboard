<template>
  <BaseDialog
    v-model="dialog"
    :width="500"
    title="修改Installer镜像"
    icon="mdi-file-document"
    @reset="reset"
  >
    <template #content>
      <BaseSubTitle title="镜像定义" />
      <v-card-text class="pa-2 mt-2">
        <v-form
          ref="form"
          v-model="valid"
          lazy-validation
          @submit.prevent
        >
          <v-sheet>
            <v-text-field
              v-model="obj.operatorImage"
              class="my-0"
              :rules="objRules.operatorImageRules"
              required
              label="镜像"
            />
          </v-sheet>
        </v-form>
      </v-card-text>
    </template>
    <template #action>
      <v-btn
        class="float-right"
        color="primary"
        text
        :loading="Circular"
        @click="updateSystemConfig"
      >
        确定
      </v-btn>
    </template>
  </BaseDialog>
</template>

<script>
import { mapState } from 'vuex'
import {
  getSystemConfigData,
  putSystemConfigData,
} from '@/api'
import { deepCopy } from '@/utils/helpers'
import { required } from '@/utils/rules'

export default {
  name: 'SetInstallImage',
  data: () => ({
    dialog: false,
    valid: false,
    installer: null,
    obj: {
      operatorImage: '',
    },
  }),
  computed: {
    ...mapState(['Circular']),
    objRules() {
      return {
        operatorImageRules: [
          required,
        ],
      }
    },
  },
  methods: {
    // eslint-disable-next-line vue/no-unused-properties
    open() {
      this.dialog = true
    },
    async updateSystemConfig() {
      if (this.$refs.form.validate(true)) {
        await putSystemConfigData(this.installer.name, this.installer)
        this.reset()
        this.$emit('refresh')
      }
    },
    // eslint-disable-next-line vue/no-unused-properties
    async init(item) {
      const data = await getSystemConfigData(
        item.name,
      )
      this.installer = deepCopy(data)
      this.obj.operatorImage = this.installer.content.operator_image
    },
    reset() {
      this.dialog = false
      this.$refs.form.reset()
    },
  },
}
</script>
