<template>
  <v-flex>
    <BaseSubTitle
      v-if="pathLevel === 1"
      :title="label"
      :color="pathLevel === 1 ? 'grey lighten-3' : ''"
      class="mb-4"
      :divider="false"
    />
    <v-autocomplete
      :id="id"
      :items="items"
      hide-selected
      :label="pathLevel === 1 ? '' : label"
      class="my-2"
      :value="param.value"
      :rules="titleRule"
      :menu-props="{
        bottom: true,
        left: true,
        origin: `top center`,
      }"
      @change="onChange($event)"
      @focus="onStorageClassSelectFocus"
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
  </v-flex>
</template>

<script>
import BaseSelect from '@/mixins/select'
import BaseResource from '@/mixins/resource'
import { required } from '@/utils/rules'

export default {
  name: 'SingleSelectParam',
  mixins: [BaseSelect, BaseResource],
  props: {
    label: {
      type: String,
      default: () => '',
    },
    param: {
      type: Object,
      default: () => {},
    },
    id: {
      type: String,
      default: () => '',
    },
    clusterName: {
      type: String,
      default: () => '',
    },
  },
  data: () => ({
    items: [],
    titleRule: [required],
  }),
  computed: {
    pathLevel() {
      return this.param.path.split('/').length
    },
  },
  watch: {
    // 如果选择了环境,得到集群名后,自动加载存储类选择列表
    clusterName() {
      if (
        (this.param.name === 'storageClassName' ||
          this.param.name === 'storageClass') &&
        this.clusterName !== ''
      ) {
        this.m_select_storageClassSelectData(this.clusterName, { noprocessing: true })
        this.items = this.m_select_storageClassItems
      }
    },
  },
  mounted() {
    if (this.param.enum && this.param.enum.length > 0) {
      this.items = this.param.enum.map((enumValue) => {
        return { text: enumValue, values: enumValue }
      })
    }
    this.onStorageClassSelectFocus()
  },
  methods: {
    onChange(event) {
      this.$emit('changeBasicFormParam', this.param, event)
    },
    async onStorageClassSelectFocus() {
      if (
        (this.param.name === 'storageClassName' ||
          this.param.name === 'storageClass') &&
        this.clusterName !== ''
      ) {
        await this.m_select_storageClassSelectData(this.clusterName, { noprocessing: true })
        this.items = this.m_select_storageClassItems
      }
    },
  },
}
</script>
