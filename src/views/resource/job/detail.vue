<template>
  <v-container fluid>
    <BaseViewportHeader :selectable="false" />
    <BaseBreadcrumb>
      <template #extend>
        <v-flex class="kubegems__full-right">
          <v-btn
            text
            small
            class="primary--text"
            @click="resourceYaml"
          >
            <v-icon
              left
              small
            >
              fas fa-code
            </v-icon>
            Yaml
          </v-btn>
          <v-menu
            v-if="m_permisson_resourceAllow"
            left
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
                    @click="updateJob"
                  >
                    编辑
                  </v-btn>
                </v-flex>
                <v-flex>
                  <v-btn
                    color="error"
                    text
                    small
                    @click="removeJob"
                  >
                    删除
                  </v-btn>
                </v-flex>
              </v-card-text>
            </v-card>
          </v-menu>
        </v-flex>
      </template>
    </BaseBreadcrumb>
    <v-row class="mt-0">
      <v-col
        cols="2"
        class="pt-0"
      >
        <BasicResourceInfo :item="job" />
      </v-col>
      <v-col
        cols="10"
        class="pt-0"
      >
        <v-card flat>
          <v-card-text class="pa-0">
            <v-tabs
              v-model="tab"
              height="40"
              class="rounded-t pl-2 pt-2"
            >
              <v-tab
                v-for="item in tabItems"
                :key="item.value"
              >
                {{ item.text }}
              </v-tab>
            </v-tabs>

            <component
              :is="tabItems[tab].value"
              :ref="tabItems[tab].value"
              :item="job"
              :selector="{
                topkind: 'Job',
                topname: job ? job.metadata.name : '',
              }"
            />
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <ResourceYaml
      ref="resourceYaml"
      :item="job"
    />
    <UpdateJob
      ref="updateJob"
      @refresh="jobDetail"
    />
  </v-container>
</template>

<script>
import { mapState } from 'vuex'
import { getJobDetail, deleteJob } from '@/api'
import ResourceInfo from './components/ResourceInfo'
import EventList from '@/views/resource/components/common/EventList'
import Metadata from '@/views/resource/components/metadata/Metadata'
import PodList from '@/views/resource/components/common/PodList'
import ResourceYaml from '@/views/resource/components/common/ResourceYaml'
import BasicResourceInfo from '@/views/resource/components/common/BasicResourceInfo'
import UpdateJob from './components/UpdateJob'
import BaseResource from '@/mixins/resource'
import BasePermission from '@/mixins/permission'

export default {
  name: 'JobDetail',
  components: {
    ResourceInfo,
    EventList,
    Metadata,
    PodList,
    ResourceYaml,
    BasicResourceInfo,
    UpdateJob,
  },
  mixins: [BaseResource, BasePermission],
  data: () => ({
    job: null,
    tab: 0,
    tabItems: [
      { text: '资源信息', value: 'ResourceInfo' },
      { text: '元数据', value: 'Metadata' },
      { text: '容器组', value: 'PodList' },
      { text: '事件', value: 'EventList' },
    ],
  }),
  computed: {
    ...mapState(['JWT', 'MessageStreamWS']),
  },
  watch: {
    '$store.state.MessageStream': {
      handler: function (updatingJob) {
        if (!updatingJob) return
        const job = JSON.parse(updatingJob)
        if (job.MessageType !== 'objectChanged') return
        if (
          job.Content &&
          this.job &&
          job.Content.metadata.name === this.job.metadata.name
        ) {
          if (job.EventKind === 'delete') {
            this.$router.push({ name: 'job-list' })
          } else {
            this.job = job.Content
          }
        }
      },
      deep: true,
      immediate: true,
    },
  },
  mounted() {
    if (this.JWT) {
      this.$nextTick(() => {
        this.jobDetail()
      })
    }
  },
  methods: {
    async jobDetail() {
      const data = await getJobDetail(
        this.ThisCluster,
        this.$route.query.namespace,
        this.$route.params.name,
      )
      this.job = data
      this.watchJob()
    },
    watchJob() {
      const sub = {
        kind: 'objectChanged',
        content: {},
      }
      const watchJobList = []
      watchJobList.push(
        `${this.job.metadata.namespace}/${this.job.metadata.name}`,
      )
      sub.content[this.ThisCluster] = { Job: watchJobList }
      if (this.MessageStreamWS && this.MessageStreamWS.readyState === 1) {
        this.MessageStreamWS.send(JSON.stringify(sub))
      }
    },
    resourceYaml() {
      this.$refs.resourceYaml.open()
    },
    updateJob() {
      this.$refs.updateJob.init(this.job)
      this.$refs.updateJob.open()
    },
    removeJob() {
      const item = this.job
      this.$store.commit('SET_CONFIRM', {
        title: `删除任务`,
        content: {
          text: `删除任务 ${item.metadata.name}`,
          type: 'delete',
          name: item.metadata.name,
        },
        param: { item },
        doFunc: async (param) => {
          await deleteJob(
            this.ThisCluster,
            this.$route.query.namespace,
            param.item.metadata.name,
          )
          this.$router.push({ name: 'job-list' })
        },
      })
    },
  },
}
</script>
