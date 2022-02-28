<template>
  <v-container
    fluid
    class="monitor"
  >
    <BaseBreadcrumb :breadcrumb="breadcrumb" />

    <v-card class="pa-4">
      <div class="mb-4">
        <ClusterSelect
          v-model="params.cluster"
          auto-select-first
          @change="onClusterChange"
        />
      </div>

      <div class="d-flex">
        <BaseFilter
          :filters="filters"
          :default="filters[0]"
          @refresh="onSearch"
        />
        <NamespaceSelect
          v-model="params.namespace"
          :cluster="params.cluster"
          class="ml-4"
          @change="onNamespaceChange"
        />
        <v-spacer />
        <v-menu left>
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
          <v-card class="pa-2">
            <v-btn
              text
              block
              color="primary"
              @click="onCreate"
            >
              <v-icon left>mdi-plus</v-icon>
              创建采集器
            </v-btn>
          </v-card>
        </v-menu>
      </div>

      <v-data-table
        :headers="headers"
        :items="items"
        :page.sync="params.page"
        :items-per-page="params.size"
        no-data-text="暂无数据"
        hide-default-footer
        item-key="name"
        disable-sort
      >
        <!-- <template #[`item.Name`]="{ item }">
          <a class="text-subtitle-2" @click="handleDetail(item)">
            {{ item.Name }}
          </a>
        </template> -->
        <template #[`item.target_type`]="{ item }">{{ item.target_type || '-' }}</template>
        <template #[`item.target_name`]="{ item }">{{ item.target_name || '-' }}</template>
        <template #[`item.labels`]="{ item }">
          <BaseCollapseChips
            :chips="item.target_labels"
            single-line
          />
        </template>
        <template #[`item.action`]="{ item }">
          <v-menu left>
            <template #activator="{ on }">
              <v-btn icon>
                <v-icon
                  x-small
                  color="primary"
                  v-on="on"
                >
                  fas fa-ellipsis-v
                </v-icon>
              </v-btn>
            </template>
            <v-card class="pa-2">
              <v-btn
                color="success"
                text
                small
                block
                @click="onEdit(item)"
              >
                编辑
              </v-btn>
              <v-btn
                color="error"
                text
                small
                block
                @click="onDelete(item)"
              >
                删除
              </v-btn>
            </v-card>
          </v-menu>
        </template>
      </v-data-table>
      <BasePagination
        v-if="pageCount >= 1"
        v-model="params.page"
        :page-count="pageCount"
        :size="params.size"
        @loaddata="getMonitorList"
        @changesize="onPageSizeChange"
        @changepage="onPageIndexChange"
      />
    </v-card>

    <TargetsForm
      ref="TargetsForm"
      :cluster="params.cluster"
      @finishSubmit="getMonitorList"
    />
  </v-container>
</template>

<script>
import { getMetricsTargetList, deleteMetricsTarget } from '@/api'
import ClusterSelect from '@/views/observe/components/ClusterSelect'
import NamespaceSelect from '@/views/observe/components/NamespaceSelect'
import TargetsForm from './components/TargetsForm.vue'

export default {
  name: 'MetricsMonitor',
  components: {
    ClusterSelect,
    NamespaceSelect,
    TargetsForm,
  },
  data () {
    this.breadcrumb = {
      title: '监控采集器',
      tip: '',
      icon: 'mdi-eyedropper',
    }

    this.filters = [
      { text: '名称', value: 'name', items: [] },
    ]

    this.headers = [
      { text: '名称', value: 'name', align: 'start', width: 300 },
      { text: '类型', value: 'target_type', align: 'start', width: 160 },
      { text: '命名空间', value: 'namespace', align: 'start' },
      { text: '目标', value: 'target_name', align: 'start', width: 300 },
      { text: '标签', value: 'labels', align: 'start' },
      { text: '', value: 'action', align: 'center', width: 40 },
    ]

    return {
      params: {
        cluster: undefined,
        namespace: '_all',
        page: 1,
        size: 10,
        name: '',
      },
      items: [],
      pageCount: 0,
    }
  },
  methods: {
    async getMonitorList () {
      const { cluster, namespace, page, size, name } = this.params
      const data = await getMetricsTargetList(cluster, namespace, { page, size, name })
      this.items = data.List
      this.pageCount = Math.ceil(data.Total / this.params.size)
      this.params.page = data.CurrentPage
    },
    onClusterChange () {
      this.params.page = 1
      this.params.namespace = '_all'
      this.getMonitorList()
    },
    onNamespaceChange () {
      this.params.page = 1
      this.getMonitorList()
    },
    onPageSizeChange(size) {
      this.params.page = 1
      this.params.size = size
    },
    onPageIndexChange(page) {
      this.params.page = page
    },
    onSearch (params) {
      this.params.page = 1
      if (params) {
        this.params.name = params.name || ''
      }
      this.getMonitorList()
    },
    onCreate () {
      this.$refs.TargetsForm.show()
    },
    onEdit (item) {
      this.$refs.TargetsForm.show('edit', item)
    },
    onDelete (item) {
      this.$store.commit('SET_CONFIRM', {
        title: `删除采集器`,
        content: {
          text: `删除采集器 ${item.name}`,
          type: 'delete',
          name: item.name,
        },
        doFunc: async () => {
          await deleteMetricsTarget(this.params.cluster, item.namespace, item.name, { type: item.target_type })
          this.getMonitorList()
        },
      })
    },
  },
}
</script>
