<template>
  <v-data-table
    :headers="headers"
    :items="items"
    item-key="value"
    disable-sort
    hide-default-footer
    no-data-text="暂无数据"
  />
</template>

<script>
export default {
  name: 'MetricsList',
  props: {
    env: {
      type: Object,
      default: () => null,
    },
  },
  data() {
    return {
      headers: [
        { text: '名称', value: 'name', align: 'start' },
        { text: '规则', value: 'rules', align: 'start' },
        { text: '表达式', value: 'expr', align: 'start' },
        { text: '单位', value: 'units', align: 'start' },
        { text: '标签', value: 'labels', align: 'start' },
      ],
      items: [],
    }
  },
  watch: {
    env: {
      handler(newValue) {
        if (newValue) {
          this.metricsList()
        }
      },
      deep: true,
    },
  },
  methods: {
    async metricsList() {},
  },
}
</script>

