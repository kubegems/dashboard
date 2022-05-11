<template>
  <v-container fluid>
    <BaseBreadcrumb />
    <v-card>
      <v-card-title class="py-2">
        <BaseFilter
          :filters="filters"
          :default="{ items: [], text: '项目名称', value: 'search' }"
          @refresh="m_filter_list"
        />
        <v-sheet
          v-if="AdminViewport"
          class="text-subtitle-2 ml-4"
        >
          租户
        </v-sheet>
        <v-sheet width="350">
          <v-autocomplete
            v-if="AdminViewport"
            v-model="tenant"
            color="primary"
            chips
            hide-selected
            hide-details
            label="租户"
            prepend-inner-icon="mdi-account-switch"
            dense
            solo
            flat
            full-width
            no-data-text="无数据"
            class="ml-2"
            :items="m_select_tenantItems"
            @focus="onTenantSelectFocus"
            @change="onTenantSelectChange"
          >
            <template #selection="{ attrs, item, selected }">
              <v-chip
                :input-value="selected"
                color="primary"
                label
                small
                v-bind="attrs"
              >
                <span class="pr-2">{{ item.text }}</span>
              </v-chip>
            </template>
          </v-autocomplete>
        </v-sheet>
        <v-spacer />
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
        <template #[`item.projectName`]="{ item }">
          <span v-if="AdminViewport">{{ item.ProjectName }}</span>
          <a
            v-else
            class="text-subtitle-2"
            @click="projectDetail(item)"
          >
            {{ item.ProjectName }}
          </a>
        </template>
        <template #[`item.createdAt`]="{ item }">
          {{ item.CreatedAt ? $moment(item.CreatedAt).format('lll') : '' }}
        </template>
        <template #[`item.environment`]="{ item }">
          {{ item.Environments.length }}
        </template>
        <template #[`item.tenant`]="{ item }">
          {{ item.Tenant.TenantName }}
        </template>
        <template #[`item.projectAlias`]="{ item }">
          {{ item.ProjectAlias }}
        </template>
        <template #[`item.cpu`]="{ item }">
          {{ item.Cpu ? item.Cpu : 0 }} core
        </template>
        <template #[`item.memory`]="{ item }">
          {{ item.Memory ? item.Memory : 0 }} Gi
        </template>
        <template #[`item.storage`]="{ item }">
          {{ item.Storage ? item.Storage : 0 }} Gi
        </template>
        <template #[`item.usedCpu`]="{ item }">
          {{ item.UsedCpu ? item.UsedCpu.toFixed(1) : 0 }} core
          <v-progress-linear
            class="rounded font-weight-medium"
            :value="item.CpuPercentage"
            height="15"
            :color="
              item.CpuPercentage
                ? item.CpuPercentage < 60
                  ? 'primary'
                  : item.CpuPercentage < 80
                    ? 'warning'
                    : 'red darken-1'
                : 'primary'
            "
          >
            <span class="white--text"> {{ item.CpuPercentage }}% </span>
          </v-progress-linear>
        </template>
        <template #[`item.usedMemory`]="{ item }">
          {{ item.UsedMemory ? item.UsedMemory.toFixed(1) : 0 }} Gi
          <v-progress-linear
            class="rounded font-weight-medium"
            :value="item.MemoryPercentage"
            height="15"
            :color="
              item.MemoryPercentage
                ? item.MemoryPercentage < 60
                  ? 'primary'
                  : item.MemoryPercentage < 80
                    ? 'warning'
                    : 'red darken-1'
                : 'primary'
            "
          >
            <span class="white--text"> {{ item.MemoryPercentage }}% </span>
          </v-progress-linear>
        </template>
        <template #[`item.usedStorage`]="{ item }">
          {{ item.UsedStorage ? item.UsedStorage.toFixed(1) : 0 }} Gi
          <v-progress-linear
            class="rounded font-weight-medium"
            :value="item.StoragePercentage"
            height="15"
            :color="
              item.StoragePercentage
                ? item.StoragePercentage < 60
                  ? 'primary'
                  : item.StoragePercentage < 80
                    ? 'warning'
                    : 'red darken-1'
                : 'primary'
            "
          >
            <span class="white--text"> {{ item.StoragePercentage }}% </span>
          </v-progress-linear>
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
                    @click="updateProject(item)"
                  >
                    编辑
                  </v-btn>
                </v-flex>
                <v-flex>
                  <v-btn
                    color="error"
                    text
                    small
                    @click="removeProject(item)"
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
        @loaddata="projectList"
        @changesize="onPageSizeChange"
        @changepage="onPageIndexChange"
      />
    </v-card>

    <UpdateProject
      ref="updateProject"
      @refresh="projectList"
    />
  </v-container>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
import { getProjectList, deleteProject, getTenantProjectQuotaList } from '@/api'
import UpdateProject from './components/UpdateProject'
import BaseSelect from '@/mixins/select'
import BaseResource from '@/mixins/resource'
import BaseFilter from '@/mixins/base_filter'
import BasePermission from '@/mixins/permission'
import BaseTable from '@/mixins/table'
import { sizeOfCpu, sizeOfStorage, convertStrToNum } from '@/utils/helpers'

