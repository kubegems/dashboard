<template>
  <Card
    :no-title="!edit"
    title="Buffer"
  >
    <v-btn
      v-if="!edit"
      text
      color="primary"
      block
      @click="onEdit"
    >
      <v-icon
        left
        small
      >
        mdi-plus
      </v-icon>
      配置Buffer
    </v-btn>

    <div
      v-else
      class="d-flex"
    >
      <v-row>
        <v-col cols="4">
          <v-text-field
            v-model="obj.timekey"
            label="timekey"
          />
        </v-col>
        <v-col cols="4">
          <v-select
            v-model="obj.timekey_use_utc"
            :items="booleanSelects"
            label="timekey_use_utc"
          >
            <template #selection="{ item }">
              <v-chip
                color="primary"
                small
              >
                {{ item['text'] }}
              </v-chip>
            </template>
          </v-select>
        </v-col>
        <v-col cols="4">
          <v-text-field
            v-model="obj.timekey_wait"
            label="timekey_wait"
            :rules="formRules.timekey_wait"
          />
        </v-col>
        <v-col cols="4">
          <v-text-field
            v-model="obj.tags"
            label="tags"
          />
        </v-col>
      </v-row>

      <v-btn
        color="error"
        small
        class="ml-4 mt-6"
        text
        @click="onRemove"
      >
        <v-icon>mdi-delete</v-icon>
      </v-btn>
    </div>
  </Card>
</template>

<script>
import Card from '@/views/observe/log/operator/components/Card'
import { timeInterval } from '@/utils/rules'

export default {
  name: 'LokiTenant',
  components: {
    Card,
  },
  props: {
    kafka: {
      type: Object,
      required: true,
    },
  },
  data() {
    this.formRules = {
      timekey_wait: [timeInterval],
    }

    this.booleanSelects = [
      { text: '启用', value: true },
      { text: '禁用', value: false },
    ]

    return {
      edit: false,
      obj: {
        tags: undefined,
        timekey: undefined,
        timekey_use_utc: undefined,
        timekey_wait: undefined,
      },
    }
  },
  watch: {
    kafka: {
      handler() {
        this.obj = this.kafka.buffer ? { ...this.kafka.buffer } : {}
        this.edit = !!this.kafka.buffer
      },
      immediate: true,
    },
  },
  methods: {
    onEdit() {
      this.edit = true
    },
    onRemove() {
      this.edit = false
      this.obj = {}
    },
    // eslint-disable-next-line vue/no-unused-properties
    getValue() {
      return this.edit ? this.obj : undefined
    },
  },
}
</script>
