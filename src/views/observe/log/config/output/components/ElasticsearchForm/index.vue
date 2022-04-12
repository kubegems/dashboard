<template>
  <v-sheet>
    <Subtitle title="基本配置" />
    <v-row>
      <v-col cols="6">
        <v-text-field
          v-model="elasticsearch.host"
          label="host"
          :rules="formRules.host"
        />
      </v-col>
      <v-col cols="6">
        <v-text-field
          v-model="elasticsearch.port"
          label="port"
          :rules="formRules.port"
        />
      </v-col>
      <v-col cols="6">
        <v-text-field
          v-model="elasticsearch.index_name"
          label="index_name"
        />
      </v-col>
      <v-col cols="6">
        <v-text-field
          v-model="elasticsearch.logstash_prefix"
          label="logstash_prefix"
        />
      </v-col>
      <v-col cols="6">
        <v-switch
          v-model="elasticsearch.logstash_format"
          label="logstash_format"
        />
      </v-col>
      <v-col cols="6">
        <v-text-field
          v-model="elasticsearch.time_key"
          label="time_key"
        />
      </v-col>
      <v-col cols="6">
        <v-text-field
          v-model="elasticsearch.template_name"
          label="template_name"
        />
      </v-col>
      <v-col cols="6">
        <v-text-field
          v-model="elasticsearch.scheme"
          label="scheme"
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
    <v-tabs-items v-model="tab">
      <v-tab-item transition="none">
        <ElasticsearchAuth
          ref="lokiAuth"
          :elasticsearch="elasticsearch"
        />
      </v-tab-item>
      <v-tab-item transition="none">
        <ElasticsearchBuffer
          ref="elasticsearchBuffer"
          :elasticsearch="elasticsearch"
        />
      </v-tab-item>
    </v-tabs-items>
  </v-sheet>
</template>

<script>
import Subtitle from '@/views/observe/log/operator/components/Subtitle'
import ElasticsearchAuth from './Auth'
import ElasticsearchBuffer from './Buffer'
import { required, port } from '@/utils/rules'
import { deepCopy } from '@/utils/helpers'

export default {
  name: 'ElasticsearchForm',
  components: {
    Subtitle,
    ElasticsearchAuth,
    ElasticsearchBuffer,
  },
  props: {
    data: {
      type: Object,
      required: true,
    },
  },
  data() {
    this.formRules = {
      host: [required],
      port: [port],
    }
    this.tabs = ['Auth', 'Buffer']

    return {
      tab: 0,
      elasticsearch: {},
    }
  },
  watch: {
    data: {
      handler(newValue) {
        this.elasticsearch = deepCopy(newValue.spec?.elasticsearch || {})
      },
      immediate: true,
    },
  },
  methods: {
    // eslint-disable-next-line vue/no-unused-properties
    onUpdateData() {
      const data = deepCopy(this.data)
      data.spec = data.spec || {}
      data.spec.elasticsearch = { ...this.elasticsearch }
      if (this.$refs.elasticsearchBuffer) {
        data.spec.elasticsearch.buffer =
          this.$refs.elasticsearchBuffer.getValue()
      }
      if (this.$refs.lokiAuth) {
        Object.assign(data.spec.elasticsearch, this.$refs.lokiAuth.getValue())
      }
      this.$emit('update:data', data)
    },
  },
}
</script>
