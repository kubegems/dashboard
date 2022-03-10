<template>
  <v-form
    ref="form"
    v-model="valid"
    lazy-validation
    class="my-2"
    @submit.prevent
  >
    <v-expand-transition>
      <v-card
        v-show="visible"
        class="my-2 pa-4 kubegems__expand-transition"
        :elevation="4"
      >
        <div class="d-flex pt-2 px-2">
          <div class="text-subtitle-2 pt-3 primary--text kubegems__min-width">标签定义</div>
          <v-row>
            <v-col
              cols="6"
              class="py-0"
            >
              <v-text-field
                v-model="formData.key"
                label="键"
                :rules="formRules.required"
              />
            </v-col>
            <v-col
              cols="6"
              class="py-0"
            >
              <v-text-field
                v-model="formData.value"
                label="值"
                :rules="formRules.required"
              />
            </v-col>
          </v-row>
        </div>

        <v-card-actions class="pa-0">
          <v-spacer />
          <v-btn
            text
            small
            color="error"
            @click="onReset"
          >
            取消
          </v-btn>
          <v-btn
            text
            small
            color="primary"
            @click="onSave"
          >
            保存
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-expand-transition>

    <!-- 遮罩 -->
    <div
      v-transfer-dom="'#observe-metrics-targets-form'"
      :class="visible ? 'kubegems__overlay' : ''"
    />
    <!-- 遮罩 -->
  </v-form>
</template>

<script>
import { deepCopy } from '@/utils/helpers'
import { required, timeInterval } from '@/utils/rules'

export default {
  name: 'TargetsLabelsForm',
  data () {
    this.formRules = {
      required: [required],
      interval: [timeInterval],
    }

    return {
      type: 'add',
      valid: false,
      visible: false,
      formData: {},
    }
  },
  methods: {
    // eslint-disable-next-line vue/no-unused-properties
    show (type = 'add', item) {
      this.visible = true
      this.type = type
      if (type === 'edit') this.onEdit(item)
    },
    onReset () {
      this.visible = false
      this.formData = {}
      this.$refs.form.resetValidation()
    },
    onEdit (item) {
      this.formData = deepCopy(item || {})
    },
    onSave () {
      if (this.$refs.form.validate(true)) {
        this.$emit('saveForm', {
          type: this.type,
          data: deepCopy(this.formData),
        })
        this.onReset()
      }
    },
  },
}
</script>
