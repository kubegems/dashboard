<template>
  <v-container fluid>
    <BaseBreadcrumb :breadcrumb="breadcrumb" />
    <v-card>
      <v-card-title class="py-2">
        <BaseFilter
          :filters="filters"
          :default="{ items: [], text: '应用商店仓库名称', value: 'search' }"
          :reload="false"
          @refresh="m_filter_list"
          @filter="customFilter"
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
          <v-card>
            <v-card-text class="pa-2">
              <v-flex>
                <v-btn
                  color="primary"
                  text
                  @click="addRepository"
                >
                  <v-icon left>mdi-plus-box</v-icon>
                  添加仓库
                </v-btn>
              </v-flex>
              <v-flex>
                <v-btn
                  text
                  color="error"
                  @click="
                    m_table_batchRemoveNotK8SResource(
                      '仓库',
                      'Repository',
                      repositoryList,
                    )
                  "
                >
                  <v-icon left>mdi-minus-box</v-icon>
                  删除仓库
                </v-btn>
              </v-flex>
            </v-card-text>
          </v-card>
        </v-menu>
      </v-card-title>
      <v-data-table
        class="mx-4"
        disable-sort
        :headers="headers"
        :items="items"
        :items-per-page="500"
        no-data-text="暂无数据"
        hide-default-footer
        show-select
        @toggle-select-all="
          m_table_onNotK8SResourceToggleSelect($event, 'Name', 'ChartRepoName')
        "
      >
        <template #[`item.data-table-select`]="{ item }">
          <v-checkbox
            v-model="m_table_batchResources[item.ID].checked"
            color="primary"
            hide-details
            @click.stop
            @change="m_table_onNotK8SResourceChange($event, item, 'Name', 'ChartRepoName')"
          />
        </template>
        <template #[`item.chartRepoName`]="{ item }">
          {{ item.ChartRepoName }}
        </template>
        <template #[`item.syncStatus`]="{ item }">
          {{ item.SyncStatus }}
        </template>
        <template #[`item.url`]="{ item }">
          {{ item.URL }}
        </template>
        <template #[`item.lastSync`]="{ item }">
          {{ $moment(item.LastSync).format('lll') }}
        </template>
        <template #[`item.action`]="{ item }">
          <v-flex :id="`r${item.ID}`" />
          <v-menu
            left
            :attach="`#r${item.ID}`"
          >
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
            <v-card>
              <v-card-text class="pa-2">
                <v-flex>
                  <v-btn
                    color="primary"
                    text
                    small
                    @click.stop="syncRepository(item)"
                  >
                    同步
                  </v-btn>
                </v-flex>
                <v-flex>
                  <v-btn
                    color="primary"
                    text
                    small
                    @click.stop="updateRepository(item)"
                  >
                    编辑
                  </v-btn>
                </v-flex>
                <v-flex>
                  <v-btn
                    color="error"
                    text
                    small
                    @click.stop="removeRepository(item)"
                  >
                    删除
                  </v-btn>
                </v-flex>
              </v-card-text>
            </v-card>
          </v-menu>
        </template>
      </v-data-table>
    </v-card>
    <RepositoryInfo
      ref="repositoryInfo"
      @refresh="repositoryList"
    />
  </v-container>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
import { getRepositoryList, deleteRepository, postSyncRepository } from '@/api'
import RepositoryInfo from './components/RepositoryInfo'
import BaseFilter from '@/mixins/base_filter'
import BaseSelect from '@/mixins/select'
import BaseResource from '@/mixins/resource'
import BaseTable from '@/mixins/table'
import { deepCopy } from '@/utils/helpers'

export default {
  name: 'RepositoryList',
  components: { RepositoryInfo },
  mixins: [BaseFilter, BaseSelect, BaseResource, BaseTable],
  data: () => ({
    breadcrumb: {
      title: '应用商店仓库',
      tip: 'chart仓库是chart包存放的位置, 被应用商店和部署所使用。',
      icon: 'mdi-hexagon-multiple',
    },
    items: [],
    headers: [
      { text: '仓库名', value: 'chartRepoName', align: 'start' },
      { text: '链接', value: 'url', align: 'start' },
      { text: '同步状态', value: 'syncStatus', align: 'start' },
      { text: '上次同步', value: 'lastSync', align: 'start' },
      { text: '', value: 'action', align: 'center', width: 20 },
    ],
    filters: [{ text: '应用商店仓库名称', value: 'search', items: [] }],
    params: {},
  }),
  computed: {
    ...mapState(['JWT']),
    ...mapGetters(['Tenant']),
  },
  mounted() {
    if (this.JWT) {
      this.repositoryList()
    }
  },
  methods: {
    customFilter() {
      if (this.$route.query.search && this.$route.query.search.length > 0) {
        this.items = this.itemsCopy.filter((item) => {
          return (
            item.name &&
            item.name
              .toLocaleLowerCase()
              .indexOf(this.$route.query.search.toLocaleLowerCase()) > -1
          )
        })
      } else {
        this.items = this.itemsCopy
      }
      this.m_table_generateSelectResourceNoK8s('Name', 'ChartRepoName')
    },
    async repositoryList() {
      const data = await getRepositoryList(this.params)
      this.items = data.map((item) => {
        return {
          name: item.ChartRepoName,
          ...item,
        }
      })
      this.itemsCopy = deepCopy(this.items)
      this.customFilter()
      this.m_table_generateSelectResourceNoK8s('Name', 'ChartRepoName')
    },
    addRepository() {
      this.$refs.repositoryInfo.title = '添加仓库'
      this.$refs.repositoryInfo.open()
    },
    updateRepository(item) {
      this.$refs.repositoryInfo.title = '更新仓库'
      this.$refs.repositoryInfo.init(item)
      this.$refs.repositoryInfo.open()
    },
    removeRepository(item) {
      this.$store.commit('SET_CONFIRM', {
        title: `删除仓库`,
        content: {
          text: `删除仓库 ${item.ChartRepoName}`,
          type: 'delete',
          name: item.ChartRepoName,
        },
        param: { item },
        doFunc: async (param) => {
          await deleteRepository(param.item.ChartRepoName)
          this.repositoryList()
        },
      })
    },
    syncRepository(item) {
      this.$store.commit('SET_CONFIRM', {
        title: `同步仓库`,
        content: { text: `同步仓库 ${item.ChartRepoName}`, type: 'confirm' },
        param: { item },
        doFunc: async (param) => {
          await postSyncRepository(param.item.ChartRepoName)
          this.repositoryList()
        },
      })
    },
  },
}
</script>
