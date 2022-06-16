<template>
  <v-container fluid>
    <BaseMicroServiceHeader />
    <BaseBreadcrumb />
    <v-card>
      <v-card-title class="py-4">
        <BaseFilter
          :default="{ items: [], text: '服务名称', value: 'search' }"
          :filters="filters"
          :reload="false"
          @refresh="m_filter_list"
        />
        <EnvironmentFilter />
        <v-spacer />
        <v-menu v-if="m_permisson_virtualSpaceAllow" left>
          <template #activator="{ on }">
            <v-btn icon>
              <v-icon color="primary" small v-on="on"> fas fa-ellipsis-v </v-icon>
            </v-btn>
          </template>
          <v-card>
            <v-card-text class="pa-2">
              <v-flex>
                <v-btn color="primary" text @click="addIstioVirtualService">
                  <v-icon left>mdi-cloud-outline</v-icon>
                  创建istio虚拟服务
                </v-btn>
              </v-flex>
              <v-flex>
                <v-btn color="primary" text @click="addIstioDestinationRule">
                  <v-icon left>mdi-ruler</v-icon>
                  创建istio流量规则
                </v-btn>
              </v-flex>
              <v-flex>
                <v-btn color="primary" text @click="addIstioGateway">
                  <v-icon left>mdi-gate</v-icon>
                  创建istio网关
                </v-btn>
              </v-flex>
            </v-card-text>
          </v-card>
        </v-menu>
      </v-card-title>
      <v-data-table
        class="mx-4"
        :custom-filter="baseFilter"
        disable-sort
        :headers="headers"
        hide-default-footer
        :items="items"
        :items-per-page="1000"
        no-data-text="暂无数据"
        no-results-text="暂无数据"
        :search.sync="$route.query.search"
      >
        <template #[`item.name`]="{ item }">
          <a class="text-subtitle-2" @click="kialiServiceDetail(item)">
            <v-flex class="float-left">
              {{ item.name }}
            </v-flex>
            <v-flex v-if="item.istioSidecar && item.appLabel" class="float-left ml-2">
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
        <template #[`item.namespace`]>
          {{ EnvironmentFilter ? EnvironmentFilter.text : '' }}
        </template>
        <template #[`item.labels`]="{ item, index }">
          <BaseCollapseChips :id="`v_label_${index}`" :chips="item.labels || {}" icon="mdi-label" single-line />
        </template>
        <template #[`item.config`]="{ item, index }">
          <v-flex :id="`r${index}`" />
          <v-flex
            v-for="(ref, i) in item.istioReferences.length > 1
              ? item.showConfig
                ? item.istioReferences
                : item.istioReferences.slice(0, 1)
              : item.istioReferences"
            :key="i"
          >
            <v-chip class="ma-1" color="success" small text-color="white">
              <strong class="mx-1"> {{ ref.objectType }} </strong>
              {{ ref.name }}
              <strong v-if="item.istioReferences.length > 1 && !item.showConfig" class="ml-2">
                {{ `+${item.istioReferences.length - 1}` }}
              </strong>
            </v-chip>
            <template v-if="item.istioReferences.length > 1 && i === 0">
              <v-btn
                v-if="item.showConfig"
                class="cell-btn"
                color="primary"
                icon
                small
                text
                @click="showAllConfig(index)"
              >
                <v-icon>mdi-chevron-double-up</v-icon>
              </v-btn>
              <v-btn v-else class="cell-btn" color="primary" icon small text @click="showAllConfig(index)">
                <v-icon>mdi-chevron-double-down</v-icon>
              </v-btn>
            </template>
            <v-menu :attach="`#r${index}`" left top>
              <template #activator="{ on }">
                <v-btn icon>
                  <v-icon color="primary" x-small v-on="on"> fas fa-ellipsis-v </v-icon>
                </v-btn>
              </template>
              <v-card>
                <v-card-text class="pa-2">
                  <v-flex>
                    <v-btn color="primary" small text @click="updateIstioRecource(ref)"> 编辑 </v-btn>
                  </v-flex>
                  <v-flex>
                    <v-btn color="error" small text @click="removeIstioResource(ref)"> 删除 </v-btn>
                  </v-flex>
                </v-card-text>
              </v-card>
            </v-menu>
          </v-flex>
        </template>
        <template #[`item.valid`]="{ item, index }">
          <v-flex :id="`v${item.name}`" />
          <v-icon v-if="valids[item.name] && valids[item.name].valid" color="success" small> mdi-check-circle </v-icon>
          <v-menu
            v-else
            :attach="`#v${item.name}`"
            :close-delay="200"
            max-width="200px"
            nudge-bottom="-5px"
            offset-y
            open-on-hover
            :origin="params.size - index <= 5 || (items.length <= 5 && index >= 1) ? `bottom center` : `top center`"
            right
            :top="params.size - index <= 5 || (items.length <= 5 && index >= 1)"
            transition="scale-transition"
          >
            <template #activator="{ on }">
              <v-icon color="warning" small v-on="on"> mdi-alert-circle </v-icon>
            </template>
            <v-card>
              <v-list class="pa-0" dense>
                <v-flex class="text-body-2 text-center primary white--text py-2">
                  <v-icon color="white" left small> mdi-alert </v-icon>
                  <span>警告</span>
                </v-flex>
                <v-list-item>
                  <v-list-item-content>
                    <v-list-item class="float-left pa-0" two-line>
                      <v-list-item-content class="py-0">
                        <v-list-item-title> 警告 </v-list-item-title>
                        <v-list-item-content class="text-caption kubegems__text kubegems__break-all">
                          {{
                            valids[item.name] &&
                            valids[item.name].checks
                              .map((c) => {
                                return c.message;
                              })
                              .join(',')
                          }}
                        </v-list-item-content>
                      </v-list-item-content>
                    </v-list-item>
                  </v-list-item-content>
                </v-list-item>
              </v-list>
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
        @loaddata="serviceList"
      />
    </v-card>

    <AddVirtualService ref="addVirtualService" @refresh="serviceList" />
    <AddIstioDestinationRule ref="addIstioDestinationRule" @refresh="serviceList" />
    <AddIstioGateway ref="addIstioGateway" @refresh="serviceList" />

    <UpdateVirtualService ref="updateVirtualService" @refresh="serviceList" />
    <UpdateIstioDestinationRule ref="updateIstioDestinationRule" @refresh="serviceList" />
    <UpdateIstioGateway ref="updateIstioGateway" @refresh="serviceList" />
    <UpdateResource ref="updateResource" @refresh="serviceList" />
  </v-container>
