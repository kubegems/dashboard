<template>
  <div>
    <BaseSubTitle title="kafka配置" />
    <v-form
      ref="form"
      v-model="valid"
      lazy-validation
    >
      <v-row class="px-2 mt-0">
        <v-col cols="6">
          <v-text-field
            v-model="obj.spec.kafka.brokers"
            class="my-0"
            label="brokers"
            required
            :rules="objRules.brokersRules"
          />
        </v-col>
        <v-col cols="6">
          <v-text-field
            v-model="obj.spec.kafka.default_topic"
            class="my-0"
            label="default_topic"
            required
          />
        </v-col>
      </v-row>
    </v-form>
  </div>
</template>

<script>
import { required } from '@/utils/rules'

export default {
  name: 'Kafka',
  props: {
    item: {
      type: Object,
      default: null,
    },
  },
  data() {
    return {
      valid: false,
      obj: {
        spec: {
          kafka: {
            brokers: '',
            default_topic: '',
          },
        },
      },
      objRules: {
        brokersRules: [required],
      },
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.$refs.form.resetValidation()
      if (this.item?.spec?.kafka) {
        this.obj = this.$_.merge(this.item, this.obj)
      }
    })
  },
  methods: {
    // eslint-disable-next-line vue/no-unused-properties
    reset() {
      this.$refs.form.resetValidation()
      this.obj = this.$options.data().obj
    },
    // eslint-disable-next-line vue/no-unused-properties
    validate() {
      return this.$refs.form.validate(true)
    },
  },
}
</script>

