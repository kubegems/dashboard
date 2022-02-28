<template>
  <v-container fluid>
    <BaseMicroServiceHeader />
    <BaseBreadcrumb :breadcrumb="breadcrumb" />
    <v-card>
      <v-card-title class="py-2">
        <BaseFilter
          :filters="filters"
          :default="{ items: [], text: '配置名称', value: 'search' }"
          @refresh="filterList"
        />
        <EnvironmentFilter />
        <v-spacer />
        <v-menu
          v-if="virtualSpaceAllow"
          left
        >
          <template #activator="{ on }">
            <v-btn icon>
              <v-icon
                small
                color="primary"
                v-on="on"
              >
                fas fa-ellipsis-v
              </v-icon>
            </v-btn>
          </template>
          <v-card>
            <v-card-text class="pa-2">
              <v-flex>
                <v-btn
                  text
                  color="primary"
                  @click="addConfigMap"
                >
                  <v-icon left>mdi-plus-box</v-icon>
                  创建配置
                </v-btn>
              </v-flex>
              <v-flex>
                <v-btn
                  text
                  color="error"
                  @click="
                    batchRemoveResource('配置', 'ConfigMap', configMapList)
                  "
                >
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
        :items="items"
        :page.sync="params.page"
        :items-per-page="params.size"
        no-data-text="暂无数据"
        hide-default-footer
        show-select
        @update:sort-by="sortBy"
        @update:sort-desc="sortDesc"
        @toggle-select-all="onResourceToggleSelect"
      >
        <template #[`item.data-table-select`]="{ item, index }">
          <v-checkbox
            v-model="
              batchResources[`${item.metadata.name}-${index}`].checked
            "
            color="primary"
            hide-details
            @click.stop
            @change="onResourceChange($event, item, index)"
          />
        </template>
        <template #[`item.name`]="{ item }">
          <a
            class="text-subtitle-2"
            @click="configMapDetail(item)"
          >
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
            single-line
            icon="mdi-brightness-7"
          />
        </template>
        <template #[`item.createAt`]="{ item }">
          {{
            item.metadata.creationTimestamp
              ? $moment(item.metadata.creationTimestamp).format('lll')
              : ''
          }}
        </template>
        <template #[`item.action`]="{ item }">
          <v-flex :id="`r${item.metadata.resourceVersion}`" />
          <v-menu
            left
            :attach="`#r${item.metadata.resourceVersion}`"
          >
            <template #activator="{ on }">
              <v-btn icon>
                <v-icon
                  x-small
                  color="primary"
                  v-on="on"
                >
                  fas fa-ellipsis-v
                </v-icon>
              </v-btn>
            </template>
            <v-card>
              <v-card-text class="pa-2">
                <v-flex>
                  <v-btn
                    color="primary"
                    text
                    small
                    @click.stop="updateConfigMap(item)"
                  >
                    编辑
                  </v-btn>
                </v-flex>
                <v-flex>
                  <v-btn
                    color="error"
                    text
                    small
                    @click.stop="removeConfigMap(item)"
                  >
                    删除
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
        @loaddata="configMapList"
        @changesize="onPageSizeChange"
        @changepage="onPageIndexChange"
      />
    </v-card>

    <AddConfigMap
      ref="addConfigMap"
      @refresh="configMapList"
    />
    <UpdateConfigMap
      ref="updateConfigMap"
      @refresh="configMapList"
    />
  </v-container>
</template>

<script>
import { mapState } from 'vuex'
import { getConfigMapList, deleteConfigMap } from '@/api'
import AddConfigMap from '@/views/resource/configmap/components/AddConfigMap'
import UpdateConfigMap from '@/views/resource/configmap/components/UpdateConfigMap'
import EnvironmentFilter from '@/views/microservice/components/EnvironmentFilter'
import BaseResource from '@/mixins/resource'
import BaseFilter from '@/mixins/base_filter'
import BasePermission from '@/mixins/permission'
import { convertStrToNum } from '@/utils/helpers'

export default {
  name: 'ConfigMap',
  components: {
    AddConfigMap,
    UpdateConfigMap,
    EnvironmentFilter,
  },
  mixins: [BaseFilter, BaseResource, BasePermission],
  data: () => ({
    breadcrumb: {
      title: '配置',
      tip: '配置集 (ConfigMap) 常用于存储工作负载所需的配置信息，许多应用程序会从配置文件、命令行参数或环境变量中读取配置信息。',
      icon: 'mdi-wrench',
    },
    items: [],
    pageCount: 0,
    params: {
      page: 1,
      size: 10,
    },
    filters: [{ text: '配置名称', value: 'search', items: [] }],
  }),
  computed: {
    ...mapState(['JWT', 'EnvironmentFilter']),
    headers() {
      const items = [
        { text: '配置名称', value: 'name', align: 'start' },
        {
          text: '命名空间',
          value: 'namespace',
          align: 'start',
          sortable: false,
        },
        {
          text: '配置项',
          value: 'data',
          align: 'start',
          width: 700,
          sortable: false,
        },
        { text: '创建时间', value: 'createAt', align: 'start', width: 180 },
      ]
      if (this.virtualSpaceAllow) {
        items.push({
          text: '',
          value: 'action',
          align: 'center',
          width: 20,
          sortable: false,
        })
      }
      return items
    },
  },
  watch: {
    sortparam: {
      handler: function (newV, oldV) {
        if (oldV.name !== newV.name) return
        if (oldV.desc === null) return
        this.configMapList(true)
      },
      deep: true,
    },
    '$store.state.EnvironmentFilter': {
      handler: function (env) {
        if (env) this.configMapList()
      },
      deep: true,
      immediate: true,
    },
  },
  mounted() {
    if (this.JWT) {
      this.$nextTick(() => {
        Object.assign(this.params, convertStrToNum(this.$route.query))
      })
    }
  },
  methods: {
    async configMapList(noprocess = false) {
      const data = await getConfigMapList(
        this.EnvironmentFilter.cluster,
        this.EnvironmentFilter.namespace,
        Object.assign(this.params, {
          noprocessing: noprocess,
          sort: this.generateResourceSortParamValue(),
        }),
      )
      this.items = data.List
      this.pageCount = Math.ceil(data.Total / this.params.size)
      this.params.page = data.CurrentPage
      this.generateSelectResource()
    },
    addConfigMap() {
      this.$refs.addConfigMap.open()
    },
    updateConfigMap(item) {
      this.$refs.updateConfigMap.init(item)
      this.$refs.updateConfigMap.open()
    },
    configMapDetail(item) {
      this.$router.push({
        name: 'microconfigmap-detail',
        params: {
          name: item.metadata.name,
        },
        query: {
          namespace: item.metadata.namespace,
          cluster: this.$route.query.cluster,
        },
      })
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
            await deleteConfigMap(
              this.$route.query.cluster,
              param.item.metadata.namespace,
              param.item.metadata.name,
            )
            this.configMapList()
          }
        },
      })
    },
    onPageSizeChange(size) {
      this.params.page = 1
      this.params.size = size
    },
    onPageIndexChange(page) {
      this.params.page = page
    },
  },
}
</script>
