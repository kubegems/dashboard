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
          :default="{ items: [], text: $t('filter.workload_name'), value: 'search' }"
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
                <v-btn color="primary" text @click="addWorkload">
                  <v-icon left>mdi-plus-box</v-icon>
                  {{ $root.$t('operate.create_c', [$root.$t('resource.workload')]) }}
                </v-btn>
              </v-flex>
              <v-flex>
                <v-btn
                  color="error"
                  text
                  @click="
                    m_table_batchRemoveResource(
                      tabItems[tab].value === 'DaemonSet'
                        ? $root.$t('resource.daemonset')
                        : tabItems[tab].value === 'Deployment'
                        ? $root.$t('resource.deployment')
                        : $root.$t('resource.statefulset'),
                      tabItems[tab].value,
                      workloadList,
                    )
                  "
                >
                  <v-icon left>mdi-minus-box</v-icon>
                  {{ $root.$t('operate.delete_c', [$root.$t('resource.workload')]) }}
                </v-btn>
              </v-flex>
            </v-card-text>
          </v-card>
        </v-menu>
      </v-card-title>
      <v-card-text class="py-0">
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
          <template #[`item.name`]="{ item, index }">
            <v-flex :id="`a${item.workload.metadata.resourceVersion}`" />
            <v-flex class="float-left">
              <a class="text-subtitle-2 kubegems__inline_flex" @click.stop="workloadDetail(item.workload)">
                {{ item.workload.metadata.name }}
              </a>
            </v-flex>
            <v-flex v-if="isTke(item)" class="float-left mt-1 ml-2 icon-height">
              <BaseLogo icon-name="tke" mt="n1" :width="20" />
            </v-flex>
            <v-flex v-if="isNvidia(item)" class="float-left mt-1 ml-2 icon-height">
              <BaseLogo icon-name="nvidia" mt="n1" :width="20" />
            </v-flex>
            <v-flex class="float-left ml-2">
              <ResourceAdvise
                v-if="item.hasOwnProperty('advise')"
                :advise-item="adviseItems[`${item.workload.metadata.name}/${item.workload.metadata.namespace}`]"
                :item="item.workload"
                :kind="tabItems[tab].value"
                :top="params.size - index <= 5 || (items.length <= 5 && index >= 1)"
                @clearAdvise="clearAdvise"
                @scaleResourceLimit="scaleResourceLimit"
              />
            </v-flex>
            <div class="kubegems__clear-float" />
          </template>
          <template #[`item.namespace`]="{ item }">
            {{ item.workload.metadata.namespace }}
          </template>
          <template #[`item.status`]="{ item, index }">
            <v-flex :id="`e${item.workload.metadata.resourceVersion}`" />
            <EventTip
              :item="item.workload"
              :kind="tabItems[tab].value"
              :top="params.size - index <= 5 || (items.length <= 5 && index >= 1)"
            >
              <template #trigger>
                <span
                  :class="`v-avatar mr-2 ${
                    m_resource_getWorkloadStatus(tabItems[tab].value, item.workload) === 'pending'
                      ? 'kubegems__waiting-flashing'
                      : ''
                  }`"
                  :style="{
                    height: '10px',
                    minWidth: '10px',
                    width: '10px',
                    backgroundColor: `${
                      $WORKLOAD_STATUS_COLOR[m_resource_getWorkloadStatus(tabItems[tab].value, item.workload)]
                    }`,
                  }"
                />
                <span>
                  {{
                    m_resource_getWorkloadStatus(tabItems[tab].value, item.workload) === 'ready' ? 'Ready' : 'Pending'
                  }}
                </span>
                <span v-if="tabItems[tab].value !== 'DaemonSet'">
                  ({{ item.workload.status.availableReplicas || item.workload.status.readyReplicas || 0 }}/{{
                    item.workload.spec.replicas
                  }})
                </span>
                <span v-else>
                  ({{ item.workload.status.numberReady || 0 }}/{{ item.workload.status.currentNumberScheduled }})
                </span>
              </template>
            </EventTip>
          </template>
          <template #[`item.createAt`]="{ item }">
            {{
              item.workload.metadata.creationTimestamp
                ? $moment(item.workload.metadata.creationTimestamp).format('lll')
                : ''
            }}
          </template>

          <template #[`item.action`]="{ item }">
            <v-flex :id="`r${item.workload.metadata.resourceVersion}`" />
            <v-menu :attach="`#r${item.workload.metadata.resourceVersion}`" left>
              <template #activator="{ on }">
                <v-btn icon>
                  <v-icon color="primary" small v-on="on"> mdi-dots-vertical </v-icon>
                </v-btn>
              </template>
              <v-card>
                <v-card-text class="pa-2">
                  <v-flex>
                    <v-btn color="primary" small text @click="updateWorkload(item.workload)">
                      {{ $root.$t('operate.edit') }}
                    </v-btn>
                  </v-flex>
                  <v-flex>
                    <v-btn color="error" small text @click="removeWorkload(item.workload)">
                      {{ $root.$t('operate.delete') }}
                    </v-btn>
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
          @loaddata="workloadList"
        />
      </v-card-text>
    </v-card>
    <AddWorkload ref="addWorkload" @refresh="workloadList" />
    <UpdateWorkload ref="updateWorkload" @refresh="workloadList" />
    <ResourceLimit ref="resourceLimit" @clearAdvise="clearAdvise" />
  </v-container>
