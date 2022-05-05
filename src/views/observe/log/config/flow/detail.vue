<template>
  <v-container fluid>
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
                  >
                    编辑
                  </v-btn>
                </v-flex>
                <v-flex>
                  <v-btn
                    color="error"
                    text
                    small
                    @click="removeFlow"
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
    <v-row
      v-if="flow"
      class="mt-0"
    >
      <!-- 基本信息 -->
      <v-col
        cols="2"
        class="pt-0"
      >
        <BasicResourceInfo :item="flow" />
      </v-col>
      <!-- 基本信息 -->

      <!-- 配置 -->
      <v-col
        cols="10"
        class="pt-0"
      >
        <v-card>
          <v-tabs
            v-model="tab"
            height="40"
            class="rounded-t pl-4 pt-4"
          >
            <v-tab
              v-for="item in tabItems"
              :key="item.value"
            >
              {{
                item.text
              }}
            </v-tab>
          </v-tabs>
          <v-tabs-items
            v-model="tab"
            class="overflow-visible"
          >
            <v-tab-item
              v-for="item in tabItems"
              :key="item.value"
              transition="none"
            >
              <component
                :is="item.value"
                :ref="`configComponent${item.value}`"
                :data.sync="flow"
              />
            </v-tab-item>
          </v-tabs-items>
        </v-card>
      </v-col>
      <!-- 配置 -->
    </v-row>

    <ResourceYaml
      ref="resourceYaml"
      :item="flow"
    />
  </v-container>
</template>

<script>
import { mapState } from 'vuex'
import {
  getFlowDetailData,
  getClusterFlowDetailData,
  deleteClusterFlowData,
  deleteFlowData,
} from '@/api'
import ResourceYaml from '@/views/resource/components/common/ResourceYaml'
import BasicResourceInfo from '@/views/resource/components/common/BasicResourceInfo'
import ResourceInfo from './components/ResourceInfo'
import BasePermission from '@/mixins/permission'

export default {
  name: 'FlowDetail',
  components: {
    ResourceYaml,
    BasicResourceInfo,
    ResourceInfo,
  },
  mixins: [BasePermission],
  data () {
    this.breadcrumb = {
      title: '日志采集器',
      tip: '',
      icon: 'mdi-arrange-send-backward',
    }

    this.tabItems = [
      { text: '资源信息', value: 'ResourceInfo' },
    ]

    return {
      flow: null,
      tab: 0,
    }
  },
  computed: {
    ...mapState(['AdminViewport']),
  },
  watch: {
    tab(newValue, oldValue) {
      this.$refs[
        `configComponent${this.tabItems[oldValue].value}`
      ][0].onUpdateData()
    },
  },
  mounted() {
    this.getFlowDetail()
  },
  methods: {
    async getFlowDetail() {
      const { cluster, namespace } = this.$route.query
      const { name, kind } = this.$route.params
      const action = kind === 'Flow' ? getFlowDetailData : getClusterFlowDetailData
      this.flow = await action(cluster, namespace, name)
    },
    resourceYaml() {
      this.$refs.resourceYaml.open()
    },
    removeFlow() {
      const item = this.flow
      this.$store.commit('SET_CONFIRM', {
        title: `删除日志采集器`,
        content: {
          text: `删除日志采集器 ${item.metadata.name}`,
          type: 'delete',
          name: item.metadata.name,
        },
        param: { item },
        doFunc: async (param) => {
          const action = item.kind === 'Flow' ? deleteFlowData : deleteClusterFlowData
          await action(
            this.$route.query.cluster,
            this.$route.query.namespace,
            param.item.metadata.name,
          )
          this.$router.push({
            name: this.AdminViewport ? 'admin-log-config' : 'log-config',
            query: {
              cluster: this.$route.query.cluster,
              namespace: this.$route.query.namespace,
              proj: this.$route.query.proj,
              env: this.$route.query.env,
              tab: 'flow',
            },
          })
        },
      })
    },
  },
}
</script>
