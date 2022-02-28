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
        >
          <v-sheet>
            <v-flex
              class="float-left"
              style="width: 55%; padding-top: 18px; font-size: 16px;"
            >
              {{ image }}
            </v-flex>
            <v-flex
              class="float-left"
              style="width: 45%;"
            >
              <v-text-field
                v-model="obj.operatorImage"
                class="my-0"
                :rules="objRules.operatorImageRules"
                required
                label="镜像tag"
              />
            </v-flex>
            <div class="kubegems__clear-float" />
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
    image: '',
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
        this.installer.content.operator_image = `${this.image}:${this.obj.operatorImage}`
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
      const operatorImage = this.installer.content.operator_image.split(':')
      this.image = operatorImage[0]
      this.obj.operatorImage = operatorImage[1]
    },
    reset() {
      this.dialog = false
      this.$refs.form.reset()
    },
  },
}
</script>
