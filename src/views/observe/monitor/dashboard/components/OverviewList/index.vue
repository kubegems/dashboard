<template>
  <v-card class="pa-4">
    <div class="d-flex justify-space-between align-center">
      <ProjectSelect
        v-model="project"
        :tenant="tenant"
      />
      <v-spacer />

      <v-menu
        v-if="m_permisson_resourceAllow"
        left
      >
        <template #activator="{ on }">
          <v-btn icon>
            <v-icon
              small
              color="primary"
              v-on="on"
            >
              fas fa-ellipsis-v
            </v-icon>
          </v-btn>
        </template>
        <v-card>
          <v-card-text class="pa-2">
            <v-flex>
              <v-btn
                color="primary"
                text
              >
                <v-icon left>mdi-plus-box</v-icon>
                创建监控大盘
              </v-btn>
            </v-flex>
          </v-card-text>
        </v-card>
      </v-menu>
    </div>

    <v-data-table
      :headers="headers"
      :items="items"
      item-key="value"
      disable-sort
      hide-default-footer
      no-data-text="暂无数据"
      no-results-text="暂无匹配租户"
      class="px-2 mt-4"
      :page.sync="params.page"
      :items-per-page="params.size"
    />

    <BasePagination
      v-if="pageCount >= 1"
      v-model="params.page"
      :front-page="true"
      :page-count="pageCount"
      :size="params.size"
      @changesize="onPageSizeChange"
      @changepage="onPageIndexChange"
    />
  </v-card>
</template>

<script>
import ProjectSelect from './ProjectSelect'
import BaseSelect from '@/mixins/select'
import BasePermission from '@/mixins/permission'

export default {
  name: 'OverviewList',
  components: {
    ProjectSelect,
  },
  mixins: [BaseSelect, BasePermission],
  props: {
    tenant: {
      type: Object,
      default: () => null,
    },
  },
  data () {
    this.headers = [
      { text: '大盘名称', value: 'name', align: 'start' },
      { text: '环境', value: 'environment', align: 'start' },
      { text: '创建时间', value: 'createAt', align: 'start' },
      { text: '创建人', value: 'creator', align: 'start' },
      { text: '', value: 'action', align: 'start', width: 20 },
    ]

    return {
      params: {
        page: 1,
        size: 10,
      },
      project: undefined,
      items: [],
      pageCount: 0,
    }
  },
  watch: {
    project: {
      async handler() {
      },
      deep: true,
    },
  },
  methods: {

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
