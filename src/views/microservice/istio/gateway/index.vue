<template>
  <v-container fluid>
    <BaseMicroServiceHeader />
    <BaseBreadcrumb />
    <v-card>
      <v-card-title class="py-4">
        <BaseFilter
          :filters="filters"
          :default="{ items: [], text: '网关名称', value: 'search' }"
          @refresh="m_filter_list"
        />
        <EnvironmentFilter />
        <v-spacer />
        <v-menu v-if="m_permisson_virtualSpaceAllow" left>
          <template #activator="{ on }">
            <v-btn icon>
              <v-icon small color="primary" v-on="on"> fas fa-ellipsis-v </v-icon>
            </v-btn>
          </template>
          <v-card>
            <v-card-text class="pa-2">
              <v-flex>
                <v-btn text color="primary" @click="addGateway">
                  <v-icon left>mdi-plus-box</v-icon>
                  创建网关
                </v-btn>
              </v-flex>
              <v-flex>
                <v-btn text color="error" @click="m_table_batchRemoveResource('网关', 'Gateway', istioGatewayList)">
                  <v-icon left>mdi-minus-box</v-icon>
                  删除网关
                </v-btn>
              </v-flex>
            </v-card-text>
          </v-card>
        </v-menu>
      </v-card-title>
      <v-data-table
        class="mx-4"
        :headers="headers"
        :items="items"
        :page.sync="params.page"
        :items-per-page="params.size"
        no-data-text="暂无数据"
        hide-default-footer
        show-select
        @update:sort-by="m_table_sortBy"
        @update:sort-desc="m_table_sortDesc"
        @toggle-select-all="m_table_onResourceToggleSelect"
      >
        <template #[`item.data-table-select`]="{ item, index }">
          <v-checkbox
            v-model="m_table_batchResources[`${item.metadata.name}-${index}`].checked"
            color="primary"
            hide-details
            @click.stop
            @change="m_table_onResourceChange($event, item, index)"
          />
        </template>
        <template #[`item.name`]="{ item }">
          <a class="text-subtitle-2">
            {{ item.metadata.name }}
          </a>
        </template>
        <template #[`item.namespace`]="{ item }">
          {{ item.metadata.namespace }}
        </template>
        <template #[`item.selector`]="{ item }">
          <BaseCollapseChips v-if="item" :chips="item.spec.selector || {}" single-line icon="mdi-label" />
        </template>
        <template #[`item.service`]="{ item }">
          <BaseCollapseChips v-if="item" :chips="item.servers || []" single-line icon="mdi-directions-fork" />
        </template>
        <template #[`item.createAt`]="{ item }">
          {{ item.metadata.creationTimestamp ? $moment(item.metadata.creationTimestamp).format('lll') : '' }}
        </template>
        <template #[`item.action`]="{ item }">
          <v-flex :id="`r${item.metadata.resourceVersion}`" />
          <v-menu left :attach="`#r${item.metadata.resourceVersion}`">
            <template #activator="{ on }">
              <v-btn icon>
                <v-icon x-small color="primary" v-on="on"> fas fa-ellipsis-v </v-icon>
              </v-btn>
            </template>
            <v-card>
              <v-card-text class="pa-2">
                <v-flex>
                  <v-btn color="primary" text small @click.stop="updateGateway(item)"> 编辑 </v-btn>
                </v-flex>
                <v-flex>
                  <v-btn color="error" text small @click.stop="removeIstioGateway(item)"> 删除 </v-btn>
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
        @loaddata="istioGatewayList"
        @changesize="onPageSizeChange"
        @changepage="onPageIndexChange"
      />
    </v-card>

    <AddGateway ref="addGateway" @refresh="istioGatewayList" />
    <UpdateGateway ref="updateGateway" @refresh="istioGatewayList" />
  </v-container>
</template>

<script>
  import { mapState } from 'vuex';
  import { getIstioGatewayList, deleteIstioGateway } from '@/api';
  import EnvironmentFilter from '@/views/microservice/components/EnvironmentFilter';
  import AddGateway from './components/AddGateway';
  import UpdateGateway from './components/UpdateGateway';
  import BaseResource from '@/mixins/resource';
  import BasePermission from '@/mixins/permission';
  import BaseFilter from '@/mixins/base_filter';
  import BaseTable from '@/mixins/table';
  import { convertStrToNum } from '@/utils/helpers';

  export default {
    name: 'Gateway',
    components: {
      AddGateway,
      UpdateGateway,
      EnvironmentFilter,
    },
    mixins: [BaseFilter, BaseResource, BasePermission, BaseTable],
    data: () => ({
      items: [],
      pageCount: 0,
      params: {
        page: 1,
        size: 10,
      },
      filters: [{ text: '网关名称', value: 'search', items: [] }],
    }),
    computed: {
      ...mapState(['JWT', 'EnvironmentFilter']),
      headers() {
        const items = [
          { text: '网关名称', value: 'name', align: 'start' },
          {
            text: '命名空间',
            value: 'namespace',
            align: 'start',
            sortable: false,
          },
          { text: '匹配标签', value: 'selector', align: 'start' },
          { text: '服务', value: 'service', align: 'start' },
          { text: '创建时间', value: 'createAt', align: 'start', width: 180 },
        ];
        if (this.m_permisson_virtualSpaceAllow) {
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
      m_table_sortparam: {
        handler: function (newV, oldV) {
          if (oldV.name !== newV.name) return;
          if (oldV.desc === null) return;
          this.istioGatewayList(true);
        },
        deep: true,
      },
      '$store.state.EnvironmentFilter': {
        handler: function (env) {
          if (env) this.istioGatewayList();
        },
        deep: true,
        immediate: true,
      },
    },
    mounted() {
      if (this.JWT) {
        this.$nextTick(() => {
          Object.assign(this.params, convertStrToNum(this.$route.query));
        });
      }
    },
    methods: {
      async istioGatewayList(noprocess = false) {
        const data = await getIstioGatewayList(
          this.EnvironmentFilter.cluster,
          this.EnvironmentFilter.namespace,
          Object.assign(this.params, {
            noprocessing: noprocess,
            sort: this.m_table_generateResourceSortParamValue(),
          }),
        );
        this.items = data.List.map((s) => {
          return {
            ...s,
            servers: s.spec.servers
              ? s.spec.servers.map((server) => {
                  return `${server.port.number} | ${server.port.protocol}`;
                })
              : [],
          };
        });
        this.pageCount = Math.ceil(data.Total / this.params.size);
        this.params.page = data.CurrentPage;
        this.m_table_generateSelectResource();
      },
      addGateway() {
        this.$refs.addGateway.open();
      },
      updateGateway(item) {
        this.$refs.updateGateway.init(item);
        this.$refs.updateGateway.open();
      },
      removeIstioGateway(item) {
        this.$store.commit('SET_CONFIRM', {
          title: `删除网关`,
          content: {
            text: `删除网关 ${item.metadata.name}`,
            type: 'delete',
            name: item.metadata.name,
          },
          param: { item },
          doFunc: async (param) => {
            if (param.item.metadata.name.length > 0) {
              await deleteIstioGateway(
                this.$route.query.cluster,
                param.item.metadata.namespace,
                param.item.metadata.name,
              );
              this.istioGatewayList();
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
