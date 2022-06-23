<template>
  <v-container fluid>
    <BaseViewportHeader v-if="!AdminViewport" :environmented="Environment().ID > 0" />
    <BaseBreadcrumb />
    <v-card>
      <v-card-title class="py-4">
        <BaseFilter
          :default="{ items: [], text: '应用名称', value: 'search' }"
          :filters="filters"
          @refresh="m_filter_list"
        />
        <NamespaceFilter />
        <v-spacer />
        <v-menu v-if="m_permisson_resourceAllow && tab === 0" left>
          <template #activator="{ on }">
            <v-btn icon>
              <v-icon color="primary" small v-on="on"> fas fa-ellipsis-v </v-icon>
            </v-btn>
          </template>
          <v-card>
            <v-card-text class="pa-2">
              <v-flex>
                <v-btn color="primary" text @click="linkApp">
                  <v-icon left>mdi-link</v-icon>
                  关联应用
                </v-btn>
              </v-flex>
              <v-flex>
                <v-btn color="primary" text @click="deployApp">
                  <v-icon left>mdi-send</v-icon>
                  部署应用
                </v-btn>
              </v-flex>
            </v-card-text>
          </v-card>
        </v-menu>
      </v-card-title>
      <v-card-text>
        <v-tabs v-model="tab" class="rounded-t" height="30" @change="onTabChange">
          <v-tab v-for="item in tabItems" :key="item.value">
            {{ item.text }}
          </v-tab>
        </v-tabs>

        <v-data-table
          :headers="headers"
          hide-default-footer
          :items="items"
          :items-per-page="params.size"
          no-data-text="暂无数据"
          :page.sync="params.page"
          @update:sort-by="m_table_sortBy"
          @update:sort-desc="m_table_sortDesc"
        >
          <template #[`item.name`]="{ item }">
            <a class="text-subtitle-2" @click="appDetail(item)">
              {{ item.name }}
            </a>
          </template>
          <template #[`item.kind`]="{ item }">
            {{ item.kind }}
          </template>
          <template #[`item.chart`]="{ item }">
            {{ item.chart }}
          </template>
          <template #[`item.creator`]="{ item }">
            {{ item.creator }}
          </template>
          <template #[`item.images`]="{ item }">
            <v-flex v-for="(value, index) in item.runtime.images" :key="index">
              {{ value }}
            </v-flex>
          </template>
          <template #[`item.createAt`]="{ item }">
            {{ item.runtime.createAt ? $moment(item.runtime.createAt).format('lll') : '' }}
          </template>
          <template #[`item.taskStatus`]="{ item, index }">
            <TaskStatusTip :index="index" :item="item" :size="params.size" />
          </template>
          <template #[`item.appStatus`]="{ item, index }">
            <v-flex :id="`e${item.name}`" />
            <AppStatusTip :item="item" :top="params.size - index <= 5 || (items.length <= 5 && index >= 1)">
              <template #trigger>
                <span
                  :class="`v-avatar mr-2 ${item.runtime.status === 'Progressing' ? 'kubegems__waiting-flashing' : ''}`"
                  :style="`height: 10px; min-width: 10px; width: 10px; background-color: ${
                    $ARGO_STATUS_COLOR[item.runtime.status] ? $ARGO_STATUS_COLOR[item.runtime.status] : 'grey'
                  };`"
                />
                {{ item.runtime.status ? item.runtime.status : '' }}
                {{ getStatus(item) }}
              </template>
            </AppStatusTip>
          </template>
          <template #[`item.action`]="{ item }">
            <v-flex :id="`r${item.name}`" />
            <v-menu :attach="`#r${item.name}`" left>
              <template #activator="{ on }">
                <v-btn icon>
                  <v-icon color="primary" x-small v-on="on"> fas fa-ellipsis-v </v-icon>
                </v-btn>
              </template>
              <v-card>
                <v-card-text class="pa-2">
                  <v-flex>
                    <v-btn color="error" small text @click="removeApp(item)"> 删除 </v-btn>
                  </v-flex>
                </v-card-text>
              </v-card>
            </v-menu>
          </template>
        </v-data-table>
        <BasePagination
          v-if="pageCount >= 1"
          v-model="params.page"
          :page-count="pageCount"
          :size="params.size"
          @changepage="onPageIndexChange"
          @changesize="onPageSizeChange"
          @loaddata="appRunningList"
        />
      </v-card-text>
    </v-card>

    <LinkApp ref="linkApp" @refresh="appRunningList" />
    <DeployApp ref="deployApp" @refresh="appRunningList" />
  </v-container>
</template>

