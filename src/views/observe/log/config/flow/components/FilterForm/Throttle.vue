<template>
  <v-row>
    <v-col cols="6">
      <v-text-field
        v-model="obj.group_key"
        label="group_key"
      />
    </v-col>
    <v-col cols="6">
      <v-text-field
        v-model="obj.group_bucket_limit"
        label="group_bucket_limit"
        type="number"
        :rules="formRules.group_bucket_limit"
      />
    </v-col>
    <v-col cols="6">
      <v-text-field
        v-model="obj.group_bucket_period_s"
        label="group_bucket_period_s"
        type="number"
        :rules="formRules.group_bucket_period_s"
      />
    </v-col>
  </v-row>
</template>

<script>
import { positiveInteger } from '@/utils/rules'

export default {
  name: 'Throttle',
  props: {
    data: {
      type: Object,
      default: () => ({}),
    },
  },
  data () {
    this.formRules = {
      group_bucket_limit: [positiveInteger],
      group_bucket_period_s: [positiveInteger],
    }

    return {
      obj: {
        group_bucket_limit: 3000,
        group_bucket_period_s: 10,
        group_key: undefined,
      },
    }
  },
  watch: {
    data: {
      handler (newValue) {
        this.obj = { ...this.obj, ...newValue }
      },
      immediate: true,
    },
  },
  methods: {
    // eslint-disable-next-line vue/no-unused-properties
    getValue () {
      return {
        throttle: { ...this.obj },
      }
    },
  },
}
</script>
