<template>
  <v-container fluid>
    <BaseViewportHeader
      v-if="!AdminViewport"
      :environmented="Environment().ID > 0"
    />
    <BaseBreadcrumb />
    <v-card>
      <v-card-title class="py-4">
        <BaseFilter
          :filters="filters"
          :default="{ items: [], text: '应用编排名称', value: 'search' }"
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
                  color="primary"
                  @click="addApp"
                >
                  <v-icon left>mdi-plus-box</v-icon>
                  创建应用
                </v-btn>
              </v-flex>
            </v-card-text>
          </v-card>
        </v-menu>
      </v-card-title>
      <v-card-text>
        <v-data-table
          disable-sort
          :headers="headers"
          :items="items"
          :page.sync="params.page"
          :items-per-page="params.size"
          no-data-text="暂无数据"
          hide-default-footer
        >
          <template #[`item.name`]="{ item }">
            <a
              class="text-subtitle-2"
              @click="appDetail(item)"
            >
              {{ item.name }}
            </a>
          </template>
          <template #[`item.createAt`]="{ item }">
            {{ item.createAt ? $moment(item.createAt).format('lll') : '' }}
          </template>
          <template #[`item.Project`]="{ item }">
            {{ item.Project.ProjectName }}
          </template>
          <template #[`item.images`]="{ item }">
            <v-flex
              v-for="(image, index) in item.images"
              :key="index"
            >
              {{ image }}
            </v-flex>
          </template>
          <template #[`item.kind`]="{ item }">
            {{ item.kind === '' ? '未知' : item.kind }}
          </template>
          <template #[`item.labels`]="{ item }">
            <v-chip
              v-for="(value, key) in item.labels"
              :key="key"
              x-small
              class="ma-1"
              color="success"
              text-color="white"
            >
              <strong class="mx-1"> {{ key }} </strong>
              {{ value }}
            </v-chip>
          </template>
          <template #[`item.creator`]="{ item }">
            {{ item.creator }}
          </template>
          <template #[`item.action`]="{ item }">
            <v-flex :id="`r${item.name}`" />
            <v-menu
              left
              :attach="`#r${item.name}`"
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
                      @click="updateApp(item)"
                    >
                      编辑
                    </v-btn>
                  </v-flex>
                  <v-flex>
                    <v-btn
                      color="error"
                      text
                      small
                      @click="removeApp(item)"
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
          @loaddata="appManifestList"
          @changesize="onPageSizeChange"
          @changepage="onPageIndexChange"
        />
      </v-card-text>
    </v-card>

    <AddApp
      ref="addApp"
      @refresh="appManifestList"
    />
    <UpdateApp
      ref="updateApp"
      @refresh="appManifestList"
    />
  </v-container>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
import { getAllManifest, getManifestList, deleteManifest } from '@/api'
import AddApp from './components/AddApp'
import BaseResource from '@/mixins/resource'
import UpdateApp from './components/UpdateApp'
import BasePermission from '@/mixins/permission'
import BaseFilter from '@/mixins/base_filter'
import { convertStrToNum } from '@/utils/helpers'

export default {
  name: 'AppManifest',
  components: {
    AddApp,
    UpdateApp,
  },
  mixins: [BaseFilter, BaseResource, BasePermission],
  data: () => ({
    items: [],
    pageCount: 0,
    params: {
      page: 1,
      size: 10,
    },
    filters: [{ text: '应用编排名称', value: 'search', items: [] }],
  }),
  computed: {
    ...mapState(['JWT', 'Admin', 'AdminViewport']),
    ...mapGetters(['Project', 'Tenant']),
    headers() {
      const items = [
        { text: '应用名称', value: 'name', align: 'start' },
        { text: '标签', value: 'labels', align: 'start' },
        { text: '应用类型', value: 'kind', align: 'start' },
        { text: '镜像', value: 'images', align: 'start' },
        { text: '创建人', value: 'creator', align: 'start' },
        { text: '创建时间', value: 'createAt', align: 'start' },
      ]
      if (this.Admin && this.AdminViewport) {
        items.splice(1, 0, {
          text: '项目',
          value: 'project',
          align: 'start',
        })
      }
      if (this.m_permisson_resourceAllow || this.AdminViewport) {
        items.push({ text: '', value: 'action', align: 'center', width: 20 })
      }
      return items
    },
  },
  mounted() {
    if (this.JWT) {
      this.$nextTick(() => {
        if (!this.AdminViewport && this.Project().ID === 0) {
          return
        }
        Object.assign(this.params, convertStrToNum(this.$route.query))
        this.appManifestList()
      })
    }
  },
  methods: {
    async appManifestList() {
      let data = {}
      if (this.Admin && this.AdminViewport) {
        data = await getAllManifest(this.params)
      } else {
        data = await getManifestList(
          this.Tenant().ID,
          this.Project().ID,
          Object.assign(
            { environment_id: this.ThisAppEnvironmentID },
            this.params,
          ),
        )
      }
      this.items = data.List
      this.pageCount = Math.ceil(data.Total / this.params.size)
      this.params.page = data.CurrentPage
      this.$router.replace({ query: { ...this.$route.query, ...this.params } })
    },
    updateApp(item) {
      this.$refs.updateApp.init(
        Object.assign(item, {
          TenantID: this.Tenant().ID,
          ProjectID: this.Project().ID,
          environment_id: this.ThisAppEnvironmentID,
        }),
      )
      this.$refs.updateApp.open()
    },
    appDetail(item) {
      this.$router.push({
        name: 'appmanifest-detail',
        params: { name: item.name },
        query: {
          projectid: this.Project().ID,
          tenantid: this.Tenant().ID,
        },
      })
    },
    removeApp(item) {
      this.$store.commit('SET_CONFIRM', {
        title: `删除应用编排`,
        content: {
          text: `删除应用编排 ${item.name}`,
          type: 'delete',
          name: item.name,
        },
        param: { item },
        doFunc: async (param) => {
          await deleteManifest(
            this.Tenant().ID,
            this.Project().ID,
            param.item.name,
          )
          this.appManifestList()
        },
      })
    },
    addApp() {
      this.$refs.addApp.open()
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