<script>
  import { mapGetters, mapState } from 'vuex';

  import AppStatusTip from './components/AppStatusTip';
  import TaskStatusTip from './components/TaskStatusTip';
  import { deleteApp, deleteAppStoreApp, getAppRunningList, getAppStoreRunningList, getAppTaskList } from '@/api';
  import BaseFilter from '@/mixins/base_filter';
  import BasePermission from '@/mixins/permission';
  import BaseResource from '@/mixins/resource';
  import BaseTable from '@/mixins/table';
  import DeployApp from '@/views/resource/appmanifest/components/DeployApp';
  import LinkApp from '@/views/resource/appmanifest/components/LinkApp';
  import NamespaceFilter from '@/views/resource/components/common/NamespaceFilter';

  export default {
    name: 'App',
    components: {
      AppStatusTip,
      DeployApp,
      LinkApp,
      NamespaceFilter,
      TaskStatusTip,
    },
    mixins: [BaseFilter, BasePermission, BaseResource, BaseTable],
    data: () => ({
      items: [],
      pageCount: 0,
      params: {
        page: 1,
        size: 10,
      },
      tab: 0,
      filters: [{ text: '应用名称', value: 'search', items: [] }],
    }),
    computed: {
      ...mapState(['JWT', 'Admin', 'AdminViewport', 'MessageStreamWS']),
      ...mapGetters(['Tenant', 'Environment', 'Project']),
      tabItems() {
        if (this.ThisAppEnvironmentID > 0) {
          return [
            { text: '平台应用', value: 'AppList' },
            { text: '应用商店应用', value: 'AppStoreList' },
          ];
        } else {
          return [{ text: '平台应用', value: 'AppList' }];
        }
      },
      headers() {
        const items = [
          { text: '应用名称', value: 'name', align: 'start' },
          { text: '应用类型', value: 'kind', align: 'start', sortable: false },
          {
            text: '当前镜像版本',
            value: 'images',
            align: 'start',
            sortable: false,
          },
          {
            text: '应用状态',
            value: 'appStatus',
            align: 'start',
            sortable: false,
          },
          {
            text: '发布者',
            value: 'creator',
            align: 'start',
            sortable: false,
          },
          { text: '发布时间', value: 'createAt', align: 'start' },
        ];
        if (this.tabItems[this.tab].value === 'AppList') {
          items.splice(3, 0, {
            text: '部署任务状态',
            value: 'taskStatus',
            align: 'start',
            sortable: false,
          });
        }
        if (this.tabItems[this.tab].value === 'AppStoreList') {
          items.splice(1, 0, {
            text: 'Chart',
            value: 'chart',
            align: 'start',
            sortable: false,
          });
        }
        if (this.m_permisson_resourceAllow || this.AdminViewport) {
          items.push({
            text: '',
            value: 'action',
            align: 'center',
            width: 20,
            sortable: false,
          });
        }
        return items;
      },
    },
    watch: {
      '$store.state.NamespaceFilter': {
        handler: function (namespace) {
          if (namespace && !namespace.Mounted) {
            this.appRunningList();
          }
        },
        deep: true,
      },
      '$store.state.MessageStream': {
        handler: function (updatingApp) {
          if (!updatingApp) return;
          const app = JSON.parse(updatingApp);
          if (app.MessageType !== 'objectChanged') return;
          if (app.EventKind === 'delete') {
            this.m_table_generateParams();
            this.appRunningList(true);
            return;
          }
          if (app.InvolvedObject.Kind === 'Application') {
            if (app.EventKind === 'add' && this.params.page === 1) {
              this.appRunningList(true);
              return;
            }
            const index = this.items.findIndex((a) => {
              return a.name === app.Content.name;
            });
            if (index > -1) {
              const item = this.items[index];
              let newItem = {};
              if (item.task) {
                newItem = { ...app.Content, task: item.task };
              } else {
                newItem = app.Content;
              }
              this.$set(this.items, index, newItem);
            }
          } else if (app.InvolvedObject.Kind === 'Task') {
            const index = this.items.findIndex((a) => {
              return `${this.Environment().Namespace}/${a.name}` === app.InvolvedObject.NamespacedName;
            });
            if (index > -1) {
              const item = this.items[index];
              item.task = app.Content;
              this.$set(this.items, index, item);
            }
          }
        },
        deep: true,
        immediate: true,
      },
      m_table_sortparam: {
        handler: function (newV, oldV) {
          if (oldV.name !== newV.name) return;
          if (oldV.desc === null) return;
          this.appRunningList(true);
        },
        deep: true,
      },
    },
    mounted() {
      if (this.JWT) {
        this.$nextTick(() => {
          if (!this.AdminViewport && this.Project().ID === 0) {
            return;
          }
          this.m_table_generateParams();
          this.appRunningList();
        });
      }
    },
    methods: {
      async onTabChange() {
        this.params.page = 1;
        this.items = [];
        this.pageCount = 0;
        await this.appRunningList();
      },
      linkApp() {
        this.$refs.linkApp.open();
      },
      deployApp() {
        this.$refs.deployApp.init();
        this.$refs.deployApp.open();
      },
      async appRunningList(noprocess = false) {
        this.pageCount = 0;
        let kind = 'app';
        let data = {};
        if (this.tabItems[this.tab].value === 'AppList') {
          kind = 'app';
          data = await getAppRunningList(
            this.Tenant().ID,
            this.Project().ID,
            this.ThisAppEnvironmentID,
            Object.assign(this.params, {
              kind: kind,
              noprocessing: noprocess,
              sort: this.m_table_generateResourceSortParamValue(),
            }),
          );
        } else if (this.tabItems[this.tab].value === 'AppStoreList') {
          kind = 'appstore';
          data = await getAppStoreRunningList(
            this.Tenant().ID,
            this.Project().ID,
            this.ThisAppEnvironmentID,
            Object.assign(this.params, {
              kind: kind,
              noprocessing: noprocess,
              sort: this.m_table_generateResourceSortParamValue(),
            }),
          );
        }
        this.items = data.List;
        this.pageCount = Math.ceil(data.Total / this.params.size);
        this.params.page = data.CurrentPage;
        this.$router.replace({ query: { ...this.$route.query, ...this.params } });
        this.watchAppList();
        if (this.tabItems[this.tab].value === 'AppList') {
          this.appTaskList();
        }
      },
      async appTaskList() {
        const data = await getAppTaskList(this.Tenant().ID, this.Project().ID, this.ThisAppEnvironmentID, {
          names: this.items
            .map((item) => {
              return item.name;
            })
            .join(','),
          noprocessing: true,
        });
        this.items.map((item, index) => {
          const task = data.find((d) => {
            return d.name === item.name;
          });
          if (task) this.$set(this.items, index, { ...item, task: task.task });
        });
      },
      watchAppList() {
        const sub = {
          kind: 'objectChanged',
          content: {},
        };
        const watchAppList = [];
        this.items.forEach((app) => {
          watchAppList.push(`${this.Environment().Namespace}/${app.name}`);
        });
        if (this.tabItems[this.tab].value === 'AppList') {
          sub.content[this.ThisCluster] = {
            Application: watchAppList,
            Task: watchAppList,
          };
        } else {
          sub.content[this.ThisCluster] = {
            Application: watchAppList,
          };
        }
        if (this.MessageStreamWS && this.MessageStreamWS.readyState === 1) {
          this.MessageStreamWS.send(JSON.stringify(sub));
        }
      },
      appDetail(item) {
        let kind = 'app';
        if (this.tabItems[this.tab].value === 'AppList') {
          kind = 'app';
        } else if (this.tabItems[this.tab].value === 'AppStoreList') {
          kind = 'appstore';
        }
        this.$router.push({
          name: 'app-detail',
          params: Object.assign(this.$route.params, { name: item.name }),
          query: {
            projectid: this.Project().ID,
            tenantid: this.Tenant().ID,
            environmentid: this.Environment().ID,
            kind: kind,
            namespace: this.Environment().Namespace,
          },
        });
      },
      removeApp(item) {
        this.$store.commit('SET_CONFIRM', {
          title: this.tabItems[this.tab].value === 'AppList' ? '删除平台应用' : '删除应用商店应用',
          content: {
            text:
              this.tabItems[this.tab].value === 'AppList'
                ? `删除平台应用 ${item.name}`
                : `删除应用商店应用 ${item.name}`,
            type: 'delete',
            name: item.name,
          },
          param: { item },
          doFunc: async (param) => {
            if (this.tabItems[this.tab].value === 'AppList') {
              await deleteApp(this.Tenant().ID, this.Project().ID, this.Environment().ID, param.item.name);
            } else {
              await deleteAppStoreApp(this.Tenant().ID, this.Project().ID, this.Environment().ID, param.item.name);
            }
            this.appRunningList();
          },
        });
      },
      onPageSizeChange(size) {
        this.params.page = 1;
        this.params.size = size;
      },
      onPageIndexChange(page) {
        this.params.page = page;
      },
      getStatus(item) {
        const status = [];
        if (!['Synced', 'OutOfSync'].includes(item?.runtime?.raw?.status?.sync?.status)) {
          status.push(`Sync: ${item?.runtime?.raw?.status?.sync?.status || '未知'}`);
        }
        if (item?.runtime?.raw?.status?.operationState?.phase !== 'Succeeded') {
          status.push(`Operation: ${item?.runtime?.raw?.status?.operationState?.phase || '未知'}`);
        }
        return status.length > 0 ? `( ${status.join(', ')} ) ` : '';
      },
    },
  };
</script>
