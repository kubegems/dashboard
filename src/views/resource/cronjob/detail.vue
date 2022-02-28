<template>
  <v-container fluid>
    <BaseViewportHeader :selectable="false" />
    <BaseBreadcrumb :breadcrumb="breadcrumb">
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
            v-if="resourceAllow"
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
                    @click="updateCronJob"
                  >
                    编辑
                  </v-btn>
                </v-flex>
                <v-flex>
                  <v-btn
                    color="error"
                    text
                    small
                    @click="removeCronJob"
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
        <BasicResourceInfo :item="cronjob" />
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
              :item="cronjob"
              :selector="{
                topkind: 'CronJob',
                topname: cronjob ? cronjob.metadata.name : '',
              }"
            />
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <ResourceYaml
      ref="resourceYaml"
      :item="cronjob"
    />
    <UpdateCronJob
      ref="updateCronJob"
      @refresh="cronJobDetail"
    />
  </v-container>
</template>

<script>
import { mapState } from 'vuex'
import { getCronJobDetail, deleteCronJob } from '@/api'
import ResourceInfo from './components/ResourceInfo'
import EventList from '@/views/resource/components/common/EventList'
import Metadata from '@/views/resource/components/metadata/Metadata'
import JobList from './components/JobList'
import ResourceYaml from '@/views/resource/components/common/ResourceYaml'
import BasicResourceInfo from '@/views/resource/components/common/BasicResourceInfo'
import UpdateCronJob from './components/UpdateCronJob'
import BaseResource from '@/mixins/resource'
import BasePermission from '@/mixins/permission'

export default {
  name: 'CronJobDetail',
  components: {
    ResourceInfo,
    EventList,
    Metadata,
    JobList,
    ResourceYaml,
    BasicResourceInfo,
    UpdateCronJob,
  },
  mixins: [BaseResource, BasePermission],
  data: () => ({
    breadcrumb: {
      title: '定时任务',
      tip: '定时任务 (CronJob) 管理基于时间的任务，例如在给定时间点只运行一次，或周期性地在给定时间点运行。',
      icon: 'mdi-calendar-clock',
    },
    cronjob: null,
    tab: 0,
    tabItems: [
      { text: '资源信息', value: 'ResourceInfo' },
      { text: '元数据', value: 'Metadata' },
      { text: '任务', value: 'JobList' },
      { text: '事件', value: 'EventList' },
    ],
  }),
  computed: {
    ...mapState(['JWT', 'MessageStreamWS']),
  },
  watch: {
    '$store.state.MessageStream': {
      handler: function (updatingCronJob) {
        if (!updatingCronJob) return
        const cronJob = JSON.parse(updatingCronJob)
        if (cronJob.MessageType !== 'objectChanged') return
        if (
          cronJob.Content &&
          this.cronjob &&
          cronJob.Content.metadata.name === this.cronjob.metadata.name
        ) {
          if (cronJob.EventKind === 'delete') {
            this.$router.push({ name: 'cronjob-list' })
          } else {
            this.cronjob = cronJob.Content
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
        this.cronJobDetail()
      })
    }
  },
  methods: {
    async cronJobDetail() {
      const data = await getCronJobDetail(
        this.ThisCluster,
        this.$route.query.namespace,
        this.$route.params.name,
      )
      this.cronjob = data
      this.watchCronJob()
    },
    watchCronJob() {
      const sub = {
        kind: 'objectChanged',
        content: {},
      }
      const watchCronJobList = []
      watchCronJobList.push(
        `${this.cronjob.metadata.namespace}/${this.cronjob.metadata.name}`,
      )
      sub.content[this.ThisCluster] = { CronJob: watchCronJobList }
      if (this.MessageStreamWS && this.MessageStreamWS.readyState === 1) {
        this.MessageStreamWS.send(JSON.stringify(sub))
      }
    },
    resourceYaml() {
      this.$refs.resourceYaml.open()
    },
    updateCronJob() {
      this.$refs.updateCronJob.init(this.cronjob)
      this.$refs.updateCronJob.open()
    },
    removeCronJob() {
      const item = this.cronjob
      this.$store.commit('SET_CONFIRM', {
        title: `删除定时任务`,
        content: {
          text: `删除定时任务 ${item.metadata.name}`,
          type: 'delete',
          name: item.metadata.name,
        },
        param: { item },
        doFunc: async (param) => {
          await deleteCronJob(
            this.ThisCluster,
            this.$route.query.namespace,
            param.item.metadata.name,
          )
          this.$router.push({ name: 'cronjob-list' })
        },
      })
    },
  },
}
</script>