</template>

<script>
  import { mapGetters, mapState } from 'vuex';

  import AddWorkload from './components/AddWorkload';
  import ResourceAdvise from './components/ResourceAdvise';
  import ResourceLimit from './components/ResourceLimit';
  import UpdateWorkload from './components/UpdateWorkload';
  import messages from './i18n';
  import {
    deleteDaemonSet,
    deleteDeployment,
    deleteStatefulSet,
    deleteWorkloadResourceAdvise,
    getDaemonSetList,
    getDeploymentList,
    getStatefulSetList,
    getWorkloadResourcesList,
  } from '@/api';
  import BaseFilter from '@/mixins/base_filter';
  import BasePermission from '@/mixins/permission';
  import BaseResource from '@/mixins/resource';
  import BaseTable from '@/mixins/table';
  import EventTip from '@/views/resource/components/common/EventTip';
  import NamespaceFilter from '@/views/resource/components/common/NamespaceFilter';

  export default {
    name: 'Workload',
    i18n: {
      messages: messages,
    },
    components: {
      AddWorkload,
      EventTip,
      NamespaceFilter,
      ResourceAdvise,
      ResourceLimit,
      UpdateWorkload,
    },
    mixins: [BaseFilter, BasePermission, BaseResource, BaseTable],
    data() {
      this.tabMap = {
        deployment: 0,
        statefulset: 1,
        daemonset: 2,
      };

      return {
        tab: this.tabMap[this.$route.query.tab] || 0,
        items: [],
        pageCount: 0,
        params: {
          page: 1,
          size: 10,
        },
        adviseItems: {},
      };
    },
    computed: {
      ...mapState(['JWT', 'AdminViewport', 'MessageStreamWS']),
      ...mapGetters(['Environment']),
      headers() {
        const items = [
          { text: this.$t('table.name'), value: 'name', align: 'start' },
          { text: this.$t('table.status'), value: 'status', align: 'start', sortable: false },
          { text: this.$root.$t('resource.create_at'), value: 'createAt', align: 'start' },
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
        return [{ text: this.$t('filter.workload_name'), value: 'search', items: [] }];
      },
      tabItems() {
        return [
          { text: this.$root.$t('resource.deployment'), value: 'Deployment', tab: 'deployment' },
          { text: this.$root.$t('resource.statefulset'), value: 'StatefulSet', tab: 'statefulset' },
          { text: this.$root.$t('resource.daemonset'), value: 'DaemonSet', tab: 'daemonset' },
        ];
      },
    },
    watch: {
      '$store.state.NamespaceFilter': {
        handler: function (namespace) {
          if (namespace && !namespace.Mounted) {
            this.params.page = 1;
            this.params.namespace = namespace.Namespace;
            this.workloadList();
          }
        },
        deep: true,
      },
      '$store.state.MessageStream': {
        handler: function (updatingWorkload) {
          if (!updatingWorkload) return;
          const workload = JSON.parse(updatingWorkload);
          if (workload.MessageType !== 'objectChanged') return;
          if (workload.EventKind === 'delete') {
            this.m_table_generateParams();
            this.workloadList(true);
            return;
          }
          if (
            workload.EventKind === 'add' &&
            this.params.page === 1 &&
            workload.InvolvedObject.Kind === this.tabItems[this.tab].value
          ) {
            if (
              this.AdminViewport ||
              workload.InvolvedObject.NamespacedName.indexOf(this.Environment().Namespace) === 0
            ) {
              this.m_table_generateParams();
              this.workloadList(true);
              return;
            }
          }
          const index = this.items.findIndex((w) => {
            return (
              workload.Content.metadata &&
              w.workload.metadata.name === workload.Content.metadata.name &&
              w.workload.metadata.namespace === workload.Content.metadata.namespace
            );
          });
          if (index > -1) {
            const w = this.items[index];
            w.workload = workload.Content;
            this.$set(this.items, index, w);
          }
        },
        deep: true,
        immediate: true,
      },
      m_table_sortparam: {
        handler: function (newV, oldV) {
          if (oldV.name !== newV.name) return;
          if (oldV.desc === null) return;
          this.workloadList(true);
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
          this.workloadList();
        });
      }
    },
    methods: {
      addWorkload() {
        this.$nextTick(() => {
          this.$refs.addWorkload.init();
          this.$refs.addWorkload.setKind(this.tabItems[this.tab].value);
          this.$refs.addWorkload.open();
        });
      },
      async onTabChange() {
        this.params.page = 1;
        this.items = [];
        this.pageCount = 0;
        await this.workloadList();
      },
      async workloadList(noprocess = false) {
        let data = {};
        if (this.tabItems[this.tab].value === 'DaemonSet') {
          data = await getDaemonSetList(
            this.ThisCluster,
            this.ThisNamespace,
            Object.assign(this.params, {
              noprocessing: noprocess,
              sort: this.m_table_generateResourceSortParamValue(),
            }),
          );
        } else if (this.tabItems[this.tab].value === 'StatefulSet') {
          data = await getStatefulSetList(
            this.ThisCluster,
            this.ThisNamespace,
            Object.assign(this.params, {
              noprocessing: noprocess,
              sort: this.m_table_generateResourceSortParamValue(),
            }),
          );
        } else if (this.tabItems[this.tab].value === 'Deployment') {
          data = await getDeploymentList(
            this.ThisCluster,
            this.ThisNamespace,
            Object.assign(this.params, {
              noprocessing: noprocess,
              sort: this.m_table_generateResourceSortParamValue(),
            }),
          );
        }
        const workloads = [];
        data.List.forEach((item) => {
          workloads.push({
            workload: item,
          });
        });
        this.items = workloads;
        this.pageCount = Math.ceil(data.Total / this.params.size);
        this.params.page = data.CurrentPage;
        this.$router.replace({
          query: { ...this.$route.query, ...this.params, tab: this.tabItems[this.tab].tab },
        });
        this.adviseList();
        this.watchWorkloadList();
        this.items = this.items.map((workload) => {
          return {
            ...workload.workload,
            ...workload,
          };
        });
        this.m_table_generateSelectResource();
      },
      watchWorkloadList() {
        const sub = {
          kind: 'objectChanged',
          content: {},
        };
        const watchWorkloadList = [];
        this.items.forEach((workload) => {
          watchWorkloadList.push(`${workload.workload.metadata.namespace}/${workload.workload.metadata.name}`);
        });
        sub.content[this.ThisCluster] = {};
        sub.content[this.ThisCluster][this.tabItems[this.tab].value] = watchWorkloadList;
        if (this.MessageStreamWS && this.MessageStreamWS.readyState === 1) {
          this.MessageStreamWS.send(JSON.stringify(sub));
        }
      },
      async adviseList() {
        const params = {
          cluster: this.ThisCluster,
          namespace: this.ThisNamespace,
          workloadtype: this.tabItems[this.tab].value,
          noprocessing: true,
        };
        // 清空原来的建议
        this.adviseItems = {};
        const data = await getWorkloadResourcesList(params);
        if (data) {
          // advise list to map, ns+name=key
          data.forEach((advise) => {
            this.adviseItems[`${advise.Name}/${advise.Namespace}`] = advise;
          });
          this.items.forEach((item, itemKey) => {
            const nameAndNs = `${item.workload.metadata.name}/${item.workload.metadata.namespace}`;
            if (this.adviseItems[nameAndNs]) {
              item.advise = this.adviseItems[nameAndNs];
              this.$set(this.items, itemKey, item);
            }
          });
        }
      },
      async clearAdvise(advise) {
        await deleteWorkloadResourceAdvise(advise.ID);
        const index = this.items.findIndex((item) => {
          return item.advise && item.advise.Name === advise.Name;
        });
        if (index >= -1) {
          const item = this.items[index];
          this.$delete(item, 'advise');
          this.$set(this.items, index, item);
        }
      },
      workloadDetail(item) {
        this.$router.push({
          name: 'workload-detail',
          params: Object.assign(this.$route.params, {
            name: item.metadata.name,
          }),
          query: {
            type: this.tabItems[this.tab].value,
            namespace: item.metadata.namespace,
          },
        });
      },
      updateWorkload(item) {
        const kind = this.tabItems[this.tab].value;
        this.$refs.updateWorkload.init(item, kind);
        this.$refs.updateWorkload.open();
      },
      removeWorkload(item) {
        if (this.tabItems[this.tab].value === 'DaemonSet') {
          this.$store.commit('SET_CONFIRM', {
            title: this.$root.$t('operate.delete_c', [this.$root.$t('resource.daemonset')]),
            content: {
              text: `${this.$root.$t('operate.delete_c', [this.$root.$t('resource.daemonset')])} ${item.metadata.name}`,
              type: 'delete',
              name: item.metadata.name,
            },
            param: { item },
            doFunc: async (param) => {
              if (param.item.metadata.name.length > 0) {
                await deleteDaemonSet(this.ThisCluster, param.item.metadata.namespace, param.item.metadata.name);
                this.workloadList();
              }
            },
          });
        } else if (this.tabItems[this.tab].value === 'StatefulSet') {
          this.$store.commit('SET_CONFIRM', {
            title: this.$root.$t('operate.delete_c', [this.$root.$t('resource.statefulset')]),
            content: {
              text: `${this.$root.$t('operate.delete_c', [this.$root.$t('resource.statefulset')])} ${
                item.metadata.name
              }`,
              type: 'delete',
              name: item.metadata.name,
            },
            param: { item },
            doFunc: async (param) => {
              if (param.item.metadata.name.length > 0) {
                await deleteStatefulSet(this.ThisCluster, param.item.metadata.namespace, param.item.metadata.name);
                this.workloadList();
              }
            },
          });
        } else if (this.tabItems[this.tab].value === 'Deployment') {
          this.$store.commit('SET_CONFIRM', {
            title: this.$root.$t('operate.delete_c', [this.$root.$t('resource.deployment')]),
            content: {
              text: `${this.$root.$t('operate.delete_c', [this.$root.$t('resource.deployment')])} ${
                item.metadata.name
              }`,
              type: 'delete',
              name: item.metadata.name,
            },
            param: { item },
            doFunc: async (param) => {
              if (param.item.metadata.name.length > 0) {
                await deleteDeployment(this.ThisCluster, param.item.metadata.namespace, param.item.metadata.name);
                this.workloadList();
              }
            },
          });
        }
      },
      scaleResourceLimit(item, kind, adviseItem) {
        this.$refs.resourceLimit.init(item, kind, adviseItem);
        this.$refs.resourceLimit.open();
      },
      onPageSizeChange(size) {
        this.params.page = 1;
        this.params.size = size;
      },
      onPageIndexChange(page) {
        this.params.page = page;
      },
      isTke(item) {
        return item.spec.template.spec.containers.some((c) => {
          return c?.resources?.limits && c?.resources?.limits['tencent.com/vcuda'];
        });
      },
      isNvidia(item) {
        return item.spec.template.spec.containers.some((c) => {
          return c?.resources?.limits && c?.resources?.limits['nvidia.com/gpu'];
        });
      },
    },
  };
</script>
