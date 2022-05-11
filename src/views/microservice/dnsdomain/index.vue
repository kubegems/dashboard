<template>
  <v-container fluid>
    <BaseBreadcrumb />
    <v-card>
      <v-card-title class="py-2">
        <BaseFilter
          :filters="filters"
          :default="{ items: [], text: 'DNS', value: 'search' }"
          @refresh="m_filter_list"
        />
        <v-spacer />
        <v-menu
          v-if="m_permisson_tenantAllow || m_permisson_virtualSpaceAllow"
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
                  @click="addDNSDomain"
                >
                  <v-icon left>mdi-plus-box</v-icon>
                  创建DNS
                </v-btn>
              </v-flex>
            </v-card-text>
          </v-card>
        </v-menu>
      </v-card-title>
      <v-data-table
        class="mx-4"
        disable-sort
        :headers="headers"
        :items="items"
        :page.sync="params.page"
        :items-per-page="params.size"
        no-data-text="暂无数据"
        hide-default-footer
      >
        <template #[`item.virtualDomainName`]="{ item }">
          {{ item.VirtualDomainName }}
        </template>
        <template #[`item.createdBy`]="{ item }">
          {{ item.CreatedBy }}
        </template>
        <template #[`item.createdAt`]="{ item }">
          {{ item.CreatedAt ? $moment(item.CreatedAt).format('lll') : '' }}
        </template>
        <template #[`item.action`]="{ item }">
          <v-flex :id="`r${item.ID}`" />
          <v-menu
            left
            :attach="`#r${item.ID}`"
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
                    @click="updateDNSDomain(item)"
                  >
                    编辑
                  </v-btn>
                </v-flex>
                <v-flex>
                  <v-btn
                    color="error"
                    text
                    small
                    @click="removeDNSDomain(item)"
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
        @loaddata="dnsDomainList"
        @changesize="onPageSizeChange"
        @changepage="onPageIndexChange"
      />
    </v-card>

    <AddDNSDomain
      ref="addDNSDomain"
      @refresh="dnsDomainList"
    />
    <UpdateDNSDomain
      ref="updateDNSDomain"
      @refresh="dnsDomainList"
    />
  </v-container>
</template>

<script>
import { mapState } from 'vuex'
import { getDnsDomainList, deleteDNSDomain } from '@/api'
import AddDNSDomain from './components/AddDNSDomain'
import UpdateDNSDomain from './components/UpdateDNSDomain'
import BasePermission from '@/mixins/permission'
import BaseFilter from '@/mixins/base_filter'
import BaseResource from '@/mixins/resource'
import BaseTable from '@/mixins/table'

export default {
  name: 'DNSDomain',
  components: {
    AddDNSDomain,
    UpdateDNSDomain,
  },
  mixins: [BasePermission, BaseFilter, BaseResource, BaseTable],
  data: () => ({
    items: [],
    pageCount: 0,
    params: {
      page: 1,
      size: 10,
    },
    filters: [{ text: 'DNS', value: 'search', items: [] }],
  }),
  computed: {
    ...mapState(['JWT']),
    headers() {
      const items = [
        { text: 'DNS', value: 'virtualDomainName', align: 'start' },
        { text: '创建时间', value: 'createdAt', align: 'start' },
        { text: '创建人', value: 'createdBy', align: 'start' },
      ]
      if (this.m_permisson_virtualSpaceAllow || this.m_permisson_tenantAllow) {
        items.push({ text: '', value: 'action', align: 'center', width: 20 })
      }
      return items
    },
  },
  mounted() {
    if (this.JWT) {
      this.$nextTick(() => {
        this.m_table_generateParams()
        this.dnsDomainList()
      })
    }
  },
  methods: {
    async dnsDomainList(noprocess = false) {
      const data = await getDnsDomainList(
        Object.assign(this.params, {
          noprocessing: noprocess,
        }),
      )
      this.items = data.List
      this.pageCount = Math.ceil(data.Total / this.params.size)
      this.params.page = data.CurrentPage
      this.$router.replace({ query: { ...this.$route.query, ...this.params } })
    },
    addDNSDomain() {
      this.$refs.addDNSDomain.open()
    },
    updateDNSDomain(item) {
      this.$refs.updateDNSDomain.init(item)
      this.$refs.updateDNSDomain.open()
    },
    removeDNSDomain(item) {
      this.$store.commit('SET_CONFIRM', {
        title: `删除DNS`,
        content: {
          text: `删除DNS ${item.VirtualDomainName}`,
          type: 'delete',
          name: item.VirtualDomainName,
        },
        param: { item },
        doFunc: async (param) => {
          if (param.item.VirtualDomainName.length > 0) {
            await deleteDNSDomain(param.item.ID)
            this.dnsDomainList()
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