</template>

<script>
  import { mapGetters, mapState } from 'vuex';

  import AddIstioDestinationRule from './components/destination_rule/AddIstioDestinationRule';
  import UpdateIstioDestinationRule from './components/destination_rule/UpdateIstioDestinationRule';
  import AddIstioGateway from './components/gateway/AddIstioGateway';
  import UpdateIstioGateway from './components/gateway/UpdateIstioGateway';
  import UpdateResource from './components/UpdateResource';
  import AddVirtualService from './components/virtual_service/AddVirtualService';
  import UpdateVirtualService from './components/virtual_service/UpdateVirtualService';
  import {
    getMicroServiceList,
    deleteIstioGateway,
    deleteIstioVirtualService,
    deleteIstioDestinationRule,
  } from '@/api';
  import BaseFilter from '@/mixins/base_filter';
  import BasePermission from '@/mixins/permission';
  import EnvironmentFilter from '@/views/microservice/components/EnvironmentFilter';

  export default {
    name: 'Service',
    components: {
      AddIstioDestinationRule,
      AddIstioGateway,
      AddVirtualService,
      EnvironmentFilter,
      UpdateIstioDestinationRule,
      UpdateIstioGateway,
      UpdateResource,
      UpdateVirtualService,
    },
    mixins: [BaseFilter, BasePermission],
    data: () => ({
      items: [],
      valids: {},
      pageCount: 0,
      params: {
        page: 1,
        size: 10,
      },
      filters: [{ text: '服务名称', value: 'search', items: [] }],
    }),
    computed: {
      ...mapState(['JWT', 'EnvironmentFilter']),
      ...mapGetters(['VirtualSpace']),
      headers() {
        const items = [
          { text: '服务名称', value: 'name', align: 'start', filterable: true },
          { text: '命名空间', value: 'namespace', align: 'start' },
          { text: '标签', value: 'labels', align: 'start', width: 500 },
          { text: '配置检查', value: 'valid', align: 'start' },
          { text: 'Istio配置', value: 'config', align: 'start', width: 350 },
        ];
        return items;
      },
    },
    watch: {
      '$store.state.EnvironmentFilter': {
        handler: function (env) {
          if (env) this.serviceList();
        },
        deep: true,
        immediate: true,
      },
    },
    methods: {
      baseFilter(value, search, item) {
        return (
          item != null &&
          search != null &&
          item.name &&
          item.name.toLocaleLowerCase().indexOf(search.toLocaleLowerCase()) > -1
        );
      },
      serviceList(noprocess = false) {
        this.microServiceList(noprocess);
      },
      async microServiceList(noprocess) {
        const data = await getMicroServiceList(this.VirtualSpace().ID, this.EnvironmentFilter.value, {
          ...this.params,
          noprocessing: noprocess,
        });
        data.pagedata.List = data.pagedata.List.map((s) => {
          return {
            ...s,
            showConfig: false,
          };
        });
        this.items = data.pagedata.List;
        this.valids = data.validations ? data.validations.service : {};
        this.pageCount = Math.ceil(data.pagedata.Total / this.params.size);
        this.params.page = data.pagedata.CurrentPage;
      },
      showAllConfig(index) {
        const item = this.items[index];
        item.showConfig = !item.showConfig;
        this.$set(this.items, index, item);
      },
      kialiServiceDetail(item) {
        this.$router.push({
          name: 'microservice-detail',
          params: Object.assign(this.$route.params, { name: item.name }),
          query: {
            type: 'Service',
            namespace: this.EnvironmentFilter.namespace,
            cluster: this.EnvironmentFilter.cluster,
            environment: this.EnvironmentFilter.text,
            environmentid: this.EnvironmentFilter.value,
          },
        });
      },
      addIstioVirtualService() {
        if (!this.EnvironmentFilter) {
          this.$store.commit('SET_SNACKBAR', {
            text: '请选择应用环境',
            color: 'warning',
          });
          return;
        }
        this.$refs.addVirtualService.open();
      },
      addIstioDestinationRule() {
        if (!this.EnvironmentFilter) {
          this.$store.commit('SET_SNACKBAR', {
            text: '请选择应用环境',
            color: 'warning',
          });
          return;
        }
        this.$refs.addIstioDestinationRule.open();
      },
      addIstioGateway() {
        if (!this.EnvironmentFilter) {
          this.$store.commit('SET_SNACKBAR', {
            text: '请选择应用环境',
            color: 'warning',
          });
          return;
        }
        this.$refs.addIstioGateway.open();
      },
      updateIstioRecource(item) {
        if (item.objectType === 'Gateway') {
          this.$refs.updateIstioGateway.init(item);
          this.$refs.updateIstioGateway.open();
        } else if (item.objectType === 'VirtualService') {
          this.$refs.updateVirtualService.init(item);
          this.$refs.updateVirtualService.open();
        } else if (item.objectType === 'DestinationRule') {
          this.$refs.updateIstioDestinationRule.init(item);
          this.$refs.updateIstioDestinationRule.open();
        } else {
          this.$refs.updateResource.init(item);
          this.$refs.updateResource.open();
        }
      },
      removeIstioResource(item) {
        this.$store.commit('SET_CONFIRM', {
          title: `删除${item.objectType}`,
          content: {
            text: `删除${item.objectType} ${item.name}`,
            type: 'delete',
            name: item.name,
          },
          param: { item },
          doFunc: async (param) => {
            if (param.item.name.length > 0) {
              if (param.item.objectType === 'Gateway') {
                await deleteIstioGateway(
                  this.EnvironmentFilter.cluster,
                  this.EnvironmentFilter.namespace,
                  param.item.name,
                );
              } else if (param.item.objectType === 'VirtualService') {
                await deleteIstioVirtualService(
                  this.EnvironmentFilter.cluster,
                  this.EnvironmentFilter.namespace,
                  param.item.name,
                );
              } else if (param.item.objectType === 'DestinationRule') {
                await deleteIstioDestinationRule(
                  this.EnvironmentFilter.cluster,
                  this.EnvironmentFilter.namespace,
                  param.item.name,
                );
              }
              this.serviceList(true);
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

<style lang="scss" scoped>
  .cell-btn {
    display: inline-flex;
  }
</style>
