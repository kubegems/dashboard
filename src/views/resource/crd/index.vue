<template>
  <v-container fluid>
    <BaseViewportHeader />
    <BaseBreadcrumb />
    <v-card>
      <v-card-title class="py-4">
        <BaseFilter
          :filters="filters"
          :default="{ items: [], text: 'crd名称', value: 'search' }"
          @refresh="m_filter_list"
        />
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
                      'CRD',
                      'CustomResourceDefinition',
                      crdList,
                    )
                  "
                >
                  <v-icon left>mdi-minus-box</v-icon>
                  删除CRD
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
          <a
            class="text-subtitle-2"
            @click="crdDetail(item)"
          >
            {{ item.metadata.name }}
          </a>
        </template>
        <template #[`item.kind`]="{ item }">
          {{ item.spec.names.kind }}
        </template>
        <template #[`item.group`]="{ item }">
          {{ item.spec.group }}
        </template>
        <template #[`item.scope`]="{ item }">
          {{ item.spec.scope }}
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
                    color="error"
                    text
                    small
                    @click="removeCRD(item)"
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
        @loaddata="crdList"
        @changesize="onPageSizeChange"
        @changepage="onPageIndexChange"
      />
    </v-card>
  </v-container>
</template>

<script>
import { mapState } from 'vuex'
import { getCrdList, deleteCRD } from '@/api'
import BaseFilter from '@/mixins/base_filter'
import BaseResource from '@/mixins/resource'
import BasePermission from '@/mixins/permission'
import BaseTable from '@/mixins/table'
import { convertStrToNum } from '@/utils/helpers'

export default {
  name: 'CRD',
  components: {},
  mixins: [BaseFilter, BaseResource, BasePermission, BaseTable],
  data: () => ({
    items: [],
    pageCount: 0,
    params: {
      page: 1,
      size: 10,
    },
    filters: [{ text: 'crd名称', value: 'search', items: [] }],
  }),
  computed: {
    ...mapState(['JWT']),
    headers() {
      const items = [
        { text: '名称', value: 'name', align: 'start' },
        { text: 'Kind', value: 'kind', align: 'start', sortable: false },
        {
          text: 'Group',
          value: 'group',
          align: 'start',
          sortable: false,
        },
        { text: 'Scope', value: 'scope', align: 'start', sortable: false },
        { text: '创建时间', value: 'createAt', align: 'start', width: 180 },
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
      return items
    },
  },
  watch: {
    m_table_sortparam: {
      handler: function (newV, oldV) {
        if (oldV.name !== newV.name) return
        if (oldV.desc === null) return
        this.crdList(true)
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
        })
        return
      }
      this.$nextTick(() => {
        Object.assign(this.params, convertStrToNum(this.$route.query))
        this.crdList()
      })
    }
  },
  methods: {
    async crdList(noprocess = false) {
      const data = await getCrdList(
        this.ThisCluster,
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
    crdDetail(item) {
      this.$router.push({
        name: 'crd-detail',
        params: {
          name: item.metadata.name,
        },
      })
    },
    removeCRD(item) {
      this.$store.commit('SET_CONFIRM', {
        title: `删除CRD`,
        content: {
          text: `删除CRD ${item.metadata.name}`,
          type: 'delete',
          name: item.metadata.name,
        },
        param: { item },
        doFunc: async (param) => {
          if (param.item.metadata.name.length > 0) {
            await deleteCRD(this.ThisCluster, param.item.metadata.name)
            this.crdList()
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
