<!--
 * Copyright 2022 The kubegems.io Authors
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *       http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License. 
-->

<template>
  <v-container fluid>
    <BaseViewportHeader />
    <BaseBreadcrumb />
    <v-card>
      <v-card-title class="py-4">
        <BaseFilter
          :default="{ items: [], text: '定时任务名称', value: 'search' }"
          :filters="filters"
          @refresh="m_filter_list"
        />
        <NamespaceFilter />
        <v-spacer />
        <v-menu v-if="m_permisson_resourceAllow" left>
          <template #activator="{ on }">
            <v-btn icon>
              <v-icon color="primary" small v-on="on"> fas fa-ellipsis-v </v-icon>
            </v-btn>
          </template>
          <v-card>
            <v-card-text class="pa-2">
              <v-flex>
                <v-btn color="primary" text @click="addCronJob">
                  <v-icon left>mdi-playlist-plus</v-icon>
                  创建定时任务
                </v-btn>
              </v-flex>
              <v-flex>
                <v-btn color="error" text @click="m_table_batchRemoveResource('定时任务', 'CronJob', cronJobList)">
                  <v-icon left>mdi-minus-box</v-icon>
                  删除定时任务
                </v-btn>
              </v-flex>
            </v-card-text>
          </v-card>
        </v-menu>
      </v-card-title>
      <v-data-table
        class="mx-4"
        :headers="headers"
        hide-default-footer
        :items="items"
        :items-per-page="params.size"
        no-data-text="暂无数据"
        :page.sync="params.page"
        show-select
        @toggle-select-all="m_table_onResourceToggleSelect"
        @update:sort-by="m_table_sortBy"
        @update:sort-desc="m_table_sortDesc"
      >
        <template #[`item.data-table-select`]="{ item, index }">
          <v-checkbox
            v-model="m_table_batchResources[`${item.metadata.name}-${index}`].checked"
            color="primary"
            hide-details
            @change="m_table_onResourceChange($event, item, index)"
            @click.stop
          />
        </template>
        <template #[`item.name`]="{ item }">
          <a class="text-subtitle-2" @click="cronJobDetail(item)">
            {{ item.metadata.name }}
          </a>
        </template>
        <template #[`item.namespace`]="{ item }">
          {{ item.metadata.namespace }}
        </template>
        <template #[`item.crontab`]="{ item }">
          {{ item.spec.schedule }}
        </template>
        <template #[`item.status`]="{ item }">
          <span v-if="!item.spec.suspend">
            <v-avatar class="mr-2" size="10" :style="{ backgroundcolor: `#00bcd4` }">
              <span class="white--text text-h5" />
            </v-avatar>
            Active
          </span>
          <span v-else>
            <v-avatar class="mr-2" size="10" :style="{ backgroundcolor: `#607d8b` }">
              <span class="white--text text-h5" />
            </v-avatar>
            Suspend
          </span>
        </template>
        <template #[`item.lastAt`]="{ item }">
          {{
            item.status.lastScheduleTime ? $moment(item.status.lastScheduleTime, 'YYYY-MM-DDTHH:mm:ssZ').fromNow() : ''
          }}
        </template>
        <template #[`item.action`]="{ item }">
          <v-flex :id="`r${item.metadata.resourceVersion}`" />
          <v-menu :attach="`#r${item.metadata.resourceVersion}`" left>
            <template #activator="{ on }">
              <v-btn icon>
                <v-icon color="primary" x-small v-on="on"> fas fa-ellipsis-v </v-icon>
              </v-btn>
            </template>
            <v-card>
              <v-card-text class="pa-2">
                <v-flex>
                  <v-btn color="primary" small text @click="updateCronJob(item)"> 编辑 </v-btn>
                </v-flex>
                <v-flex>
                  <v-btn color="error" small text @click="removeCronJob(item)"> 删除 </v-btn>
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
        @loaddata="cronJobList"
      />
    </v-card>

    <AddCronJob ref="addCronJob" @refresh="cronJobList" />
    <UpdateCronJob ref="updateCronJob" @refresh="cronJobList" />
  </v-container>
</template>

