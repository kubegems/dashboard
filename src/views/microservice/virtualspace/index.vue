<template>
  <v-container fluid>
    <BaseBreadcrumb :breadcrumb="breadcrumb" />
    <v-card>
      <v-card-title class="py-2">
        <BaseFilter
          :filters="filters"
          :default="{ items: [], text: '虚拟负载名称', value: 'search' }"
          @refresh="m_filter_list"
        />
        <v-spacer />
        <v-menu
          v-if="Admin"
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
                  @click="addVirtualSpace"
                >
                  <v-icon left>mdi-cloud-outline</v-icon>
                  创建虚拟空间
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
        <template #[`item.virtualSpaceName`]="{ item }">
          <a
            class="text-subtitle-2"
            @click="virtualSpaceDetail(item)"
          >
            {{ item.VirtualSpaceName }}
          </a>
        </template>
        <template #[`item.user`]="{ item }">
          {{ item.Users ? item.Users.length : 0 }}
        </template>
        <template #[`item.createdBy`]="{ item }">
          {{ item.CreatedBy }}
        </template>
        <template #[`item.env`]="{ item }">
          {{ item.Environments ? item.Environments.length : 0 }}
        </template>
        <template #[`item.isActive`]="{ item }">
          {{ item.IsActive ? '已激活' : '未激活' }}
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
                <v-flex v-if="item.IsActive">
                  <v-btn
                    color="error"
                    text
                    small
                    @click="setVirtualSpaceStatus(item, false)"
                  >
                    关闭
                  </v-btn>
                </v-flex>
                <v-flex v-else>
                  <v-btn
                    color="primary"
                    text
                    small
                    @click="setVirtualSpaceStatus(item, true)"
                  >
                    激活
                  </v-btn>
                </v-flex>
                <v-flex>
                  <v-btn
                    color="primary"
                    text
                    small
                    @click="updateVirtualSpace(item)"
                  >
                    编辑
                  </v-btn>
                </v-flex>
                <v-flex>
                  <v-btn
                    color="error"
                    text
                    small
                    @click="removeVirtualSpace(item)"
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
        @loaddata="virtualSpaceList"
        @changesize="onPageSizeChange"
        @changepage="onPageIndexChange"
      />
    </v-card>

    <AddVirtualSpace
      ref="addVirtualSpace"
      @refresh="virtualSpaceList"
    />
    <UpdateVirtualSpace
      ref="updateVirtualSpace"
      @refresh="virtualSpaceList"
    />
  </v-container>
</template>

<script>
import { mapState } from 'vuex'
import {
  getVirtualSpaceList,
  deleteVirtualSpace,
  patchSetVirtualSpaceStatus,
} from '@/api'
import AddVirtualSpace from './components/AddVirtualSpace'
import UpdateVirtualSpace from './components/UpdateVirtualSpace'
import BasePermission from '@/mixins/permission'
import BaseFilter from '@/mixins/base_filter'
import BaseResource from '@/mixins/resource'

export default {
  name: 'VirtualSpace',
  components: {
    AddVirtualSpace,
    UpdateVirtualSpace,
  },
  mixins: [BasePermission, BaseFilter, BaseResource],
  data: () => ({
    breadcrumb: {
      title: '虚拟空间',
      tip: '虚拟空间(virtualspace)是一组环境的聚合',
      icon: 'mdi-cloud-outline',
    },
    items: [],
    pageCount: 0,
    params: {
      page: 1,
      size: 10,
    },
    filters: [{ text: '虚拟空间名称', value: 'search', items: [] }],
  }),
  computed: {
    ...mapState(['JWT', 'Admin']),
    headers() {
      const items = [
        { text: '虚拟空间', value: 'virtualSpaceName', align: 'start' },
        { text: '状态', value: 'isActive', align: 'start' },
        { text: '环境', value: 'env', align: 'start' },
        { text: '成员', value: 'user', align: 'start' },
        { text: '创建时间', value: 'createdAt', align: 'start' },
        { text: '创建人', value: 'createdBy', align: 'start' },
      ]
      if (this.m_permisson_virtualSpaceAllow || this.m_permisson_tenantAllow) {
        items.push({ text: '', value: 'action', align: 'center', width: 20 })
      }
      return items
    },
  },
  watch: {
    m_resource_sortparam: {
      handler: function (newV, oldV) {
        if (oldV.name !== newV.name) return
        if (oldV.desc === null) return
        this.virtualSpaceList(true)
      },
      deep: true,
    },
  },
  mounted() {
    if (this.JWT) {
      this.$nextTick(() => {
        this.$store.commit('CLEAR_VIRTUAL_SPACE')
        this.m_resource_generateParams()
        this.virtualSpaceList()
      })
    }
  },
  methods: {
    async virtualSpaceList(noprocess = false) {
      const data = await getVirtualSpaceList(
        Object.assign(this.params, {
          noprocessing: noprocess,
        }),
      )
      this.items = data.List
      this.pageCount = Math.ceil(data.Total / this.params.size)
      this.params.page = data.CurrentPage
      this.$router.replace({ query: { ...this.$route.query, ...this.params } })
    },
    async virtualSpaceDetail(item) {
      this.$router.push({
        name: 'virtualspace-detail',
        params: { virtualspace: item.VirtualSpaceName },
        query: { name: item.VirtualSpaceName },
      })
    },
    addVirtualSpace() {
      this.$refs.addVirtualSpace.open()
    },
    updateVirtualSpace(item) {
      this.$refs.updateVirtualSpace.init(item)
      this.$refs.updateVirtualSpace.open()
    },
    removeVirtualSpace(item) {
      this.$store.commit('SET_CONFIRM', {
        title: `删除虚拟空间`,
        content: {
          text: `删除虚拟空间 ${item.VirtualSpaceName}`,
          type: 'delete',
          name: item.VirtualSpaceName,
        },
        param: { item },
        doFunc: async (param) => {
          if (param.item.VirtualSpaceName.length > 0) {
            await deleteVirtualSpace(param.item.ID)
            this.$store.commit('CLEAR_VIRTUAL_SPACE')
            this.virtualSpaceList()
          }
        },
      })
    },
    setVirtualSpaceStatus(item, open) {
      this.$store.commit('SET_CONFIRM', {
        title: `设置虚拟空间状态`,
        content: {
          text: open
            ? `激活虚拟空间 ${item.VirtualSpaceName}`
            : `关闭虚拟空间 ${item.VirtualSpaceName}`,
          type: 'confirm',
        },
        param: { item, open },
        doFunc: async (param) => {
          if (param.item.VirtualSpaceName.length > 0) {
            await patchSetVirtualSpaceStatus(param.item.ID, {
              enable: param.open,
            })
            this.virtualSpaceList()
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
