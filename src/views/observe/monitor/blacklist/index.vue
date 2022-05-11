<template>
  <v-container
    fluid
    class="alert-history"
  >
    <BaseBreadcrumb />
    <v-card class="mt-4 pa-4">
      <div class="mb-4">
        <ClusterSelect
          v-model="params.cluster"
          :auto-select-first="!AdminViewport"
          :clearable="AdminViewport"
          @change="onSearchChange"
        />
      </div>

      <v-data-table
        :headers="headers"
        :items="items"
        :page.sync="params.page"
        :items-per-page="params.size"
        no-data-text="暂无数据"
        hide-default-footer
        item-key="Fingerprint"
        show-expand
        single-expand
        disable-sort
        @click:row="onRowClick"
      >
        <template #[`item.summary`]="{ item }">
          {{ item.Summary }}
        </template>
        <template #[`item.namespace`]="{ item }">
          {{ item.Namespace }}
        </template>
        <template #[`item.fingerprint`]="{ item }">
          {{ item.Fingerprint }}
        </template>
        <template #[`item.silenceCreator`]="{ item }">
          {{ item.SilenceCreator }}
        </template>
        <template #[`item.silenceEndsAt`]="{ item }">
          {{
            item.SilenceEndsAt
              ? $moment(item.SilenceEndsAt).format('yyyy/MM/DD hh:mm:ss')
              : '永久'
          }}
        </template>
        <template #expanded-item="{ headers, item }">
          <td
            :colspan="headers.length"
            class="pa-4"
          >
            <pre class="pre">{{ item.Labels }}</pre>
          </td>
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
                color="primary"
                text
                small
                @click.stop="onRemoveBlack(item)"
              >
                移除黑名单
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
        @loaddata="getBlackList"
        @changesize="onPageSizeChange"
        @changepage="onPageIndexChange"
      />
    </v-card>
  </v-container>
</template>

<script>
import { mapState } from 'vuex'
import { getPrometheusBlackList, deletePrometheusBlacklist } from '@/api'
import ClusterSelect from '@/views/observe/components/ClusterSelect'
import BaseSelect from '@/mixins/select'
import { deleteEmpty } from '@/utils/helpers'

export default {
  name: 'AlertHistroy',
  components: {
    ClusterSelect,
  },
  mixins: [BaseSelect],
  data() {
    this.headers = [
      { text: '摘要', value: 'summary', align: 'start' },
      { text: '命名空间', value: 'namespace', align: 'start' },
      { text: '指纹', value: 'fingerprint', align: 'start' },
      { text: '创建人', value: 'silenceCreator', align: 'start' },
      { text: '过期时间', value: 'silenceEndsAt', align: 'start' },
      { text: '', value: 'action', align: 'center', width: 20 },
      { text: '', value: 'data-table-expand', align: 'end' },
    ]

    return {
      items: [],
      pageCount: 0,
      params: {
        cluster: this.$route.query.cluster,
        namespace: this.$route.query.namespace,
        page: 1,
        size: 10,
      },
    }
  },
  computed: {
    ...mapState(['AdminViewport']),
  },
  mounted() {
    if (this.AdminViewport) this.getBlackList()
  },
  methods: {
    async getBlackList() {
      const params = deleteEmpty({ ...this.params })
      const data = await getPrometheusBlackList(params)
      this.pageCount = Math.ceil(data.Total / this.params.size)
      this.params.page = data.CurrentPage
      this.items = data.List || []
    },
    onPageSizeChange(size) {
      this.params.page = 1
      this.params.size = size
    },
    onPageIndexChange(page) {
      this.params.page = page
    },
    onSearchChange() {
      this.params.page = 1
      this.getBlackList()
    },
    onRemoveBlack(item) {
      this.$store.commit('SET_CONFIRM', {
        title: '告警黑名单',
        content: {
          text: '是否确认将此条告警信息从告警黑名单中移除？',
          type: 'confirm',
        },
        doFunc: async () => {
          await deletePrometheusBlacklist(item.Fingerprint)
          this.getBlackList()
        },
      })
    },
    onRowClick(item, { expand, isExpanded }) {
      expand(!isExpanded)
    },
  },
}
</script>
