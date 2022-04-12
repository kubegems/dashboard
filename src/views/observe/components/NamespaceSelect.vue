<template>
  <div class="d-inline-flex align-center">
    <span class="mr-3 text-subtitle-2">命名空间</span>
    <v-autocomplete
      v-model="namespace"
      :items="items"
      label="命名空间"
      color="primary"
      prepend-inner-icon="mdi-cube"
      no-data-text="暂无可选数据"
      dense
      solo
      flat
      attach
      hide-details
      hide-selected
      style="width: 360px;"
      @change="onSelectChange"
    >
      <template #selection="{ item }">
        <v-chip
          color="primary"
          small
          label
        >
          {{ item['text'] }}
        </v-chip>
      </template>
    </v-autocomplete>
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
import getNamespaceItems from '@/views/observe/utils/namespace'

export default {
  name: 'NamespaceSelect',
  props: {
    value: {
      type: String,
      default: undefined,
    },
    cluster: {
      type: String,
      default: '',
    },
    autoSelectFirst: {
      type: Boolean,
      default: false,
    },
    emptyValue: {
      type: String,
      default: '_all',
    },
  },
  data() {
    return {
      namespace: this.value,
      items: [],
    }
  },
  computed: {
    ...mapState(['AdminViewport']),
    ...mapGetters(['Tenant']),
  },
  watch: {
    value(newValue) {
      this.namespace = newValue
    },
    cluster: {
      handler(value) {
        if (!value) return
        this.getNamespaceItems()
      },
      immediate: true,
    },
  },
  methods: {
    async getNamespaceItems() {
      this.items = await getNamespaceItems(this.AdminViewport, this.cluster, this.Tenant().ID)
      if (this.autoSelectFirst && this.items.length && !this.value) {
        this.onSelectChange(this.items[0].value)
      }
      this.$emit('updateItems', [...this.items])
    },
    onSelectChange(value) {
      value = value || this.emptyValue
      this.$router.replace({
        query: {
          ...this.$route.query,
          namespace: value,
        },
      })
      this.$emit('input', value)
      this.$emit('change', value)
    },
  },
}
</script>
