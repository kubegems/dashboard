<template>
  <v-form
    ref="form"
    v-model="valid"
    lazy-validation
  >
    <BaseSubTitle title="大盘定义" />
    <v-card-text class="pa-2">
      <v-row>
        <v-col cols="6">
          <v-text-field
            v-model="obj.name"
            class="my-0"
            :rules="objRules.nameRule"
            required
            label="名称"
            :readonly="edit"
          />
        </v-col>
      </v-row>
    </v-card-text>
  </v-form>
</template>

<script>
import { required } from '@/utils/rules'
import { deepCopy } from '@/utils/helpers'

export default {
  name: 'DashboardBaseForm',
  props: {
    edit: {
      type: Boolean,
      default: () => false,
    },
    item: {
      type: Object,
      default: () => null,
    },
  },
  data() {
    return {
      valid: false,
      obj: {
        name: '',
      },
      objRules: {
        nameRule: [required],
      },
    }
  },
  watch: {
    item: {
      handler(newValue) {
        if (newValue) {
          this.obj = deepCopy(newValue)
        }
      },
      deep: true,
    },
  },
  methods: {
    // eslint-disable-next-line vue/no-unused-properties
    validate() {
      return this.$refs.form.validate(true)
    },
    // eslint-disable-next-line vue/no-unused-properties
    getData() {
      return this.obj
    },
    // eslint-disable-next-line vue/no-unused-properties
    reset() {
      this.$refs.form.resetValidation()
      this.obj = this.$options.data().obj
    },
  },
}
</script>

