<template>
  <v-row>
    <v-col cols="6">
      <v-text-field
        v-model="obj.key_name"
        label="key_name"
        :rules="formRules.key_name"
      />
    </v-col>
    <v-col cols="6">
      <v-text-field
        v-model="obj.inject_key_prefix"
        label="inject_key_prefix"
      />
    </v-col>
    <v-col cols="6">
      <v-switch
        v-model="obj.reserve_data"
        label="reserve_data"
      />
    </v-col>
    <v-col cols="6">
      <v-switch
        v-model="obj.reserve_time"
        label="reserve_time"
      />
    </v-col>
    <v-col cols="6">
      <v-switch
        v-model="obj.remove_key_name_field"
        label="remove_key_name_field"
      />
    </v-col>

    <v-col cols="12">
      <Card title="parse">
        <v-row>
          <v-col cols="6">
            <v-text-field
              v-model="obj.parse.type"
              label="type"
            />
          </v-col>
          <v-col cols="6">
            <v-text-field
              v-model="obj.parse.expression"
              label="expression"
            />
          </v-col>
          <v-col cols="6">
            <v-text-field
              v-model="obj.parse.time_key"
              label="time_key"
            />
          </v-col>
          <v-col cols="6">
            <v-text-field
              v-model="obj.parse.time_format"
              label="time_format"
            />
          </v-col>
          <v-col cols="6">
            <v-switch
              v-model="obj.parse.keep_time_key"
              label="keep_time_key"
            />
          </v-col>
          <v-col cols="6">
            <v-switch
              v-model="obj.parse.local_time"
              label="local_time"
            />
          </v-col>
        </v-row>
      </Card>
    </v-col>
  </v-row>
</template>

<script>
import Card from '@/views/observe/log/operator/components/Card'
import { required } from '@/utils/rules'

export default {
  name: 'Parser',
  components: {
    Card,
  },
  props: {
    data: {
      type: Object,
      default: () => ({}),
    },
  },
  data() {
    this.formRules = {
      key_name: [required],
    }

    return {
      obj: {
        key_name: undefined,
        reserve_data: undefined,
        reserve_time: undefined,
        remove_key_name_field: undefined,
        inject_key_prefix: undefined,
        parse: {
          keep_time_key: undefined,
          local_time: undefined,
          type: undefined,
          expression: undefined,
          time_key: undefined,
          time_format: undefined,
        },
      },
    }
  },
  watch: {
    data: {
      handler(newValue) {
        this.obj = { ...this.obj, ...newValue }
      },
      immediate: true,
    },
  },
  methods: {
    // eslint-disable-next-line vue/no-unused-properties
    getValue() {
      return {
        parser: { ...this.obj },
      }
    },
  },
}
</script>
