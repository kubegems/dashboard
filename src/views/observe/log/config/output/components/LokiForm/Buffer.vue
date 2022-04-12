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
        <v-col
          cols="4"
          class="py-0"
        >
          <v-select
            v-model="obj.type"
            :items="bufferTypeSelect"
            label="type"
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
        <v-col
          cols="4"
          class="py-0"
        >
          <v-select
            v-model="obj.flush_mode"
            :items="flushModeSelect"
            label="flush_mode"
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
        <v-col
          cols="4"
          class="py-0"
        >
          <v-text-field
            v-model="obj.flush_interval"
            label="flush_interval"
            :rules="formRules.flush_interval"
          />
        </v-col>
        <v-col
          cols="4"
          class="py-0"
        >
          <v-autocomplete
            v-model="obj.retry_type"
            :items="retryTypeSelect"
            label="retry_type"
          >
            <template #selection="{ item }">
              <v-chip
                color="primary"
                small
              >
                {{ item['text'] }}
              </v-chip>
            </template>
          </v-autocomplete>
        </v-col>
        <v-col
          cols="4"
          class="py-0"
        >
          <v-text-field
            v-model="obj.retry_wait"
            label="retry_wait"
            :rules="formRules.retry_wait"
          />
        </v-col>
        <v-col
          cols="4"
          class="py-0"
        >
          <v-text-field
            v-model="obj.retry_max_interval"
            label="retry_max_interval"
            :rules="formRules.interval"
          />
        </v-col>
        <v-col
          cols="4"
          class="py-0"
        >
          <v-text-field
            v-model="obj.total_limit_size"
            label="total_limit_size"
            :rules="formRules.total_limit_size"
          />
        </v-col>
      </v-row>
      <v-btn
        color="error"
        small
        class="ml-4 mt-3"
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
import { sizeGB, timeInterval } from '@/utils/rules'

export default {
  name: 'LokiBuffer',
  components: {
    Card,
  },
  props: {
    loki: {
      type: Object,
      required: true,
    },
  },
  data() {
    this.bufferTypeSelect = [
      { text: 'file', value: 'file' },
      { text: 'memory', value: 'memory' },
    ]
    this.flushModeSelect = [
      { text: 'interval', value: 'interval' },
      { text: 'lazy', value: 'lazy' },
      { text: 'immediate', value: 'immediate' },
    ]
    this.retryTypeSelect = [
      { text: 'exponential_backoff', value: 'exponential_backoff' },
      { text: 'periodic', value: 'periodic' },
    ]
    this.formRules = {
      flush_interval: [timeInterval],
      retry_wait: [timeInterval],
      interval: [timeInterval],
      total_limit_size: [sizeGB],
    }

    this.defaultValue = {
      type: undefined,
      retry_type: undefined,
      flush_mode: undefined,
      flush_interval: undefined,
      retry_wait: undefined,
      retry_max_interval: undefined,
      total_limit_size: undefined,
    }

    return {
      edit: false,
      obj: { ...this.defaultValue },
    }
  },
  watch: {
    loki: {
      handler() {
        this.obj = this.loki.buffer ? { ...this.loki.buffer } : {}
        this.edit = !!this.loki.buffer
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
      this.obj = { ...this.defaultValue }
    },
    // eslint-disable-next-line vue/no-unused-properties
    getValue() {
      return this.edit ? this.obj : undefined
    },
  },
}
</script>
