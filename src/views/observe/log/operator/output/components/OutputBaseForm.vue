<template>
  <BaseDialog
    v-model="visible"
    :width="1000"
    title="创建路由器"
    icon="mdi-apps"
  >
    <template #content>
      <v-form
        ref="form"
        v-model="valid"
        lazy-validation
      >
        <v-row class="px-2">
          <v-col cols="6">
            <v-autocomplete
              v-model="formData.kind"
              :items="typeItems"
              color="primary"
              label="类型"
              hide-selected
              class="my-0"
              no-data-text="暂无可选数据"
              :rules="formRules.type"
            >
              <template #selection="{ item }">
                <v-chip
                  color="primary"
                  small
                  class="mx-1"
                >
                  {{ item['text'] }}
                </v-chip>
              </template>
            </v-autocomplete>
          </v-col>
          <v-col cols="6">
            <v-text-field
              v-model="formData.metadata.name"
              class="my-0"
              label="名称"
              required
              :rules="formData.required"
            />
          </v-col>
          <v-col cols="6">
            <v-autocomplete
              v-model="formData.metadata.namespace"
              color="primary"
              :items="namespaceItems"
              :rules="formRules.required"
              label="命名空间"
              hide-selected
              class="my-0"
              no-data-text="暂无可选数据"
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
            <v-select
              v-model="plugin"
              color="primary"
              :items="pluginItems"
              :rules="formRules.required"
              label="插件类型"
              hide-selected
              class="my-0"
              no-data-text="暂无可选数据"
              @change="onPluginChange"
            >
              <template #selection="{ item }">
                <v-chip
                  color="primary"
                  small
                  class="mx-1"
                >
                  {{ item['text'] }}
                </v-chip>
              </template>
            </v-select>
          </v-col>
        </v-row>
      </v-form>
    </template>

    <template #action>
      <v-btn
        class="float-right"
        color="primary"
        text
        :loading="submitLoading"
        @click="onSubmit"
      >
        确定
      </v-btn>
    </template>
  </BaseDialog>
</template>

<script>
import { mapState } from 'vuex'
import { addOutput, addClusterOutput } from '@/api'
import { deleteEmpty, deepCopy } from '@/utils/helpers'
import { required } from '@/utils/rules'

const DEFAULT_FORM_DATA = {
  apiVersion: 'logging.banzaicloud.io/v1beta1',
  kind: 'Output',
  metadata: {
    name: '',
    namespace: null,
    labels: {},
  },
  spec: {},
}

export default {
  name: 'FlowBaseForm',
  props: {
    cluster: {
      type: String,
      default: '',
    },
    namespaceItems: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    this.formRules = {
      required: [required],
    }

    this.pluginItems = [
      { text: 'Loki', value: 'loki' },
      { text: 'Kafka', value: 'kafka' },
      { text: 'Elasticsearch', value: 'elasticsearch' },
    ]

    return {
      visible: false,
      valid: false,
      formData: deepCopy(DEFAULT_FORM_DATA),
      plugin: undefined,
      submitLoading: false,
    }
  },
  computed: {
    ...mapState(['AdminViewport']),
    typeItems() {
      return [{ text: 'Output', value: 'Output' }].concat(
        this.AdminViewport
          ? [{ text: 'ClusterOutput', value: 'ClusterOutput' }]
          : [],
      )
    },
  },
  methods: {
    // eslint-disable-next-line vue/no-unused-properties
    create() {
      this.visible = true
      this.reset()
    },
    reset(data) {
      this.$refs.form && this.$refs.form.reset()
      this.$nextTick(() => {
        this.formData = Object.assign(deepCopy(DEFAULT_FORM_DATA), deepCopy(data || {}))
      })
    },
    onPluginChange(value) {
      this.pluginItems.forEach((plugin) => {
        delete this.formData.spec[plugin.value]
      })
      this.formData.spec[value] = {}
      if (value === 'kafka') {
        this.formData.spec[value].brokers = ''
        this.formData.spec[value].format = { type: 'json' }
      }
    },
    async onSubmit() {
      if (this.$refs.form.validate(true)) {
        this.submitLoading = true
        const action =
          this.formData.kind === 'Output' ? addOutput : addClusterOutput
        const { namespace, name } = this.formData.metadata
        await action(this.cluster, namespace, name, deleteEmpty(this.formData))
        this.submitLoading = false
        this.visible = false
        this.$emit('finishSubmit')
      }
    },
  },
}
</script>
