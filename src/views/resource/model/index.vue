<template>
  <v-container fluid>
    <BaseViewportHeader />
    <BaseBreadcrumb />
    <v-card>
      <v-card-title class="py-4">
        <BaseFilter
          :filters="filters"
          :default="{ items: [], text: '模型名称', value: 'search' }"
          @refresh="m_filter_list"
        />
        <NamespaceFilter />
      </v-card-title>
      <v-data-table
        :headers="headers"
        :items="items"
        :page.sync="params.page"
        :items-per-page="params.size"
        no-data-text="暂无数据"
        hide-default-footer
        @update:sort-by="m_table_sortBy"
        @update:sort-desc="m_table_sortDesc"
      />
      <BasePagination
        v-if="pageCount >= 1"
        v-model="params.page"
        :page-count="pageCount"
        :size="params.size"
        @loaddata="serviceList"
        @changesize="onPageSizeChange"
        @changepage="onPageIndexChange"
      />
    </v-card>
  </v-container>
</template>

<script>
import { mapState } from 'vuex'
import NamespaceFilter from '@/views/resource/components/common/NamespaceFilter'
import BaseFilter from '@/mixins/base_filter'
import BaseResource from '@/mixins/resource'
import BasePermission from '@/mixins/permission'
import BaseTable from '@/mixins/table'

export default {
  name: 'Model',
  components: {
    NamespaceFilter,
  },
  mixins: [BaseFilter, BaseResource, BasePermission, BaseTable],
  data: () => ({
    items: [],
    pageCount: 0,
    params: {
      page: 1,
      size: 10,
    },
    filters: [{ text: '模型名称', value: 'search', items: [] }],
  }),
  computed: {
    ...mapState(['JWT', 'AdminViewport']),
    headers() {
      const items = [
        { text: '模型名', value: 'name', align: 'start' },
        {
          text: '模型版本',
          value: '',
          align: 'start',
          sortable: false,
        },
        {
          text: '关联应用',
          value: '',
          align: 'start',
          sortable: false,
        },
        {
          text: '挂载路径',
          value: '',
          align: 'start',
          sortable: false,
        },
        { text: '创建时间', value: 'createAt', align: 'center' },
      ]
      return items
    },
  },
  watch: {
    '$store.state.NamespaceFilter': {
      handler: function (namespace) {
        if (namespace && !namespace.Mounted) {
          this.params.page = 1
          this.params.namespace = namespace.Namespace
          this.serviceList()
        }
      },
      deep: true,
    },
    m_table_sortparam: {
      handler: function (newV, oldV) {
        if (oldV.name !== newV.name) return
        if (oldV.desc === null) return
        this.modelRuntimeList(true)
      },
      deep: true,
    },
  },
  mounted() {
    if (this.JWT) {
      this.$nextTick(() => {
        this.m_table_generateParams()
        this.modelRuntimeList()
      })
    }
  },
  methods: {
    async modelRuntimeList() {},
    onPageSizeChange(size) {
      this.params.page = 1
      this.params.size = size
    },
    onPageIndexChange(page) {
      this.params.page = page
    },
  },
}
</script>
