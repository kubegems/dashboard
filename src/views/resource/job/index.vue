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
          :default="{ items: [], text: $t('filter.job_name'), value: 'search' }"
          :filters="filters"
          @refresh="m_filter_list"
        />
        <NamespaceFilter />
        <v-spacer />
        <v-menu v-if="m_permisson_resourceAllow" left>
          <template #activator="{ on }">
            <v-btn icon>
              <v-icon color="primary" v-on="on"> mdi-dots-vertical </v-icon>
            </v-btn>
          </template>
          <v-card>
            <v-card-text class="pa-2">
              <v-flex>
                <v-btn color="primary" text @click="addJob">
                  <v-icon left>mdi-playlist-plus</v-icon>
                  {{ $root.$t('operate.create_c', [$root.$t('resource.job')]) }}
                </v-btn>
              </v-flex>
              <v-flex>
                <v-btn
                  color="error"
                  text
                  @click="m_table_batchRemoveResource($root.$t('resource.job'), 'Job', jobList)"
                >
                  <v-icon left>mdi-minus-box</v-icon>
                  {{ $root.$t('operate.delete_c', [$root.$t('resource.job')]) }}
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
        :no-data-text="$root.$t('data.no_data')"
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
          <a class="text-subtitle-2 kubegems__inline_flex" @click.stop="jobDetail(item)">
            {{ item.metadata.name }}
          </a>
        </template>
        <template #[`item.namespace`]="{ item }">
          {{ item.metadata.namespace }}
        </template>
        <template #[`item.status`]="{ item }">
          <span v-if="item.status.succeeded !== undefined">
            <v-avatar class="mr-2" size="10" :style="{ backgroundColor: `#1e88e5` }">
              <span class="white--text text-h5" />
            </v-avatar>
            Succeeded
          </span>
          <span v-else-if="item.status.failed !== undefined">
            <v-avatar class="mr-2" size="10" :style="{ backgroundColor: `#ff5252` }">
              <span class="white--text text-h5" />
            </v-avatar>
            Failed
          </span>
          <span v-else-if="item.status.active !== undefined">
            <v-avatar class="mr-2" size="10" :style="{ backgroundColor: `#00bcd4` }">
              <span class="white--text text-h5" />
            </v-avatar>
            Active
          </span>
        </template>
        <template #[`item.startAt`]="{ item }">
          {{ item.status.startTime ? $moment(item.status.startTime).format('lll') : '' }}
        </template>
        <template #[`item.endAt`]="{ item }">
          {{ item.status.completionTime ? $moment(item.status.completionTime).format('lll') : '' }}
        </template>
        <template #[`item.action`]="{ item }">
          <v-flex :id="`r${item.metadata.resourceVersion}`" />
          <v-menu :attach="`#r${item.metadata.resourceVersion}`" left>
            <template #activator="{ on }">
              <v-btn icon>
                <v-icon color="primary" small v-on="on"> mdi-dots-vertical </v-icon>
              </v-btn>
            </template>
            <v-card>
              <v-card-text class="pa-2">
                <v-flex>
                  <v-btn color="primary" small text @click="updateJob(item)"> {{ $root.$t('operate.edit') }} </v-btn>
                </v-flex>
                <v-flex>
                  <v-btn color="error" small text @click="removeJob(item)"> {{ $root.$t('operate.delete') }} </v-btn>
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
        @loaddata="jobList"
      />
    </v-card>

    <AddJob ref="addJob" @refresh="jobList" />
    <UpdateJob ref="updateJob" @refresh="jobList" />
  </v-container>
</template>

