<template>
  <v-row>
    <v-col cols="6">
      <v-select
        v-model="obj.languages"
        :items="languagesItems"
        label="languages"
        multiple
        no-data-text="暂无可选数据"
        :rules="formRules.languages"
      >
        <template #selection="{ item }">
          <v-chip
            color="primary"
            small
          >
            {{ item }}
          </v-chip>
        </template>
      </v-select>
    </v-col>
    <v-col cols="6">
      <v-text-field
        v-model="obj.message"
        label="message"
      />
    </v-col>
    <v-col cols="6">
      <v-text-field
        v-model="obj.remove_tag_prefix"
        label="remove_tag_prefix"
      />
    </v-col>
    <v-col cols="6">
      <v-text-field
        v-model="obj.multiline_flush_interval"
        label="multiline_flush_interval"
        :rules="formRules.multiline_flush_interval"
      />
    </v-col>
    <v-col cols="6">
      <v-text-field
        v-model="obj.max_lines"
        type="number"
        label="max_lines"
        :rules="formRules.max_lines"
      />
    </v-col>
    <v-col cols="6">
      <v-text-field
        v-model="obj.max_bytes"
        type="number"
        label="max_bytes"
        :rules="formRules.max_bytes"
      />
    </v-col>
    <v-col cols="6">
      <v-text-field
        v-model="obj.steam"
        label="steam"
      />
    </v-col>
  </v-row>
</template>

<script>
import { required, positiveInteger, timeInterval } from '@/utils/rules'

export default {
  name: 'DetectExceptions',
  props: {
    data: {
      type: Object,
      default: () => ({}),
    },
  },
  data () {
    this.formRules = {
      languages: [required],
      max_lines: [positiveInteger],
      multiline_flush_interval: [timeInterval],
      max_bytes: [positiveInteger],
    }

    this.languagesItems = ['java', 'python', 'golang']

    return {
      obj: {
        languages: [],
        multiline_flush_interval: undefined,
        message: undefined,
        remove_tag_prefix: undefined,
        max_lines: undefined,
        max_bytes: undefined,
        stream: undefined,
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
        detectExceptions: { ...this.obj },
      }
    },
  },
}
</script>
