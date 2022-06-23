<template>
  <v-container fluid>
    <BaseBreadcrumb />
    <v-card>
      <v-card-title class="py-4">
        <BaseFilter
          :default="{ items: [], text: '应用商店仓库名称', value: 'search' }"
          :filters="filters"
          :reload="false"
          @filter="customFilter"
          @refresh="m_filter_list"
        />
        <v-spacer />
        <v-menu left>
          <template #activator="{ on }">
            <v-btn icon>
              <v-icon color="primary" small v-on="on"> fas fa-ellipsis-v </v-icon>
            </v-btn>
          </template>
          <v-card>
            <v-card-text class="pa-2">
              <v-flex>
                <v-btn color="primary" text @click="addRepository">
                  <v-icon left>mdi-plus-box</v-icon>
                  添加仓库
                </v-btn>
              </v-flex>
              <v-flex>
                <v-btn
                  color="error"
                  text
                  @click="m_table_batchRemoveNotK8SResource('仓库', 'Repository', repositoryList)"
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
        class="mx-4 pb-4"
        disable-sort
        :headers="headers"
        hide-default-footer
        :items="items"
        :items-per-page="500"
        no-data-text="暂无数据"
        show-select
        @toggle-select-all="m_table_onNotK8SResourceToggleSelect($event, 'ChartRepoName')"
      >
        <template #[`item.data-table-select`]="{ item }">
          <v-checkbox
            v-model="m_table_batchResources[item.ID].checked"
            color="primary"
            hide-details
            @change="m_table_onNotK8SResourceChange($event, item, 'ChartRepoName')"
            @click.stop
          />
        </template>
        <template #[`item.chartRepoName`]="{ item }">
          {{ item.ChartRepoName }}
        </template>
        <template #[`item.syncStatus`]="{ item }">
          <StatusTip :item="item">
            <template #trigger>
              <v-icon v-if="item.SyncStatus === 'success'" color="success" small> fas fa-check-circle </v-icon>
              <v-icon v-else color="error" small> fas fa-minus-circle </v-icon>
              {{ item.SyncStatus }}
            </template>
          </StatusTip>
        </template>
        <template #[`item.url`]="{ item }">
          {{ item.URL }}
        </template>
        <template #[`item.lastSync`]="{ item }">
          {{ $moment(item.LastSync).format('lll') }}
        </template>
        <template #[`item.action`]="{ item }">
          <v-flex :id="`r${item.ID}`" />
          <v-menu :attach="`#r${item.ID}`" left>
            <template #activator="{ on }">
              <v-btn icon>
                <v-icon color="primary" x-small v-on="on"> fas fa-ellipsis-v </v-icon>
              </v-btn>
            </template>
            <v-card>
              <v-card-text class="pa-2">
                <v-flex>
                  <v-btn color="primary" small text @click.stop="syncRepository(item)"> 同步 </v-btn>
                </v-flex>
                <v-flex>
                  <v-btn color="primary" small text @click.stop="updateRepository(item)"> 编辑 </v-btn>
                </v-flex>
                <v-flex>
                  <v-btn color="error" small text @click.stop="removeRepository(item)"> 删除 </v-btn>
                </v-flex>
              </v-card-text>
            </v-card>
          </v-menu>
        </template>
      </v-data-table>
    </v-card>
    <RepositoryInfo ref="repositoryInfo" @refresh="repositoryList" />
  </v-container>
</template>

<script>
  import { mapGetters, mapState } from 'vuex';

  import RepositoryInfo from './components/RepositoryInfo';
  import StatusTip from './components/StatusTip';
  import { deleteRepository, getRepositoryList, postSyncRepository } from '@/api';
  import BaseFilter from '@/mixins/base_filter';
  import BaseResource from '@/mixins/resource';
  import BaseSelect from '@/mixins/select';
  import BaseTable from '@/mixins/table';
  import { deepCopy } from '@/utils/helpers';

  export default {
    name: 'RepositoryList',
    components: {
      RepositoryInfo,
      StatusTip,
    },
    mixins: [BaseFilter, BaseResource, BaseSelect, BaseTable],
    data: () => ({
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
        this.repositoryList();
      }
    },
    methods: {
      customFilter() {
        if (this.$route.query.search && this.$route.query.search.length > 0) {
          this.items = this.itemsCopy.filter((item) => {
            return (
              item.name && item.name.toLocaleLowerCase().indexOf(this.$route.query.search.toLocaleLowerCase()) > -1
            );
          });
        } else {
          this.items = this.itemsCopy;
        }
        this.m_table_generateSelectResourceNoK8s('ChartRepoName');
      },
      async repositoryList() {
        const data = await getRepositoryList(this.params);
        this.items = data.map((item) => {
          return {
            name: item.ChartRepoName,
            ...item,
          };
        });
        this.itemsCopy = deepCopy(this.items);
        this.customFilter();
        this.m_table_generateSelectResourceNoK8s('ChartRepoName');
      },
      addRepository() {
        this.$refs.repositoryInfo.setTitle('添加仓库');
        this.$refs.repositoryInfo.open();
      },
      updateRepository(item) {
        this.$refs.repositoryInfo.setTitle('更新仓库');
        this.$refs.repositoryInfo.init(item);
        this.$refs.repositoryInfo.open();
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
            await deleteRepository(param.item.ChartRepoName);
            this.repositoryList();
          },
        });
      },
      syncRepository(item) {
        this.$store.commit('SET_CONFIRM', {
          title: `同步仓库`,
          content: { text: `同步仓库 ${item.ChartRepoName}`, type: 'confirm' },
          param: { item },
          doFunc: async (param) => {
            await postSyncRepository(param.item.ChartRepoName);
            this.repositoryList();
          },
        });
      },
    },
  };
</script>