<script>
  import { mapGetters, mapState } from 'vuex';

  import AddJob from './components/AddJob';
  import UpdateJob from './components/UpdateJob';
  import messages from './i18n';
  import { deleteJob, getJobList } from '@/api';
  import BaseFilter from '@/mixins/base_filter';
  import BasePermission from '@/mixins/permission';
  import BaseResource from '@/mixins/resource';
  import BaseTable from '@/mixins/table';
  import NamespaceFilter from '@/views/resource/components/common/NamespaceFilter';

  export default {
    name: 'Job',
    i18n: {
      messages: messages,
    },
    components: {
      AddJob,
      NamespaceFilter,
      UpdateJob,
    },
    mixins: [BaseFilter, BasePermission, BaseResource, BaseTable],
    data: () => ({
      items: [],
      pageCount: 0,
      params: {
        page: 1,
        size: 10,
      },
    }),
    computed: {
      ...mapState(['JWT', 'AdminViewport', 'MessageStreamWS']),
      ...mapGetters(['Environment']),
      headers() {
        const items = [
          { text: this.$t('table.name'), value: 'name', align: 'start' },
          { text: this.$t('table.status'), value: 'status', align: 'start', sortable: false },
          { text: this.$t('table.start_at'), value: 'startAt', align: 'start', sortable: false },
          { text: this.$t('table.end_at'), value: 'endAt', align: 'start', sortable: false },
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
            text: this.$root.$t('resource.namespace'),
            value: 'namespace',
            align: 'start',
            sortable: false,
          });
        }
        return items;
      },
      filters() {
        return [{ text: this.$t('filter.job_name'), value: 'search', items: [] }];
      },
    },
    watch: {
      '$store.state.NamespaceFilter': {
        handler: function (namespace) {
          if (namespace && !namespace.Mounted) {
            this.params.page = 1;
            this.params.namespace = namespace.Namespace;
            this.jobList();
          }
        },
        deep: true,
      },
      '$store.state.MessageStream': {
        handler: function (updatingJob) {
          if (!updatingJob) return;
          const job = JSON.parse(updatingJob);
          if (job.MessageType !== 'objectChanged') return;
          if (job.EventKind === 'delete') {
            this.m_table_generateParams();
            this.jobList(true);
            return;
          }
          if (job.EventKind === 'add' && this.params.page === 1 && job.InvolvedObject.Kind === 'Job') {
            if (this.AdminViewport || job.InvolvedObject.NamespacedName.indexOf(this.Environment().Namespace) === 0) {
              this.m_table_generateParams();
              this.jobList(true);
              return;
            }
          }
          const index = this.items.findIndex((j) => {
            return (
              job.Content.metadata &&
              j.metadata.name === job.Content.metadata.name &&
              j.metadata.namespace === job.Content.metadata.namespace
            );
          });
          if (index > -1) {
            this.$set(this.items, index, job.Content);
          }
        },
        deep: true,
        immediate: true,
      },
      m_table_sortparam: {
        handler: function (newV, oldV) {
          if (oldV.name !== newV.name) return;
          if (oldV.desc === null) return;
          this.jobList(true);
        },
        deep: true,
      },
    },
    mounted() {
      if (this.JWT) {
        this.$nextTick(() => {
          if (this.ThisCluster === '') {
            this.$store.commit('SET_SNACKBAR', {
              text: this.$root.$t('tip.select_cluster'),
              color: 'warning',
            });
            return;
          }
          this.m_table_generateParams();
          this.jobList();
        });
      }
    },
    methods: {
      async jobList(noprocess = false) {
        const data = await getJobList(
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
        this.watchJobList();
        this.m_table_generateSelectResource();
      },
      watchJobList() {
        const sub = {
          kind: 'objectChanged',
          content: {},
        };
        const watchJobList = [];
        this.items.forEach((job) => {
          watchJobList.push(`${job.metadata.namespace}/${job.metadata.name}`);
        });
        sub.content[this.ThisCluster] = { Job: watchJobList };
        if (this.MessageStreamWS && this.MessageStreamWS.readyState === 1) {
          this.MessageStreamWS.send(JSON.stringify(sub));
        }
      },
      jobDetail(item) {
        this.$router.push({
          name: 'job-detail',
          params: Object.assign(this.$route.params, {
            name: item.metadata.name,
          }),
          query: {
            namespace: item.metadata.namespace,
          },
        });
      },
      addJob() {
        this.$refs.addJob.open();
      },
      updateJob(item) {
        this.$refs.updateJob.init(item);
        this.$refs.updateJob.open();
      },
      removeJob(item) {
        this.$store.commit('SET_CONFIRM', {
          title: this.$root.$t('operate.delete_c', [this.$root.$t('resource.job')]),
          content: {
            text: `${this.$root.$t('operate.delete_c', [this.$root.$t('resource.job')])} ${item.metadata.name}`,
            type: 'delete',
            name: item.metadata.name,
          },
          param: { item },
          doFunc: async (param) => {
            if (param.item.metadata.name.length > 0) {
              await deleteJob(this.ThisCluster, param.item.metadata.namespace, param.item.metadata.name);
              this.jobList();
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
