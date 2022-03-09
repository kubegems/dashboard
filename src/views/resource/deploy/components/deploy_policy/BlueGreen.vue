<template>
  <BaseDialog
    v-model="dialog"
    :width="1000"
    title="蓝绿部署"
    icon="mdi-send"
    @reset="reset"
  >
    <template #content>
      <v-flex>
        <v-form
          ref="form"
          v-model="valid"
          lazy-validation
        >
          <v-flex :class="expand ? 'kubegems__overlay' : ''" />
          <BaseDeployInfoForm
            ref="baseDeployInfoForm"
            :runtime="runtime"
          />

          <BaseSubTitle title="服务设置" />
          <v-card-text class="pa-2">
            <v-row>
              <v-col cols="6">
                <v-autocomplete
                  v-model="obj.strategy.blueGreen.activeService"
                  :rules="bluegreenRules.activeServiceRules"
                  :items="activeServiceItems"
                  color="primary"
                  label="主版本服务（蓝）"
                  hide-selected
                  class="my-0"
                  no-data-text="暂无可选数据"
                  :search-input.sync="activeServiceText"
                  @keyup.enter="createActiveService"
                >
                  <template #selection="{ item }">
                    <v-chip
                      color="primary"
                      small
                      class="mx-1"
                    >
                      {{ item['text'] }}
                    </v-chip>
                  </template>
                </v-autocomplete>
              </v-col>
              <v-col cols="6">
                <v-autocomplete
                  v-model="obj.strategy.blueGreen.previewService"
                  :rules="bluegreenRules.previewServiceRules"
                  :items="previewServiceItems"
                  color="primary"
                  label="发布版本服务（绿）"
                  hide-selected
                  class="my-0"
                  no-data-text="暂无可选数据"
                  :search-input.sync="previewServiceText"
                  @keyup.enter="createPreviewService"
                >
                  <template #selection="{ item }">
                    <v-chip
                      color="primary"
                      small
                      class="mx-1"
                    >
                      {{ item['text'] }}
                    </v-chip>
                  </template>
                </v-autocomplete>
              </v-col>
            </v-row>
          </v-card-text>

          <BaseSubTitle title="更新策略" />
          <v-card-text class="pa-2">
            <v-row>
              <v-col cols="6">
                <v-autocomplete
                  v-model="updatePolicy"
                  :items="updatePolicyitems"
                  :rules="bluegreenRules.autoPromotionEnabledRules"
                  color="primary"
                  label="更新策略"
                  hide-selected
                  class="my-0"
                  no-data-text="暂无可选数据"
                  @change="onUpdatePolicyChange"
                >
                  <template #selection="{ item }">
                    <v-chip
                      color="primary"
                      small
                      class="ma-1"
                    >
                      {{ item['text'] }}
                    </v-chip>
                  </template>
                </v-autocomplete>
              </v-col>
              <v-col
                v-if="updatePolicy === 'auto'"
                cols="6"
              >
                <v-text-field
                  v-model="obj.strategy.blueGreen.autoPromotionSeconds"
                  :rules="bluegreenRules.autoPromotionSecondsRules"
                  class="my-0"
                  required
                  label="延时时间"
                />
              </v-col>
            </v-row>
          </v-card-text>

          <AnalysisTemplateForm
            ref="analysisTemplateForm"
            :data="analysis"
            :service="obj.strategy.blueGreen.previewService"
            @addData="addAnalysisData"
            @closeOverlay="closeExpand"
          />
          <BaseSubTitle title="应用分析（需启用prometheus与istio）" />
          <v-card-text class="pa-2">
            <AnalysisTemplateItem
              :obj="obj.strategy.blueGreen.prePromotionAnalysis"
              title="更新过程中分析"
              @updateAnalysis="updatePreAnalysis"
              @removeAnalysis="removePreAnalysis"
              @expandCard="expandCard('pre')"
            />

            <AnalysisTemplateItem
              class="mt-3"
              :obj="obj.strategy.blueGreen.postPromotionAnalysis"
              title="更新完成后分析"
              @updateAnalysis="updatePostAnalysis"
              @removeAnalysis="removePostAnalysis"
              @expandCard="expandCard('post')"
            />
          </v-card-text>
        </v-form>
      </v-flex>
    </template>
    <template #action>
      <v-btn
        class="float-right"
        color="primary"
        text
        :loading="Circular"
        @click="strategyDeployEnvironmentApps"
      >
        确定
      </v-btn>
    </template>
  </BaseDialog>
</template>

<script>
import { mapState } from 'vuex'
import { postStrategyDeployEnvironmentApps, getAppResourceFileMetas } from '@/api'
import BaseDeployInfoForm from './base/BaseDeployInfoForm'
import AnalysisTemplateItem from './analysis_template/AnalysisTemplateItem'
import AnalysisTemplateForm from './analysis_template/AnalysisTemplateForm'
import StrategyDeploy from '@/views/resource/deploy/mixins/deploy'
import BaseResource from '@/mixins/resource'
import { deepCopy } from '@/utils/helpers'
import { required, positiveInteger } from '@/utils/rules'

