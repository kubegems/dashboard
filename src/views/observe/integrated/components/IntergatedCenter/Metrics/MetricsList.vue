<template>
  <div class="metrics">
    <v-text-field
      v-model="search"
      class="px-2 mt-2"
      hide-details
      label="搜索"
      prepend-inner-icon="mdi-magnify"
      @keyup="onInput"
    />
    <v-data-table
      class="px-2"
      :headers="headers"
      :items="items"
      item-key="value"
      disable-sort
      :search.sync="search"
      hide-default-footer
      no-data-text="暂无数据"
      :custom-filter="customFilter"
      :page.sync="page"
      :items-per-page="itemsPerPage"
      no-results-text="暂无结果"
    />
    <BasePagination
      v-if="pageCount >= 1"
      v-model="page"
      :front-page="true"
      :page-count="pageCount"
      :size="itemsPerPage"
      :show-size="false"
      @changepage="onPageIndexChange"
    />
  </div>
</template>

<script>
import { mapState } from 'vuex'
import {
  getSystemConfigData,
  getMyConfigData,
} from '@/api'

export default {
  name: 'MetricsList',
  data() {
    return {
      headers: [
        { text: '名称', value: 'name', align: 'start' },
        { text: '规则', value: 'showName', align: 'start' },
        { text: '表达式', value: 'expr', align: 'start' },
        { text: '单位', value: 'units', align: 'start' },
      ],
      items: [],
      total: 0,
      page: 1,
      pageCount: 0,
      itemsPerPage: 5,
      search: '',
    }
  },
  computed: {
    ...mapState(['AdminViewport']),
  },
  watch: {
    total: {
      handler() {
        this.pageCount = Math.ceil(this.total / this.itemsPerPage)
      },
      deep: true,
    },
  },
  mounted() {
    this.$nextTick(() => {
      this.metricsList()
    })
  },
  methods: {
    customFilter(value, search, item) {
       if (
        item != null &&
        search != null &&
        item.expr &&
        item.expr.toLocaleLowerCase().indexOf(search.toLocaleLowerCase()) > -1
      ) {
        this.total += 1
        return true
      }
      return false
    },
    onInput() {
      this.total = 0
      this.page = 1
    },
    async metricsList() {
      let data = null
      if (this.AdminViewport) {
        data = await getSystemConfigData('Monitor')
      } else {
        data = await getMyConfigData('Monitor')
      }

      this.items = Object.values(data?.content?.resources).reduce((r1, r2) => {
        return Array.isArray(r1)
        ? r1.concat(
          Object.keys(r2.rules).map(k => { return {name: k, ...r2.rules[k]} }),
        )
        : Object.keys(r1.rules).map(k => { return {name: k, ...r1.rules[k]} }).concat(
          Object.keys(r2.rules).map(k => { return {name: k, ...r2.rules[k]} }),
        )
      }) || []

      this.pageCount = Math.ceil(this.items.length / this.itemsPerPage)
    },
    onPageIndexChange(page) {
      this.page = page
    },
  },
}
</script>

<style lang="scss" scoped>
.metrics {
  position: relative;
}
</style>
