<template>
  <v-sheet>
    <Subtitle title="基本配置" />
    <v-row>
      <v-col cols="6">
        <v-text-field
          v-model="kafka.brokers"
          label="brokers"
          :rules="formRules.brokers"
        />
      </v-col>
      <v-col cols="6">
        <v-autocomplete
          v-model="kafka.format.type"
          :items="formatTypeSelect"
          attach
          label="format"
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
      <v-col cols="6">
        <v-text-field
          v-model="kafka.default_topic"
          label="default_topic"
        />
      </v-col>
      <v-col cols="6">
        <v-text-field
          v-model="kafka.topic_key"
          label="topic_key"
        />
      </v-col>
      <v-col cols="6">
        <v-text-field
          v-model="kafka.partition_key"
          label="partition_key"
        />
      </v-col>
    </v-row>

    <Subtitle title="高级配置" />
    <v-tabs
      v-model="tab"
      fixed-tabs
    >
      <v-tab
        v-for="item in tabs"
        :key="item"
      >
        {{ item }}
      </v-tab>
    </v-tabs>
    <v-tabs-items
      v-model="tab"
      class="mt-3 overflow-visible"
    >
      <v-tab-item transition="none">
        <KafkaAuth
          ref="kafkaAuth"
          :loki="kafka"
        />
      </v-tab-item>
      <v-tab-item transition="none">
        <KafkaBuffer
          :kafka="kafka"
        />
      </v-tab-item>
    </v-tabs-items>
  </v-sheet>
</template>

<script>
import Subtitle from '@/views/observe/log/operator/components/Subtitle'
import KafkaAuth from '@/views/observe/log/operator/output/components/LokiForm/Auth'
import KafkaBuffer from './Buffer'
import { required } from '@/utils/rules'
import { deepCopy } from '@/utils/helpers'

export default {
  name: 'ElasticsearchForm',
  components: {
    Subtitle,
    KafkaAuth,
    KafkaBuffer,
  },
  props: {
    data: {
      type: Object,
      required: true,
    },
  },
  data() {
    this.formRules = {
      brokers: [required],
      default_topic: [required],
    }

    this.formatTypeSelect = [{ text: 'json', value: 'json' }]

    this.tabs = ['Auth', 'Buffer']

    this.defaultValue = {
      brokers: undefined,
      default_topic: undefined,
      format: { type: 'json' },
      topic_key: undefined,
      partition_key: undefined,
    }

    return {
      tab: 0,
      kafka: { ...this.defaultValue },
    }
  },
  watch: {
    data: {
      handler(newValue) {
        this.kafka = deepCopy(newValue.spec?.kafka || { ...this.defaultValue })
      },
      immediate: true,
    },
  },
  methods: {
    // eslint-disable-next-line vue/no-unused-properties
    onUpdateData() {
      const data = deepCopy(this.data)
      data.spec = data.spec || {}
      data.spec.kafka = { ...this.kafka }
      if (this.$refs.kafkaBuffer) {
        data.spec.kafka.buffer = this.$refs.kafkaBuffer.getValue()
      }
      if (this.$refs.kafkaAuth) {
        Object.assign(data.spec.kafka, this.$refs.kafkaAuth.getValue())
      }
      this.$emit('update:data', data)
    },
  },
}
</script>

<style lang="scss" scoped>
.clear-v-window {
  overflow: visible;
}
</style>
