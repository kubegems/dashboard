<template>
  <v-form
    ref="form"
    v-model="valid"
    lazy-validation
  >
    <v-row class="px-2">
      <v-col cols="6">
        <v-autocomplete
          v-model="obj.kind"
          :items="typeItems"
          color="primary"
          label="类型"
          hide-selected
          class="my-0"
          no-data-text="暂无可选数据"
          :readonly="edit"
          :rules="objRules.kindRules"
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
          v-model="obj.metadata.name"
          class="my-0"
          label="名称"
          required
          :readonly="edit"
          :rules="objRules.nameRules"
        />
      </v-col>
    </v-row>
  </v-form>
</template>

<script>
import { mapState } from 'vuex'
import { deepCopy } from '@/utils/helpers'
import { required } from '@/utils/rules'

export default {
  name: 'FlowBaseForm',
  props: {
    item: {
      type: Object,
      default: () => null,
    },
    edit: {
      type: Boolean,
      default: () => false,
    },
  },
  data() {
    return {
      valid: false,
      obj: {
        apiVersion: 'logging.banzaicloud.io/v1beta1',
        kind: 'Flow',
        metadata: {
          name: undefined,
        },
        spec: {},
      },
      objRules: {
        kindRules: [required],
        nameRules: [required],
      },
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
  watch: {
    item: {
      handler() {
        this.loadData()
      },
      deep: true,
      immediate: true,
    },
  },
  methods: {
    loadData() {
      this.$nextTick(() => {
        if (!this.item) {
          this.$refs.form.resetValidation()
        } else {
          this.obj = deepCopy(this.item)
        }
      })
    },
    // eslint-disable-next-line vue/no-unused-properties
    reset() {
      this.$refs.form && this.$refs.form.resetValidation()
      this.obj = this.$options.data().obj
    },
    // eslint-disable-next-line vue/no-unused-properties
    checkSaved() {
      return true
    },
    // eslint-disable-next-line vue/no-unused-properties
    setData(data) {
      this.obj = data
    },
  },
}
</script>
