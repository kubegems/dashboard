<template>
  <BaseDialog
    v-model="visible"
    :width="1000"
    title="创建采集器"
    icon="mdi-apps"
  >
    <template #content>
      <v-form
        ref="form"
        v-model="valid"
        lazy-validation
        @submit.prevent
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
              :rules="formData.name"
            />
          </v-col>
          <v-col cols="6">
            <v-autocomplete
              v-model="formData.metadata.namespace"
              color="primary"
              :items="namespaceItems"
              :rules="formRules.namespace"
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
import { postFlowData, postClusterFlowData } from '@/api'
import { deleteEmpty, deepCopy } from '@/utils/helpers'
import { required } from '@/utils/rules'

const DEFAULT_FORM_DATA = {
  apiVersion: 'logging.banzaicloud.io/v1beta1',
  kind: 'Flow',
  metadata: {
    name: undefined,
    namespace: undefined,
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
      type: [required],
      name: [required],
      namespace: [required],
    }

    return {
      visible: false,
      valid: false,
      formData: deepCopy(DEFAULT_FORM_DATA),
      submitLoading: false,
    }
  },
  computed: {
    ...mapState(['AdminViewport']),
    typeItems() {
      return [{ text: 'Flow', value: 'Flow' }].concat(
        this.AdminViewport
          ? [{ text: 'ClusterFlow', value: 'ClusterFlow' }]
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
        this.formData = Object.assign(
          deepCopy(DEFAULT_FORM_DATA),
          deepCopy(data || {}),
        )
      })
    },
    async onSubmit() {
      if (this.$refs.form.validate(true)) {
        this.submitLoading = true
        const action = this.formData.kind === 'Flow' ? postFlowData : postClusterFlowData
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
