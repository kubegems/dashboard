<template>
  <v-container fluid>
    <BaseMicroServiceHeader />
    <BaseBreadcrumb />
    <v-card>
      <v-card-title class="py-4">
        <BaseFilter
          :default="{ items: [], text: '负载名称', value: 'search' }"
          :filters="filters"
          @refresh="m_filter_list"
        />
        <EnvironmentFilter />
      </v-card-title>
      <v-card-text class="py-0">
        <v-tabs v-model="tab" class="rounded-t" height="30" @change="onTabChange">
          <v-tab v-for="item in tabItems" :key="item.value">
            {{ item.text }}
          </v-tab>
        </v-tabs>
        <v-data-table
          class="kubegems__table-row-pointer"
          disable-sort
          :headers="headers"
          hide-default-footer
          item-key="name"
          :items="items"
          :items-per-page="params.size"
          no-data-text="暂无数据"
          :page.sync="params.page"
          show-expand
          single-expand
          @click:row="onRowClick"
          @item-expanded="podList"
        >
          <template #[`item.name`]="{ item }">
            <a class="text-subtitle-2" @click.stop="microAppWorkoladDetail(item)">
              <v-flex class="float-left">
                {{ item.name }}
              </v-flex>
              <v-flex v-if="item.istioInjected" class="float-left ml-2">
                <v-menu nudge-right="20px" nudge-top="10px" open-on-hover right>
                  <template #activator="{ on }">
                    <span v-on="on">
                      <Icon class="mr-2 primary--text" height="18px" icon="simple-icons:istio" width="18px" />
                    </span>
                  </template>
                  <v-card>
                    <v-card-text class="pa-2"> 自动注入 </v-card-text>
                  </v-card>
                </v-menu>
              </v-flex>
            </a>
          </template>
          <template #[`item.istioVersion`]="{ item }">
            {{ item.istioVersion }}
          </template>
          <template #[`item.namespace`]="{ item }">
            {{ item.namespace }}
          </template>
          <template #[`item.labels`]="{ item, index }">
            <BaseCollapseChips
              :id="`w_label_${index}`"
              :chips="item.Object.metadata.labels || {}"
              icon="mdi-label"
              single-line
            />
          </template>
          <template #[`item.status`]="{ item }">
            <span
              :class="`v-avatar mr-2 ${
                m_resource_getWorkloadStatus(tabItems[tab].value, item.Object) === 'pending'
                  ? 'kubegems__waiting-flashing'
                  : ''
              }`"
              :style="`height: 10px; min-width: 10px; width: 10px; background-color: ${
                $WORKLOAD_STATUS_COLOR[m_resource_getWorkloadStatus(tabItems[tab].value, item.Object)]
              };`"
            />
            <span>
              {{ m_resource_getWorkloadStatus(tabItems[tab].value, item.Object) === 'ready' ? 'Ready' : 'Pending' }}
            </span>
            <span>
              ({{ item.Object.status.availableReplicas || item.Object.status.readyReplicas || 0 }}/{{
                item.Object.spec.replicas
              }})
            </span>
          </template>
          <template #expanded-item="{ headers }">
            <td class="my-2 py-2" :colspan="headers.length">
              <span>容器组</span>
              <v-sheet v-if="podItems && podItems.length === 0" class="grey lighten-4 rounded my-1 py-6 text-center">
                暂无容器组
              </v-sheet>
              <v-sheet v-for="(pod, index) in podItems" :key="index" class="grey lighten-4 rounded my-1">
                <v-list-item two-line>
                  <v-list-item-content class="py-0">
                    <v-list-item-subtitle class="text-body-2 py-0">
                      <v-list-item class="float-left py-0 pl-0" style="width: 300px" two-line>
                        <v-list-item-content class="py-0">
                          <v-list-item-title class="text-subtitle-2 py-1 kubegems__text font-weight-regular">
                            <v-icon class="float-left mt-1" color="primary" left small> mdi-cube </v-icon>
                            <v-flex class="float-left">
                              {{ pod.metadata.name }}
                            </v-flex>
                            <div class="kubegems__clear-float" />
                          </v-list-item-title>
                        </v-list-item-content>
                      </v-list-item>
                      <v-list-item class="float-left py-0 pl-0" style="width: 250px" two-line>
                        <v-list-item-content class="py-0">
                          <v-list-item-title class="text-subtitle-2 py-1 kubegems__text font-weight-regular">
                            <span
                              :class="`v-avatar mr-2 ${
                                ['ContainerCreating', 'Pending', 'Terminating', 'PodInitializing'].indexOf(
                                  m_resource_getPodStatus(pod),
                                ) > -1
                                  ? 'kubegems__waiting-flashing'
                                  : ''
                              }`"
                              :style="`height: 10px; min-width: 10px; width: 10px; background-color: ${
                                $POD_STATUS_COLOR[m_resource_getPodStatus(pod)] || '#ff5252'
                              };`"
                            />
                            <span>
                              {{ m_resource_getPodStatus(pod) }}
                            </span>
                            <span>
                              ({{
                                pod.status && pod.status.containerStatuses
                                  ? pod.status.containerStatuses.filter((c) => {
                                      return c.ready;
                                    }).length
                                  : 0
                              }}/{{ pod.spec.containers.length }})
                            </span>
                          </v-list-item-title>
                          <v-list-item-subtitle class="text-body-2 py-1"> 状态 </v-list-item-subtitle>
                        </v-list-item-content>
                      </v-list-item>
                      <v-list-item class="float-left py-0 pl-0" style="width: 200px" two-line>
                        <v-list-item-content class="py-0">
                          <v-list-item-title class="text-subtitle-2 py-1 kubegems__text font-weight-regular">
                            {{ getRestart(pod.status.containerStatuses) }}
                          </v-list-item-title>
                          <v-list-item-subtitle class="text-body-2 py-1"> 重启次数 </v-list-item-subtitle>
                        </v-list-item-content>
                      </v-list-item>
                      <v-list-item class="float-left py-0 pl-0" style="width: 200px" two-line>
                        <v-list-item-content class="py-0">
                          <v-list-item-title class="text-subtitle-2 py-1 kubegems__text font-weight-regular">
                            {{
                              pod.status.startTime
                                ? $moment(pod.status.startTime, 'YYYY-MM-DDTHH:mm:ssZ').fromNow()
                                : ''
                            }}
                          </v-list-item-title>
                          <v-list-item-subtitle class="text-body-2 py-1"> Age </v-list-item-subtitle>
                        </v-list-item-content>
                      </v-list-item>
                      <v-list-item class="float-left py-0 pl-0" style="width: 200px" two-line>
                        <v-list-item-content class="py-0">
                          <v-list-item-title class="text-subtitle-2 py-1 kubegems__text font-weight-regular">
                            {{ pod.status.podIP }}
                          </v-list-item-title>
                          <v-list-item-subtitle class="text-body-2 py-1"> Pod IP </v-list-item-subtitle>
                        </v-list-item-content>
                      </v-list-item>
                      <v-list-item class="float-left py-0 pl-0" style="width: 200px" two-line>
                        <v-list-item-content class="py-0">
                          <v-list-item-title class="text-subtitle-2 py-1 kubegems__text font-weight-regular">
                            {{ pod.status.hostIP }}
                          </v-list-item-title>
                          <v-list-item-subtitle class="text-body-2 py-1"> Node IP </v-list-item-subtitle>
                        </v-list-item-content>
                      </v-list-item>
                    </v-list-item-subtitle>
                    <div class="kubegems__clear-float" />
                  </v-list-item-content>
                </v-list-item>
              </v-sheet>
            </td>
          </template>
          <template #[`item.action`]="{ item }">
            <v-flex :id="`r${item.Name}`" />
            <v-menu :attach="`#r${item.Name}`" left>
              <template #activator="{ on }">
                <v-btn icon>
                  <v-icon color="primary" x-small v-on="on"> fas fa-ellipsis-v </v-icon>
                </v-btn>
              </template>
              <v-card>
                <v-card-text class="pa-2">
                  <v-flex v-if="item.istioInjected">
                    <v-btn color="error" small text @click.stop="injectSideCarToMicroAppWorkolad(item, false)">
                      取消注入SideCar
                    </v-btn>
                  </v-flex>
                  <v-flex v-else>
                    <v-btn color="primary" small text @click.stop="injectSideCarToMicroAppWorkolad(item, true)">
                      注入SideCar
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
          @loaddata="microAppWorkoladList"
        />
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script>
  import { mapGetters, mapState } from 'vuex';

  import { getMicroAppWorkoladList, putInjectSideCarToMicroAppWorkolad, getPodList } from '@/api';
  import BaseFilter from '@/mixins/base_filter';
  import BasePermission from '@/mixins/permission';
  import BaseResource from '@/mixins/resource';
  import BaseSelect from '@/mixins/select';
  import EnvironmentFilter from '@/views/microservice/components/EnvironmentFilter';

  export default {
    name: 'Workload',
    components: {
      EnvironmentFilter,
    },
    mixins: [BaseFilter, BasePermission, BaseResource, BaseSelect],
    data() {
      this.tabMap = {
        deployment: 0,
        statefulset: 1,
      };

      return {
        tab: this.tabMap[this.$route.query.tab] || 0,
        tabItems: [
          { text: '无状态服务', value: 'Deployment', tab: 'deployment' },
          { text: '有状态服务', value: 'StatefulSet', tab: 'statefulset' },
        ],
        items: [],
        pageCount: 0,
        params: {
          page: 1,
          size: 10,
        },
        filters: [{ text: '负载名称', value: 'search', items: [] }],
        podItems: [],
      };
    },
    computed: {
      ...mapState(['JWT', 'MessageStreamWS', 'EnvironmentFilter']),
      ...mapGetters(['VirtualSpace', 'Environment']),
      headers() {
        const items = [
          { text: '负载名称', value: 'name', align: 'start' },
          { text: '命名空间', value: 'namespace', align: 'start' },
          { text: '版本', value: 'istioVersion', align: 'start' },
          { text: '副本状态', value: 'status', align: 'start' },
          { text: '标签', value: 'labels', align: 'start', width: 450 },
        ];
        if (this.m_permisson_virtualSpaceAllow) {
          items.push({ text: '', value: 'action', align: 'end', width: 10 });
        }
        items.push({ text: '', value: 'data-table-expand' });
        return items;
      },
    },
    watch: {
      '$store.state.EnvironmentFilter': {
        handler: function (env) {
          if (env) {
            this.microAppWorkoladList();
          }
        },
        deep: true,
        immediate: true,
      },
      '$store.state.MessageStream': {
        handler: function (updatingWorkload) {
          if (!updatingWorkload) return;
          const workload = JSON.parse(updatingWorkload);
          if (workload.MessageType !== 'objectChanged') return;
          if (workload.EventKind === 'delete') {
            this.microAppWorkoladList(true);
            return;
          }
          if (
            workload.EventKind === 'add' &&
            this.params.page === 1 &&
            workload.InvolvedObject.Kind === this.tabItems[this.tab].value
          ) {
            if (workload.InvolvedObject.NamespacedName.indexOf(this.Environment().Namespace) === 0) {
              this.microAppWorkoladList(true);
              return;
            }
          }
          const index = this.items.findIndex((w) => {
            return (
              workload.Content.metadata &&
              w.Object.metadata.name === workload.Content.metadata.name &&
              w.Object.metadata.namespace === workload.Content.metadata.namespace
            );
          });
          if (index > -1) {
            const w = this.items[index];
            w.Object = workload.Content;
            this.$set(this.items, index, w);
          }
        },
        deep: true,
        immediate: true,
      },
      tab() {
        this.$router.replace({
          query: {
            ...this.$route.query,
            tab: this.tabItems[this.tab].tab,
          },
        });
      },
    },
    methods: {
      async microAppWorkoladList(noprocess = false) {
        const data = await getMicroAppWorkoladList(this.VirtualSpace().ID, this.EnvironmentFilter.value, {
          ...this.params,
          ...{
            search: this.$route.query.search ? this.$route.query.search : null,
          },
          kind: this.tabItems[this.tab].value,
          noprocessing: noprocess,
        });
        this.items = data.List;
        this.pageCount = Math.ceil(data.Total / this.params.size);
        this.params.page = data.CurrentPage;
        this.watchMicroAppWorkoladList();
      },
      watchMicroAppWorkoladList() {
        const sub = {
          kind: 'objectChanged',
          content: {},
        };
        const watchWorkloadList = [];
        this.items.forEach((workload) => {
          watchWorkloadList.push(`${workload.Object.metadata.namespace}/${workload.Object.metadata.name}`);
        });
        sub.content[this.ThisCluster] = {};
        sub.content[this.ThisCluster][this.tabItems[this.tab].value] = watchWorkloadList;
        if (this.MessageStreamWS && this.MessageStreamWS.readyState === 1) {
          this.MessageStreamWS.send(JSON.stringify(sub));
        }
      },
      async podList({ item, value }) {
        if (value) {
          const data = await getPodList(
            this.$route.query.cluster,
            item.Object.metadata.namespace,
            Object.assign({
              size: 1000,
              topkind: this.tabItems[this.tab].value,
              topname: item.Object.metadata.name,
              noprocessing: true,
            }),
          );
          this.podItems = data.List;
        } else {
          this.podItems = [];
        }
      },
      getRestart(containerStatuses) {
        let sum = 0;
        if (containerStatuses) {
          containerStatuses.forEach((con) => {
            sum += con.restartCount;
          });
        }
        return sum;
      },
      microAppWorkoladDetail(item) {
        this.$router.push({
          name: 'microworkload-detail',
          params: Object.assign(this.$route.params, { name: item.name }),
          query: {
            type: this.tabItems[this.tab].value,
            namespace: this.EnvironmentFilter.namespace,
            cluster: this.EnvironmentFilter.cluster,
            environment: this.EnvironmentFilter.text,
            environmentid: this.EnvironmentFilter.value,
          },
        });
      },
      async onTabChange() {
        this.params.page = 1;
        this.items = [];
        this.pageCount = 0;
        await this.microAppWorkoladList();
      },
      injectSideCarToMicroAppWorkolad(item, inject) {
        this.$store.commit('SET_CONFIRM', {
          title: inject ? '注入SideCar' : '取消注入SideCar',
          content: {
            text: inject ? `为应用 ${item.name} 注入SideCar` : `为应用 ${item.name} 取消注入SideCar`,
            type: 'confirm',
          },
          param: { item, inject },
          doFunc: async (param) => {
            await putInjectSideCarToMicroAppWorkolad(
              this.VirtualSpace().ID,
              this.EnvironmentFilter.value,
              param.item.name,
              {
                kind: this.tabItems[this.tab].value,
                inject: param.inject,
              },
            );
            this.microAppWorkoladList();
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
      onRowClick(item, { expand, isExpanded }) {
        expand(!isExpanded);
      },
    },
  };
</script>
