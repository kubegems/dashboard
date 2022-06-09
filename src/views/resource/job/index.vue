<template>
  <v-container fluid>
    <BaseViewportHeader />
    <BaseBreadcrumb />
    <v-card>
      <v-card-title class="py-4">
        <BaseFilter
          :filters="filters"
          :default="{ items: [], text: '任务名称', value: 'search' }"
          @refresh="m_filter_list"
        />
        <NamespaceFilter />
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
                  @click="addJob"
                >
                  <v-icon left>mdi-playlist-plus</v-icon>
                  创建任务
                </v-btn>
              </v-flex>
              <v-flex>
                <v-btn
                  text
                  color="error"
                  @click="m_table_batchRemoveResource('任务', 'Job', jobList)"
                >
                  <v-icon left>mdi-minus-box</v-icon>
                  批量删除
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
            @click="jobDetail(item)"
          >
            {{ item.metadata.name }}
          </a>
        </template>
        <template #[`item.namespace`]="{ item }">
          {{ item.metadata.namespace }}
        </template>
        <template #[`item.status`]="{ item }">
          <span v-if="item.status.succeeded !== undefined">
            <v-avatar
              style="background-color: #1e88e5;"
              class="mr-2"
              size="10"
            >
              <span class="white--text text-h5" />
            </v-avatar>
            Succeeded
          </span>
          <span v-else-if="item.status.failed !== undefined">
            <v-avatar
              style="background-color: #ff5252;"
              class="mr-2"
              size="10"
            >
              <span class="white--text text-h5" />
            </v-avatar>
            Failed
          </span>
          <span v-else-if="item.status.active !== undefined">
            <v-avatar
              style="background-color: #00bcd4;"
              class="mr-2"
              size="10"
            >
              <span class="white--text text-h5" />
            </v-avatar>
            Active
          </span>
        </template>
        <template #[`item.startAt`]="{ item }">
          {{
            item.status.startTime
              ? $moment(item.status.startTime).format('lll')
              : ''
          }}
        </template>
        <template #[`item.endAt`]="{ item }">
          {{
            item.status.completionTime
              ? $moment(item.status.completionTime).format('lll')
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
                    @click="updateJob(item)"
                  >
                    编辑
                  </v-btn>
                </v-flex>
                <v-flex>
                  <v-btn
                    color="error"
                    text
                    small
                    @click="removeJob(item)"
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
        @loaddata="jobList"
        @changesize="onPageSizeChange"
        @changepage="onPageIndexChange"
      />
    </v-card>

    <AddJob
      ref="addJob"
      @refresh="jobList"
    />
    <UpdateJob
      ref="updateJob"
      @refresh="jobList"
    />
  </v-container>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
import { getJobList, deleteJob } from '@/api'
import NamespaceFilter from '@/views/resource/components/common/NamespaceFilter'
import AddJob from './components/AddJob'
import UpdateJob from './components/UpdateJob'
import BaseFilter from '@/mixins/base_filter'
import BaseResource from '@/mixins/resource'
import BasePermission from '@/mixins/permission'
import BaseTable from '@/mixins/table'

export default {
  name: 'Job',
  components: {
    AddJob,
    UpdateJob,
    NamespaceFilter,
  },
  mixins: [BaseFilter, BaseResource, BasePermission, BaseTable],
  data: () => ({
    items: [],
    pageCount: 0,
    params: {
      page: 1,
      size: 10,
    },
    filters: [{ text: '任务名称', value: 'search', items: [] }],
  }),
  computed: {
    ...mapState(['JWT', 'AdminViewport', 'MessageStreamWS']),
    ...mapGetters(['Environment']),
    headers() {
      const items = [
        { text: '任务', value: 'name', align: 'start' },
        { text: '状态', value: 'status', align: 'start', sortable: false },
        { text: '开始时间', value: 'startAt', align: 'start', sortable: false },
        { text: '结束时间', value: 'endAt', align: 'start', sortable: false },
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
          this.jobList()
        }
      },
      deep: true,
    },
    '$store.state.MessageStream': {
      handler: function (updatingJob) {
        if (!updatingJob) return
        const job = JSON.parse(updatingJob)
        if (job.MessageType !== 'objectChanged') return
        if (job.EventKind === 'delete') {
          this.m_table_generateParams()
          this.jobList(true)
          return
        }
        if (
          job.EventKind === 'add' &&
          this.params.page === 1 &&
          job.InvolvedObject.Kind === 'Job'
        ) {
          if (
            this.AdminViewport ||
            job.InvolvedObject.NamespacedName.indexOf(
              this.Environment().Namespace,
            ) === 0
          ) {
            this.m_table_generateParams()
            this.jobList(true)
            return
          }
        }
        const index = this.items.findIndex((j) => {
          return (
            job.Content.metadata &&
            j.metadata.name === job.Content.metadata.name &&
            j.metadata.namespace === job.Content.metadata.namespace
          )
        })
        if (index > -1) {
          this.$set(this.items, index, job.Content)
        }
      },
      deep: true,
      immediate: true,
    },
    m_table_sortparam: {
      handler: function (newV, oldV) {
        if (oldV.name !== newV.name) return
        if (oldV.desc === null) return
        this.jobList(true)
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
        this.jobList()
      })
    }
  },
  methods: {
    async jobList(noprocess = false) {
      const data = await getJobList(
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
      this.watchJobList()
      this.m_table_generateSelectResource()
    },
    watchJobList() {
      const sub = {
        kind: 'objectChanged',
        content: {},
      }
      const watchJobList = []
      this.items.forEach((job) => {
        watchJobList.push(`${job.metadata.namespace}/${job.metadata.name}`)
      })
      sub.content[this.ThisCluster] = { Job: watchJobList }
      if (this.MessageStreamWS && this.MessageStreamWS.readyState === 1) {
        this.MessageStreamWS.send(JSON.stringify(sub))
      }
    },
    jobDetail(item) {
      this.$router.push({
        name: 'job-detail',
        params: Object.assign(this.$route.params, {
          name: item.metadata.name,
        }),
        query: {
          namespace: item.metadata.namespace,
        },
      })
    },
    addJob() {
      this.$refs.addJob.open()
    },
    updateJob(item) {
      this.$refs.updateJob.init(item)
      this.$refs.updateJob.open()
    },
    removeJob(item) {
      this.$store.commit('SET_CONFIRM', {
        title: `删除任务`,
        content: {
          text: `删除任务 ${item.metadata.name}`,
          type: 'delete',
          name: item.metadata.name,
        },
        param: { item },
        doFunc: async (param) => {
          if (param.item.metadata.name.length > 0) {
            await deleteJob(
              this.ThisCluster,
              param.item.metadata.namespace,
              param.item.metadata.name,
            )
            this.jobList()
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
