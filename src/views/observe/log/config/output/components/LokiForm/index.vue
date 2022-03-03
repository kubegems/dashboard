<template>
  <v-sheet>
    <Subtitle title="基本配置" />
    <v-row>
      <v-col cols="12">
        <v-text-field
          v-model="loki.url"
          label="URL"
          :rules="formRules.url"
        />
      </v-col>
      <v-col cols="4">
        <v-switch
          v-model="loki.drop_single_key"
          label="drop_single_key"
          class="ml-1"
          hide-details
        />
      </v-col>
      <v-col cols="4">
        <v-switch
          v-model="loki.configure_kubernetes_labels"
          label="configure_kubernetes_labels"
          hide-details
        />
      </v-col>
      <v-col cols="4">
        <v-switch
          v-model="loki.extract_kubernetes_labels"
          label="extract_kubernetes_labels"
          hide-details
        />
      </v-col>

      <v-col cols="6">
        <LokiLabels
          ref="lokiLabels"
          type="block"
          :labels="loki.labels"
        />
      </v-col>
      <v-col cols="6">
        <LokiLabels
          ref="lokiExtraLabels"
          type="block"
          title="extra_labels"
          :labels="loki.extra_labels"
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
        <LokiRemoveKeys
          ref="lokiRemoveKeys"
          title="remove_keys"
          label="remove_key"
          cols="4"
          type="block"
          :tags="loki.remove_keys"
        />
      </v-tab-item>
      <v-tab-item transition="none">
        <LokiAuth
          ref="lokiAuth"
          :loki="loki"
          :namespace="data.metadata.namespace"
          :cluster="$route.query.cluster"
        />
      </v-tab-item>
      <v-tab-item transition="none">
        <LokiTenant
          ref="lokiTenant"
          :loki="loki"
        />
      </v-tab-item>
      <v-tab-item transition="none">
        <LokiBuffer :loki="loki" />
      </v-tab-item>
    </v-tabs-items>
  </v-sheet>
</template>

<script>
import Subtitle from '@/views/observe/log/operator/components/Subtitle'
import LokiLabels from '@/views/observe/log/operator/components/LabelsInput'
import LokiRemoveKeys from '@/views/observe/log/operator/components/TagsInput'
import LokiTenant from './Tenant'
import LokiAuth from './Auth'
import LokiBuffer from './Buffer'
import { required } from '@/utils/rules'
import { deepCopy } from '@/utils/helpers'

export default {
  name: 'LokiForm',
  components: {
    Subtitle,
    LokiLabels,
    LokiRemoveKeys,
    LokiTenant,
    LokiAuth,
    LokiBuffer,
  },
  props: {
    data: {
      type: Object,
      required: true,
    },
  },
  data() {
    this.formRules = {
      url: [required],
    }

    this.tabs = ['Remove_keys', 'Auth', 'Tenant', 'Buffer']

    this.booleanSelects = [
      { text: '启用', value: true },
      { text: '禁用', value: false },
    ]

    return {
      tab: 0,
      loki: {},
    }
  },
  watch: {
    data: {
      handler(newValue) {
        this.loki = deepCopy(newValue.spec?.loki || {})
      },
      immediate: true,
    },
  },
  methods: {
    // eslint-disable-next-line vue/no-unused-properties
    onUpdateData() {
      const data = deepCopy(this.data)
      data.spec = data.spec || {}
      data.spec.loki = { ...this.loki }
      if (this.$refs.lokiLabels) {
        data.spec.loki.labels = this.$refs.lokiLabels.getValue()
      }
      if (this.$refs.lokiExtraLabels) {
        data.spec.loki.extra_labels = this.$refs.lokiExtraLabels.getValue()
      }
      if (this.$refs.lokiRemoveKeys) {
        data.spec.loki.remove_keys = this.$refs.lokiRemoveKeys.getValue()
      }
      if (this.$refs.lokiTenant) {
        data.spec.loki.tenant = this.$refs.lokiTenant.getValue()
      }
      if (this.$refs.lokiAuth) {
        Object.assign(data.spec.loki, this.$refs.lokiAuth.getValue())
      }
      this.$emit('update:data', data)
    },
  },
}
</script>
