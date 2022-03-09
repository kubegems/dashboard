<template>
  <v-container fluid>
    <BaseBreadcrumb :breadcrumb="breadcrumb">
      <template #extend>
        <v-menu
          v-if="AdminViewport"
          left
        >
          <template #activator="{ on }">
            <v-btn
              icon
              class="float-right"
            >
              <v-icon
                x-small
                color="primary"
                v-on="on"
              >
                fas fa-ellipsis-v
              </v-icon>
            </v-btn>
          </template>
          <v-card class="pa-2">
            <div>
              <v-btn
                color="primary"
                text
                small
                @click="onSave"
              >
                保存
              </v-btn>
            </div>
            <div>
              <v-btn
                color="error"
                text
                small
                @click="onDelete"
              >
                删除
              </v-btn>
            </div>
          </v-card>
        </v-menu>
      </template>
    </BaseBreadcrumb>
    <v-row
      v-if="flowData"
      class="mt-0"
    >
      <!-- 基本信息 -->
      <v-col
        cols="2"
        class="pt-0"
      >
        <SideDetail :data="flowData" />
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
          <v-form
            ref="form"
            v-model="valid"
            lazy-validation
            class="pa-4"
          >
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
                  :data.sync="flowData"
                />
              </v-tab-item>
            </v-tabs-items>
          </v-form>
        </v-card>
      </v-col>
      <!-- 配置 -->
    </v-row>
  </v-container>
</template>

<script>
import { mapState } from 'vuex'
import {
  getFlowDetailData,
  getClusterFlowDetailData,
  deleteFlowData,
  deleteClusterFlowData,
  patchFlowData,
  patchClusterFlowData,
} from '@/api'
import SideDetail from '@/views/observe/log/operator/components/SideDetail'
import InputForm from './components/InputForm'
import FilterForm from './components/FilterForm'
import OutputForm from './components/OutputForm'
import YamlForm from '@/views/observe/log/operator/components/YamlForm'

export default {
  name: 'FlowDetail',
  components: {
    SideDetail,
    InputForm,
    FilterForm,
    OutputForm,
    YamlForm,
  },
  data () {
    this.breadcrumb = {
      title: '日志采集器',
      tip: '采集器(flow)声明了当前环境下哪些应用的日志会被采集及解析规则',
      icon: 'mdi-arrange-send-backward',
    }

    this.tabItems = [
      { text: 'Input', value: 'InputForm' },
      { text: 'Filter', value: 'FilterForm' },
      { text: 'Output', value: 'OutputForm' },
      { text: 'Yaml', value: 'YamlForm' },
    ]

    return {
      valid: false,
      flowData: null,
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
    onDelete() {
      if (!this.flowData) return
      const { cluster } = this.$route.query
      const { namespace, name } = this.outputData.metadata
      this.$store.commit('SET_CONFIRM', {
        title: `删除采集器`,
        content: {
          text: `删除采集器 ${name}`,
          type: 'delete',
          name,
        },
        doFunc: async () => {
          const action = this.flowData.kind === 'Flow' ? deleteFlowData : deleteClusterFlowData
          await action(cluster, namespace, name)
          this.$router.push({ name: 'admin-log-flow' })
        },
      })
    },
    async onSave() {
      if (this.$refs.form.validate(true)) {
        this.$refs[`configComponent${this.tabItems[this.tab].value}`][0].onUpdateData()
        const action = this.flowData.kind === 'Flow' ? patchFlowData : patchClusterFlowData
        const { namespace, name } = this.flowData.metadata
        await action(this.$route.query.cluster, namespace, name, this.flowData)
        this.getFlowDetail()
      } else {
        this.$store.commit('SET_SNACKBAR', {
          text: '请根据要求完成配置',
          color: 'error',
        })
      }
    },
    async getFlowDetail() {
      const { cluster, namespace, kind } = this.$route.query
      const { name } = this.$route.params
      const action = kind === 'Flow' ? getFlowDetailData : getClusterFlowDetailData
      this.flowData = await action(cluster, namespace, name)
    },
  },
}
</script>
