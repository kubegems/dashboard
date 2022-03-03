<template>
  <v-container fluid>
    <BaseBreadcrumb :breadcrumb="breadcrumb">
      <template #extend>
        <v-menu
          v-if="editable"
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
            <v-btn
              color="primary"
              text
              block
              small
              @click="onSave"
            >
              保存
            </v-btn>
            <v-btn
              color="error"
              text
              block
              small
              @click="onDelete"
            >
              删除
            </v-btn>
          </v-card>
        </v-menu>
      </template>
    </BaseBreadcrumb>
    <v-row
      v-if="outputData"
      class="mt-0"
    >
      <!-- 基本信息 -->
      <v-col
        cols="2"
        class="pt-0"
      >
        <OutputInfoPanel :data="outputData" />
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
              {{ item.text }}
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
                  :data.sync="outputData"
                  title="Output"
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
  getOutputDetailData,
  getClusterOutputDetailData,
  deleteOutputData,
  deleteClusterOutputData,
  patchOutputData,
  patchClusterOutputData,
} from '@/api'
import OutputInfoPanel from './components/OutputInfoPanel.vue'
import LokiForm from './components/LokiForm'
import ElasticsearchForm from './components/ElasticsearchForm'
import KafkaForm from './components/KafkaForm'
import YamlForm from '@/views/observe/log/operator/components/YamlForm'

export default {
  name: 'OutputDetail',
  components: {
    OutputInfoPanel,
    LokiForm,
    ElasticsearchForm,
    KafkaForm,
    YamlForm,
  },
  data() {
    this.breadcrumb = {
      title: '日志路由器',
      tip: '',
      icon: 'mdi-router-wireless',
    }

    return {
      valid: true,
      outputData: null,
      tab: 0,
    }
  },
  computed: {
    ...mapState(['AdminViewport']),
    editable () {
      if (!this.outputData) return false
      return this.outputData.kind === 'Output' || this.AdminViewport
    },
    tabItems() {
      const type = this.getPluginType()
      return (
        type === 'Other' ? [] : [{ text: '插件配置', value: `${type}Form` }]
      ).concat([{ text: 'Yaml', value: 'YamlForm' }])
    },
  },
  watch: {
    tab(newValue, oldValue) {
      this.$refs[`configComponent${this.tabItems[oldValue].value}`][0].onUpdateData()
    },
  },
  mounted() {
    this.getOutputDetail()
  },
  methods: {
    getPluginType() {
      const item = this.outputData
      if (!item) return 'Loki'
      switch (true) {
        case !!item.spec?.loki:
          return 'Loki'
        case !!item.spec?.elasticsearch:
          return 'Elasticsearch'
        case !!item.spec?.kafka:
          return 'Kafka'
        default:
          return 'Other'
      }
    },
    onDelete() {
      if (!this.outputData) return
      const { cluster } = this.$route.query
      const { namespace, name } = this.outputData.metadata
      this.$store.commit('SET_CONFIRM', {
        title: `删除路由器`,
        content: {
          text: `删除路由器 ${name}`,
          type: 'delete',
          name,
        },
        doFunc: async () => {
          const action = this.outputData.kind === 'Output' ? deleteOutputData : deleteClusterOutputData
          await action(cluster, namespace, name)
          this.$router.push({ name: 'admin-log-output' })
        },
      })
    },
    async onSave() {
      if (this.$refs.form.validate(true)) {
        this.$refs[`configComponent${this.tabItems[this.tab].value}`][0].onUpdateData()
        const action = this.outputData.kind === 'Output' ? patchOutputData : patchClusterOutputData
        const { cluster } = this.$route.query
        const { namespace, name } = this.outputData.metadata
        await action(cluster, namespace, name, this.outputData)
        this.getOutputDetail()
      } else {
        this.$store.commit('SET_SNACKBAR', {
          text: '请根据要求完成配置',
          color: 'error',
        })
      }
    },
    async getOutputDetail() {
      const { cluster, namespace } = this.$route.query
      const { name, kind } = this.$route.params
      const action = kind === 'Output' ? getOutputDetailData : getClusterOutputDetailData
      this.outputData = await action(cluster, namespace, name)
    },
  },
}
</script>
