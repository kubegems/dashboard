<template>
  <v-container fluid>
    <BaseViewportHeader />
    <BaseBreadcrumb />
    <v-card>
      <v-card-title class="py-2">
        <BaseFilter
          :filters="filters"
          :default="{ items: [], text: '快照名称', value: 'search' }"
          @refresh="m_filter_list"
        />
        <NamespaceFilter />
        <v-spacer />
        <v-spacer />
        <v-menu
          v-if="m_permisson_resourceAllow"
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
                  color="error"
                  @click="
                    m_table_batchRemoveResource(
                      '卷快照',
                      'VolumeSnapshot',
                      volumeSpanshotList,
                    )
                  "
                >
                  <v-icon left>mdi-minus-box</v-icon>
                  删除卷快照
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
            v-model="
              m_table_batchResources[`${item.metadata.name}-${index}`].checked
            "
            color="primary"
            hide-details
            @click.stop
            @change="m_table_onResourceChange($event, item, index)"
          />
        </template>
        <template #[`item.name`]="{ item }">
          {{ item.metadata.name }}
        </template>
        <template #[`item.namespace`]="{ item }">
          {{ item.metadata.namespace }}
        </template>
        <template #[`item.pvc`]="{ item }">
          {{ item.spec.source.persistentVolumeClaimName }}
        </template>
        <template #[`item.snapshotClass`]="{ item }">
          {{ item.spec.volumeSnapshotClassName }}
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
              <v-card-text class="pa-2 text-center">
                <v-flex>
                  <v-btn
                    color="primary"
                    text
                    small
                    @click="restoreVolumeSnapshot(item)"
                  >
                    快照恢复
                  </v-btn>
                </v-flex>
                <v-flex>
                  <v-btn
                    color="error"
                    text
                    small
                    @click="removeVolumeSpanshot(item)"
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
        @loaddata="volumeSpanshotList"
        @changesize="onPageSizeChange"
        @changepage="onPageIndexChange"
      />
    </v-card>

    <RestoreVolumeSnapshot ref="restoreVolumeSnapshot" />
  </v-container>
</template>

<script>
import { mapState } from 'vuex'
import { getVolumeSnapshotList, deleteVolumeSnapshot } from '@/api'
import NamespaceFilter from '@/views/resource/components/common/NamespaceFilter'
import RestoreVolumeSnapshot from './components/RestoreVolumeSnapshot'
import BaseFilter from '@/mixins/base_filter'
import BaseResource from '@/mixins/resource'
import BasePermission from '@/mixins/permission'
import BaseTable from '@/mixins/table'

export default {
  name: 'VolumeSnapshot',
  components: {
    NamespaceFilter,
    RestoreVolumeSnapshot,
  },
  mixins: [BaseFilter, BaseResource, BasePermission, BaseTable],
  data: () => ({
    items: [],
    pageCount: 0,
    params: {
      page: 1,
      size: 10,
    },
    filters: [{ text: '快照名称', value: 'search', items: [] }],
  }),
  computed: {
    ...mapState(['JWT', 'AdminViewport']),
    headers() {
      const items = [
        { text: '快照名', value: 'name', align: 'start' },
        { text: '源存储卷', value: 'pvc', align: 'start', sortable: false },
        {
          text: '快照类',
          value: 'snapshotClass',
          align: 'start',
          sortable: false,
        },
        { text: '创建时间', value: 'createAt', align: 'center' },
      ]
      if (this.m_permisson_resourceAllow) {
        items.push({
          text: '',
          value: 'action',
          align: 'center',
          width: 20,
          sortable: false,
        })
      }
      if (this.AdminViewport) {
        items.splice(1, 0, {
          text: '命名空间',
          value: 'namespace',
          align: 'start',
          sortable: false,
        })
      }
      return items
    },
  },
  watch: {
    '$store.state.NamespaceFilter': {
      handler: function (namespace) {
        if (namespace && !namespace.Mounted) {
          this.params.page = 1
          this.params.namespace = namespace.Namespace
          this.volumeSpanshotList()
        }
      },
      deep: true,
    },
    m_table_sortparam: {
      handler: function (newV, oldV) {
        if (oldV.name !== newV.name) return
        if (oldV.desc === null) return
        this.volumeSpanshotList(true)
      },
      deep: true,
    },
  },
  mounted() {
    if (this.JWT) {
      this.$nextTick(() => {
        if (this.ThisCluster === '') {
          this.$store.commit('SET_SNACKBAR', {
            text: `请创建或选择集群`,
            color: 'warning',
          })
          return
        }
        this.m_table_generateParams()
        this.volumeSpanshotList()
      })
    }
  },
  methods: {
    async volumeSpanshotList(noprocess = false) {
      const data = await getVolumeSnapshotList(
        this.ThisCluster,
        this.ThisNamespace,
        Object.assign(this.params, {
          noprocessing: noprocess,
          sort: this.m_table_generateResourceSortParamValue(),
        }),
      )
      this.items = data.List
      this.pageCount = Math.ceil(data.Total / this.params.size)
      this.params.page = data.CurrentPage
      this.$router.replace({ query: { ...this.$route.query, ...this.params } })
      this.m_table_generateSelectResource()
    },
    removeVolumeSpanshot(item) {
      this.$store.commit('SET_CONFIRM', {
        title: `删除卷快照`,
        content: {
          text: `删除卷快照 ${item.metadata.name}`,
          type: 'delete',
          name: item.metadata.name,
        },
        param: { item },
        doFunc: async (param) => {
          if (param.item.metadata.name.length > 0) {
            await deleteVolumeSnapshot(
              this.ThisCluster,
              param.item.metadata.namespace,
              param.item.metadata.name,
            )
            this.volumeSpanshotList()
          }
        },
      })
    },
    restoreVolumeSnapshot(item) {
      this.$refs.restoreVolumeSnapshot.init(item)
      this.$refs.restoreVolumeSnapshot.open()
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