export default {
  name: 'Recreate',
  components: {
    AnalysisTemplateItem,
    AnalysisTemplateForm,
    BaseDeployInfoForm,
  },
  mixins: [StrategyDeploy, BaseResource],
  data() {
    return {
      dialog: false,
      valid: false,
      expand: false,
      updatePolicy: 'manual',
      updatePolicyitems: [
        { text: '手动更新', value: 'manual' },
        { text: '自动更新', value: 'auto' },
      ],
      analysis: {},
      activeServiceItems: [],
      activeServiceText: '',
      previewServiceItems: [],
      previewServiceText: '',
      obj: {
        images: [],
        name: '',
        strategy: {
          blueGreen: {
            activeService: '',
            previewService: '',
            autoPromotionEnabled: false,
            autoPromotionSeconds: 30,
            prePromotionAnalysis: {},
            postPromotionAnalysis: {},
          },
          type: 'BlueGreen',
        },
        istioVersion: '',
      },
      bluegreenRules: {
        activeServiceRules: [required],
        previewServiceRules: [required],
        autoPromotionEnabledRules: [required],
        autoPromotionSecondsRules: [
          positiveInteger,
        ],
      },
    }
  },
  computed: {
    ...mapState(['Circular']),
  },
  methods: {
    // eslint-disable-next-line vue/no-unused-properties
    open() {
      this.dialog = true
    },
    // eslint-disable-next-line vue/no-unused-properties
    async init() {
      this.svcList()
      await this.strategyDeployEnvironmentAppsDetail()
      if (this.runtime.strategy.type === 'BlueGreen') {
        this.obj = deepCopy(this.runtime)
      }
    },
    async strategyDeployEnvironmentApps() {
      if (
        this.$refs.baseDeployInfoForm.$refs.form.validate(true) &&
        this.$refs.form.validate(true)
      ) {
        this.obj = Object.assign(this.obj, this.$refs.baseDeployInfoForm.base)
        await postStrategyDeployEnvironmentApps(
          this.Tenant().ID,
          this.Project().ID,
          this.Environment().ID,
          this.$route.params.name,
          this.m_resource_beautifyData(this.obj),
        )
        this.reset()
        // this.$emit('refresh')
        this.dialog = false
        this.$router.push({
          name: 'app-detail',
          params: { name: this.$route.params.name },
          query: {
            projectid: this.Project().ID,
            tenantid: this.Tenant().ID,
            kind: 'app',
            namespace: this.Environment().Namespace,
            type: this.$route.query.type,
            tab: 1,
          },
        })
      }
    },
    async svcList() {
      let data = {}
      data = await getAppResourceFileMetas(
        this.$route.query.tenantid,
        this.$route.query.projectid,
        this.ThisAppEnvironmentID,
        this.$route.params.name,
        {
          kind: 'Service',
          noprocessing: true,
        },
      )
      data.forEach((v) => {
        v.text = v.metadata.name
        v.value = v.metadata.name
      })
      this.activeServiceItems = data
      this.previewServiceItems = data
    },
    createActiveService() {
      if (
        !this.activeServiceItems.find((v) => {
          return v.value === this.activeServiceText
        })
      ) {
        this.activeServiceItems.push({
          text: this.activeServiceText,
          value: this.activeServiceText,
        })
      }
      this.obj.strategy.blueGreen.activeService = this.activeServiceText
      this.activeServiceText = ''
    },
    createPreviewService() {
      if (
        !this.previewServiceItems.find((v) => {
          return v.value === this.previewServiceText
        })
      ) {
        this.previewServiceItems.push({
          text: this.previewServiceText,
          value: this.previewServiceText,
        })
      }
      this.obj.strategy.blueGreen.previewService = this.previewServiceText
      this.previewServiceText = ''
    },
    onUpdatePolicyChange() {
      if (this.updatePolicy === 'manual') {
        this.obj.strategy.blueGreen.autoPromotionEnabled = false
      } else if (this.updatePolicy === 'auto') {
        this.obj.strategy.blueGreen.autoPromotionEnabled = true
      }
    },
    addAnalysisData(data, t) {
      if (t === 'pre') {
        this.obj.strategy.blueGreen.prePromotionAnalysis = data
      } else if (t === 'post') {
        this.obj.strategy.blueGreen.postPromotionAnalysis = data
      }
      this.$refs.analysisTemplateForm.closeCard()
    },
    updatePreAnalysis() {
      this.analysis = deepCopy(this.obj.strategy.blueGreen.prePromotionAnalysis)
      this.$refs.analysisTemplateForm.init('pre')
      this.$refs.analysisTemplateForm.expandCard()
    },
    updatePostAnalysis() {
      this.analysis = deepCopy(
        this.obj.strategy.blueGreen.postPromotionAnalysis,
      )
      this.$refs.analysisTemplateForm.init('post')
      this.$refs.analysisTemplateForm.expandCard()
    },
    removePreAnalysis() {
      this.obj.strategy.blueGreen.prePromotionAnalysis = {}
    },
    removePostAnalysis() {
      this.obj.strategy.blueGreen.postPromotionAnalysis = {}
    },
    expandCard(t) {
      this.$nextTick(() => {
        this.$refs.analysisTemplateForm.init(t)
        this.$refs.analysisTemplateForm.expandCard()
        this.expand = true
      })
    },
    closeExpand() {
      this.expand = false
    },
    reset() {
      this.$refs.analysisTemplateForm.reset()
      this.updatePolicy = 'manual'
      this.obj = deepCopy(this.$options.data().obj)
      this.$refs.form.resetValidation()
    },
  },
}
</script>