export default {
  name: 'Project',
  components: {
    UpdateProject,
  },
  mixins: [BaseFilter, BaseSelect, BasePermission, BaseResource, BaseTable],
  data: () => ({
    items: [],
    tenant: -1,
    pageCount: 0,
    params: {
      page: 1,
      size: 10,
    },
    filters: [{ text: '项目名称', value: 'search', items: [] }],
  }),
  computed: {
    ...mapState(['Admin', 'AdminViewport', 'JWT', 'ProjectStore']),
    ...mapGetters(['Tenant']),
    headers() {
      const items = [
        { text: '名称', value: 'projectName', align: 'start' },
        { text: '别名', value: 'projectAlias', align: 'start' },
        { text: '环境空间', value: 'environment', align: 'start' },
        { text: 'CPU', value: 'cpu', align: 'start' },
        { text: '内存', value: 'memory', align: 'start' },
        { text: '存储', value: 'storage', align: 'start' },
        { text: '已使用CPU', value: 'usedCpu', align: 'start', width: 150 },
        { text: '已使用内存', value: 'usedMemory', align: 'start', width: 150 },
        {
          text: '已使用存储',
          value: 'usedStorage',
          align: 'start',
          width: 150,
        },
        { text: '创建时间', value: 'createdAt', align: 'start' },
      ]
      if (this.Admin && this.AdminViewport) {
        items.splice(1, 0, {
          text: '租户',
          value: 'tenant',
          align: 'start',
        })
      }
      if (this.m_permisson_tenantAllow) {
        items.push({ text: '', value: 'action', align: 'center', width: 20 })
      }
      return items
    },
  },
  async mounted() {
    if (this.JWT) {
      if (this.Tenant().ID > 0) {
        this.$nextTick(async () => {
          Object.assign(this.params, convertStrToNum(this.$route.query))
          await this.m_select_tenantSelectData()
          if (this.m_select_tenantItems.length > 0) {
            this.tenant = this.m_select_tenantItems[0].value
            this.projectList()
          }
        })
      } else {
        this.$store.commit('SET_SNACKBAR', {
          text: `请创建或加入租户`,
          color: 'warning',
        })
      }
    }
  },
  methods: {
    async projectList() {
      const data = await getProjectList(
        this.AdminViewport ? this.tenant : this.Tenant().ID,
        this.params,
      )
      this.items = data.List.map((item) => {
        return {
          name: item.TenantName,
          ...item,
        }
      })
      this.pageCount = Math.ceil(data.Total / this.params.size)
      this.params.page = data.CurrentPage
      this.$router.replace({ query: { ...this.$route.query, ...this.params } })
      this.projectQuotaList()
    },
    async projectQuotaList() {
      const data = await getTenantProjectQuotaList(
        this.AdminViewport ? this.tenant : this.Tenant().ID,
        { noprocessing: true },
      )
      if (data) {
        data.forEach((q) => {
          const index = this.items.findIndex((p) => {
            return p.ID === q.projectid
          })
          if (index > -1) {
            const item = this.items[index]
            item.Cpu = q.resourceStatus.quota.hard
              ? parseFloat(sizeOfCpu(q.resourceStatus.quota.hard['limits.cpu']))
              : 0
            item.Memory = q.resourceStatus.quota.hard
              ? parseFloat(
                  sizeOfStorage(q.resourceStatus.quota.hard['limits.memory']),
                )
              : 0
            item.Storage = q.resourceStatus.quota.hard
              ? parseFloat(
                  sizeOfStorage(
                    q.resourceStatus.quota.hard[`requests.storage`],
                  ),
                )
              : 0
            item.UsedCpu = q.resourceStatus.quota.used
              ? parseFloat(sizeOfCpu(q.resourceStatus.quota.used['limits.cpu']))
              : 0
            item.UsedMemory = q.resourceStatus.quota.used
              ? parseFloat(
                  sizeOfStorage(q.resourceStatus.quota.used['limits.memory']),
                )
              : 0
            item.UsedStorage = q.resourceStatus.quota.used
              ? parseFloat(
                  sizeOfStorage(
                    q.resourceStatus.quota.used[`requests.storage`],
                  ),
                )
              : 0
            item.CpuPercentage =
              item.Cpu > 0 ? ((item.UsedCpu / item.Cpu) * 100).toFixed(1) : 0
            item.MemoryPercentage =
              item.Memory > 0
                ? ((item.UsedMemory / item.Memory) * 100).toFixed(1)
                : 0
            item.StoragePercentage =
              item.Storage > 0
                ? ((item.UsedStorage / item.Storage) * 100).toFixed(1)
                : 0
            this.$set(this.items, index, item)
          }
        })
      }
    },
    onTenantSelectChange() {
      if (this.tenant) this.projectList()
      else {
        this.$store.commit('SET_SNACKBAR', {
          text: `请选择租户`,
          color: 'warning',
        })
      }
    },
    updateProject(item) {
      this.$refs.updateProject.init(item)
      this.$refs.updateProject.open()
    },
    async projectDetail(item) {
      this.$router.push({
        name: 'project-detail',
        params: {
          tenant: this.Tenant().TenantName,
          project: item.ProjectName,
        },
        query: { name: item.ProjectName },
      })
    },
    removeProject(item) {
      this.$store.commit('SET_CONFIRM', {
        title: `删除项目`,
        content: {
          text: `删除项目 ${item.ProjectName}`,
          type: 'delete',
          name: item.ProjectName,
        },
        param: { item },
        doFunc: async (param) => {
          await deleteProject(param.item.ID)
          this.$store.commit('CLEAR_RESOURCE')
          this.projectList()
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
    onTenantSelectFocus() {
      this.m_select_tenantSelectData()
    },
  },
}
</script>