<script>
  import { mapGetters, mapState } from 'vuex';

  import AddCronJob from './components/AddCronJob';
  import UpdateCronJob from './components/UpdateCronJob';
  import { deleteCronJob, getCronJobList } from '@/api';
  import BaseFilter from '@/mixins/base_filter';
  import BasePermission from '@/mixins/permission';
  import BaseResource from '@/mixins/resource';
  import BaseTable from '@/mixins/table';
  import NamespaceFilter from '@/views/resource/components/common/NamespaceFilter';

  export default {
    name: 'CronJob',
    components: {
      AddCronJob,
      NamespaceFilter,
      UpdateCronJob,
    },
    mixins: [BaseFilter, BasePermission, BaseResource, BaseTable],
    data: () => ({
      items: [],
      pageCount: 0,
      params: {
        page: 1,
        size: 10,
      },
      filters: [{ text: '定时任务名称', value: 'search', items: [] }],
    }),
    computed: {
      ...mapState(['JWT', 'AdminViewport', 'MessageStreamWS']),
      ...mapGetters(['Environment']),
      headers() {
        const items = [
          { text: '任务', value: 'name', align: 'start' },
          { text: '计划时间', value: 'crontab', align: 'start', sortable: false },
          { text: '状态', value: 'status', align: 'start', sortable: false },
          {
            text: '上次执行时间',
            value: 'lastAt',
            align: 'start',
            sortable: false,
          },
        ];
        if (this.m_permisson_resourceAllow) {
          items.push({
            text: '',
            value: 'action',
            align: 'center',
            width: 20,
            sortable: false,
          });
        }
        if (this.AdminViewport) {
          items.splice(1, 0, {
            text: '命名空间',
            value: 'namespace',
            align: 'start',
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
            this.params.page = 1;
            this.params.namespace = namespace.Namespace;
            this.cronJobList();
          }
        },
        deep: true,
      },
      '$store.state.MessageStream': {
        handler: function (updatingCronJob) {
          if (!updatingCronJob) return;
          const cronJob = JSON.parse(updatingCronJob);
          if (cronJob.MessageType !== 'objectChanged') return;
          if (cronJob.EventKind === 'delete') {
            this.m_table_generateParams();
            this.cronJobList(true);
            return;
          }
          if (cronJob.EventKind === 'add' && this.params.page === 1 && cronJob.InvolvedObject.Kind === 'CronJob') {
            if (
              this.AdminViewport ||
              cronJob.InvolvedObject.NamespacedName.indexOf(this.Environment().Namespace) === 0
            ) {
              this.m_table_generateParams();
              this.cronJobList(true);
              return;
            }
          }
          const index = this.items.findIndex((c) => {
            return (
              cronJob.Content.metadata &&
              c.metadata.name === cronJob.Content.metadata.name &&
              c.metadata.namespace === cronJob.Content.metadata.namespace
            );
          });
          if (index > -1) {
            this.$set(this.items, index, cronJob.Content);
          }
        },
        deep: true,
        immediate: true,
      },
      m_table_sortparam: {
        handler: function (newV, oldV) {
          if (oldV.name !== newV.name) return;
          if (oldV.desc === null) return;
          this.cronJobList(true);
        },
        deep: true,
      },
    },
    mounted() {
      if (this.JWT) {
        if (this.ThisCluster === '') {
          this.$store.commit('SET_SNACKBAR', {
            text: `请创建或选择集群`,
            color: 'warning',
          });
          return;
        }
        this.$nextTick(() => {
          this.m_table_generateParams();
          this.cronJobList();
        });
      }
    },
    methods: {
      async cronJobList(noprocess = false) {
        const data = await getCronJobList(
          this.ThisCluster,
          this.ThisNamespace,
          Object.assign(this.params, {
            noprocessing: noprocess,
            sort: this.m_table_generateResourceSortParamValue(),
          }),
        );
        this.items = data.List;
        this.pageCount = Math.ceil(data.Total / this.params.size);
        this.params.page = data.CurrentPage;
        this.$router.replace({ query: { ...this.$route.query, ...this.params } });
        this.watchCronJobList();
        this.m_table_generateSelectResource();
      },
      watchCronJobList() {
        const sub = {
          kind: 'objectChanged',
          content: {},
        };
        const watchCronJobList = [];
        this.items.forEach((cronJob) => {
          watchCronJobList.push(`${cronJob.metadata.namespace}/${cronJob.metadata.name}`);
        });
        sub.content[this.ThisCluster] = { CronJob: watchCronJobList };
        if (this.MessageStreamWS && this.MessageStreamWS.readyState === 1) {
          this.MessageStreamWS.send(JSON.stringify(sub));
        }
      },
      cronJobDetail(item) {
        this.$router.push({
          name: 'cronjob-detail',
          params: Object.assign(this.$route.params, {
            name: item.metadata.name,
          }),
          query: {
            namespace: item.metadata.namespace,
          },
        });
      },
      addCronJob() {
        this.$refs.addCronJob.open();
      },
      updateCronJob(item) {
        this.$refs.updateCronJob.init(item);
        this.$refs.updateCronJob.open();
      },
      removeCronJob(item) {
        this.$store.commit('SET_CONFIRM', {
          title: `删除定时任务`,
          content: {
            text: `删除定时任务 ${item.metadata.name}`,
            type: 'delete',
            name: item.metadata.name,
          },
          param: { item },
          doFunc: async (param) => {
            if (param.item.metadata.name.length > 0) {
              await deleteCronJob(this.ThisCluster, param.item.metadata.namespace, param.item.metadata.name);
              this.cronJobList();
            }
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
    },
  };
</script>
