<template>
  <v-container fluid>
    <BaseViewportHeader />
    <BaseBreadcrumb />
    <v-card>
      <v-card-title class="py-4">
        <BaseFilter
          :default="{ items: [], text: '配置名称', value: 'search' }"
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
                <v-btn color="primary" text @click="addConfigMap">
                  <v-icon left>mdi-plus-box</v-icon>
                  创建配置
                </v-btn>
              </v-flex>
              <v-flex>
                <v-btn color="error" text @click="m_table_batchRemoveResource('配置', 'ConfigMap', configMapList)">
                  <v-icon left>mdi-minus-box</v-icon>
                  删除配置
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
          <a class="text-subtitle-2" @click="configMapDetail(item)">
            {{ item.metadata.name }}
          </a>
        </template>
        <template #[`item.namespace`]="{ item }">
          {{ item.metadata.namespace }}
        </template>
        <template #[`item.data`]="{ item }">
          <BaseCollapseChips
            v-if="item.data"
            :chips="Object.keys(item.data) || []"
            icon="mdi-brightness-7"
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
                  <v-btn color="primary" small text @click="updateConfigMap(item)"> 编辑 </v-btn>
                </v-flex>
                <v-flex>
                  <v-btn color="error" small text @click="removeConfigMap(item)"> 删除 </v-btn>
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
        @loaddata="configMapList"
      />
    </v-card>

    <AddConfigMap ref="addConfigMap" @refresh="configMapList" />
    <UpdateConfigMap ref="updateConfigMap" @refresh="configMapList" />
  </v-container>
</template>

<script>
  import { mapState } from 'vuex';

  import AddConfigMap from './components/AddConfigMap';
  import UpdateConfigMap from './components/UpdateConfigMap';
  import { getConfigMapList, deleteConfigMap } from '@/api';
  import BaseFilter from '@/mixins/base_filter';
  import BasePermission from '@/mixins/permission';
  import BaseResource from '@/mixins/resource';
  import BaseTable from '@/mixins/table';
  import NamespaceFilter from '@/views/resource/components/common/NamespaceFilter';

  export default {
    name: 'ConfigMap',
    components: {
      AddConfigMap,
      NamespaceFilter,
      UpdateConfigMap,
    },
    mixins: [BaseFilter, BasePermission, BaseResource, BaseTable],
    data: () => ({
      items: [],
      pageCount: 0,
      params: {
        page: 1,
        size: 10,
      },
      filters: [{ text: '配置名称', value: 'search', items: [] }],
    }),
    computed: {
      ...mapState(['JWT']),
      headers() {
        const items = [
          { text: '配置名', value: 'name', align: 'start' },
          {
            text: '配置项',
            value: 'data',
            align: 'start',
            width: 700,
            sortable: false,
          },
          { text: '创建时间', value: 'createAt', align: 'start', width: 180 },
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
            this.configMapList();
          }
        },
        deep: true,
      },
      m_table_sortparam: {
        handler: function (newV, oldV) {
          if (oldV.name !== newV.name) return;
          if (oldV.desc === null) return;
          this.configMapList(true);
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
          this.configMapList();
        });
      }
    },
    methods: {
      async configMapList(noprocess = false) {
        const data = await getConfigMapList(
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
        this.m_table_generateSelectResource();
      },
      addConfigMap() {
        this.$refs.addConfigMap.open();
      },
      updateConfigMap(item) {
        this.$refs.updateConfigMap.init(item);
        this.$refs.updateConfigMap.open();
      },
      configMapDetail(item) {
        this.$router.push({
          name: 'configmap-detail',
          params: Object.assign(this.$route.params, {
            name: item.metadata.name,
          }),
          query: {
            namespace: item.metadata.namespace,
          },
        });
      },
      removeConfigMap(item) {
        this.$store.commit('SET_CONFIRM', {
          title: `删除配置`,
          content: {
            text: `删除配置 ${item.metadata.name}`,
            type: 'delete',
            name: item.metadata.name,
          },
          param: { item },
          doFunc: async (param) => {
            if (param.item.metadata.name.length > 0) {
              await deleteConfigMap(this.ThisCluster, param.item.metadata.namespace, param.item.metadata.name);
              this.configMapList();
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
