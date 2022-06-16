<template>
  <v-container fluid>
    <BaseMicroServiceHeader />
    <BaseBreadcrumb />
    <v-card>
      <v-card-title class="py-4">
        <BaseFilter
          :default="{ items: [], text: '边车名称', value: 'search' }"
          :filters="filters"
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
                <v-btn color="primary" text @click="addSidecar">
                  <v-icon left>mdi-plus-box</v-icon>
                  创建边车
                </v-btn>
              </v-flex>
              <v-flex>
                <v-btn color="error" text @click="m_table_batchRemoveResource('边车', 'Sidecar', istioSidecarList)">
                  <v-icon left>mdi-minus-box</v-icon>
                  删除边车
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
          <a class="text-subtitle-2">
            {{ item.metadata.name }}
          </a>
        </template>
        <template #[`item.namespace`]="{ item }">
          {{ item.metadata.namespace }}
        </template>
        <template #[`item.selector`]="{ item, index }">
          <BaseCollapseChips
            v-if="item && item.spec.workloadSelector"
            :id="`s_selector_${index}`"
            :chips="item.spec.workloadSelector.labels || {}"
            icon="mdi-label"
            single-line
          />
        </template>
        <template #[`item.ingress`]="{ item, index }">
          <BaseCollapseChips
            v-if="item"
            :id="`s_ingress_${index}`"
            :chips="item.ingressHost || []"
            icon="mdi-directions-fork"
            single-line
          />
        </template>
        <template #[`item.egress`]="{ item, index }">
          <BaseCollapseChips
            v-if="item"
            :id="`s_egress_${index}`"
            :chips="item.egressHost.hosts || []"
            icon="mdi-directions-fork"
            single-line
          />
        </template>
        <template #[`item.createAt`]="{ item }">
          {{ item.metadata.creationTimestamp ? $moment(item.metadata.creationTimestamp).format('lll') : '' }}
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
                  <v-btn color="primary" small text @click.stop="updateSidecar(item)"> 编辑 </v-btn>
                </v-flex>
                <v-flex>
                  <v-btn color="error" small text @click.stop="removeIstioSidecar(item)"> 删除 </v-btn>
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
        @loaddata="istioSidecarList"
      />
    </v-card>

    <AddSidecar ref="addSidecar" @refresh="istioSidecarList" />
    <UpdateSidecar ref="updateSidecar" @refresh="istioSidecarList" />
  </v-container>
</template>

<script>
  import { mapState } from 'vuex';

  import AddSidecar from './components/AddSidecar';
  import UpdateSidecar from './components/UpdateSidecar';
  import { getIstioSidecarList, deleteIstioSidecar } from '@/api';
  import BaseFilter from '@/mixins/base_filter';
  import BasePermission from '@/mixins/permission';
  import BaseResource from '@/mixins/resource';
  import BaseTable from '@/mixins/table';
  import { convertStrToNum } from '@/utils/helpers';
  import EnvironmentFilter from '@/views/microservice/components/EnvironmentFilter';

  export default {
    name: 'Sidecar',
    components: {
      AddSidecar,
      EnvironmentFilter,
      UpdateSidecar,
    },
    mixins: [BaseFilter, BasePermission, BaseResource, BaseTable],
    data: () => ({
      items: [],
      pageCount: 0,
      params: {
        page: 1,
        size: 10,
      },
      filters: [{ text: '边车名称', value: 'search', items: [] }],
    }),
    computed: {
      ...mapState(['JWT', 'EnvironmentFilter']),
      headers() {
        const items = [
          { text: '边车名称', value: 'name', align: 'start' },
          {
            text: '命名空间',
            value: 'namespace',
            align: 'start',
            sortable: false,
          },
          { text: '匹配标签', value: 'selector', align: 'start' },
          { text: 'Ingress', value: 'ingress', align: 'start' },
          { text: 'Egress', value: 'egress', align: 'start' },
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
          this.istioSidecarList(true);
        },
        deep: true,
      },
      '$store.state.EnvironmentFilter': {
        handler: function (env) {
          if (env) this.istioSidecarList();
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
      async istioSidecarList(noprocess = false) {
        const data = await getIstioSidecarList(
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
            egressHost: s.spec.egress
              ? s.spec.egress.reduce((a, b) => {
                  return a.hosts.concat(b.hosts);
                })
              : [],
            ingressHost: s.spec.ingress
              ? s.spec.ingress.map((ingress) => {
                  return `${ingress.port.number} | ${ingress.port.protocol}`;
                })
              : [],
          };
        });
        this.pageCount = Math.ceil(data.Total / this.params.size);
        this.params.page = data.CurrentPage;
        this.m_table_generateSelectResource();
      },
      addSidecar() {
        this.$refs.addSidecar.open();
      },
      updateSidecar(item) {
        this.$refs.updateSidecar.init(item);
        this.$refs.updateSidecar.open();
      },
      removeIstioSidecar(item) {
        this.$store.commit('SET_CONFIRM', {
          title: `删除边车`,
          content: {
            text: `删除边车 ${item.metadata.name}`,
            type: 'delete',
            name: item.metadata.name,
          },
          param: { item },
          doFunc: async (param) => {
            if (param.item.metadata.name.length > 0) {
              await deleteIstioSidecar(
                this.$route.query.cluster,
                param.item.metadata.namespace,
                param.item.metadata.name,
              );
              this.istioSidecarList();
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
