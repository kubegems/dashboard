<template>
  <v-flex>
    <v-form
      ref="form"
      v-model="valid"
      lazy-validation
    >
      <v-flex :class="expand ? 'kubegems__overlay' : ''" />
      <BaseSubTitle title="告警规则定义" />
      <v-card-text class="pa-2">
        <v-row>
          <v-col cols="6">
            <v-text-field
              v-model="obj.name"
              class="my-0"
              required
              label="名称"
              :rules="objRules.nameRule"
              :readonly="edit"
            />
          </v-col>

          <!-- 资源 -->
          <v-col cols="6">
            <v-autocomplete
              v-model="obj.resource"
              color="primary"
              :items="resourceItems"
              :rules="objRules.resourceRule"
              label="资源"
              hide-selected
              class="my-0"
              no-data-text="暂无可选数据"
              @change="onResourceChange"
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
          <!-- 资源 -->

          <!-- 规则 -->
          <v-col cols="6">
            <v-autocomplete
              v-model="obj.rule"
              color="primary"
              :items="ruleItems"
              :rules="objRules.ruleRule"
              :disabled="!obj.resource"
              label="规则"
              hide-selected
              class="my-0"
              no-data-text="暂无可选数据"
              @change="onRuleChange"
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
          <!-- 规则 -->

          <!-- 单位 -->
          <v-col cols="6">
            <v-autocomplete
              v-model="obj.unit"
              color="primary"
              label="单位"
              class="my-0"
              no-data-text="暂无可选数据"
              hide-selected
              :items="unitItems"
              :rules="unitItems.length ? objRules.unitRule : undefined"
              :disabled="!obj.rule || !unitItems.length"
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
          <!-- 单位 -->

          <!-- 评估时间 -->
          <v-col cols="6">
            <v-text-field
              v-model="obj.for"
              class="my-0"
              required
              label="评估时间"
              :rules="objRules.forRule"
            />
          </v-col>
          <!-- 评估时间 -->
        </v-row>
      </v-card-text>

      <!-- 标签筛选 -->
      <div
        v-if="obj.rule"
        class="mb-4"
      >
        <BaseSubTitle title="标签筛选" />
        <br />
        <RuleLabelpairs v-model="obj.labelpairs" />
      </div>
      <!-- 标签筛选 -->

      <AlertLevelForm
        ref="alertLevelForm"
        :data="obj.alertLevels"
        :namespace="obj.namespace"
        @addData="addData"
        @closeOverlay="closeExpand"
      />
      <BaseSubTitle title="告警级别配置" />
      <v-card-text class="pa-2">
        <AlertLevelItem
          :alertlevels="obj.alertLevels"
          @updateAlertLevel="updateAlertLevel"
          @removeAlertLevel="removeAlertLevel"
          @expandCard="expandCard"
        />
      </v-card-text>
    </v-form>
  </v-flex>
</template>

<script>
import { mapState } from 'vuex'
import { getSystemConfigData } from '@/api'
import AlertLevelItem from './AlertLevelItem'
import AlertLevelForm from './AlertLevelForm'
import RuleLabelpairs from './RuleLabelpairs'
import BaseSelect from '@/mixins/select'
import BaseResource from '@/mixins/resource'
import { deepCopy } from '@/utils/helpers'
import { required } from '@/utils/rules'

export default {
  name: 'Rule',
  components: {
    AlertLevelItem,
    AlertLevelForm,
    RuleLabelpairs,
  },
  mixins: [BaseSelect, BaseResource],
  props: {
    item: {
      type: Object,
      default: () => null,
    },
    edit: {
      type: Boolean,
      default: () => false,
    },
  },
  data() {
    return {
      valid: false,
      expand: false,
      obj: {
        name: '',
        namespace: '',
        for: '1m',
        resource: '',
        rule: '',
        unit: '',
        labelpairs: {},
        alertLevels: [],
        receivers: [],
      },
      metricsConfig: {}, // 指标配置
    }
  },
  computed: {
    ...mapState(['AdminViewport']),
    objRules() {
      return {
        nameRule: [required],
        namespaceRule: [required],
        resourceRule: [required],
        ruleRule: [required],
        unitRule: [required],
        metricRule: [required],
        forRule: [
          (v) =>
            !!new RegExp('(^\\d+[s|m|h]$)').test(v) ||
            '格式错误(示例:30s,1m,1h)',
        ],
        compareRule: [required],
        severityRule: [required],
        thresholdValueRule: [required],
      }
    },
    resourceItems() {
      const resourcesObj = this.metricsConfig.resources || {}
      return Object.keys(resourcesObj).map((key) => ({
        text: resourcesObj[key].showName,
        value: key,
      }))
    },
    ruleItems() {
      if (this.metricsConfig.resources && this.obj.resource) {
        const rulesObj = this.metricsConfig.resources[this.obj.resource].rules
        return Object.keys(rulesObj).map((key) => ({
          text: rulesObj[key].showName,
          value: key,
        }))
      }

      return []
    },
    unitItems() {
      if (this.metricsConfig.resources && this.obj.resource && this.obj.rule) {
        const units =
          this.metricsConfig.resources[this.obj.resource].rules[this.obj.rule]
            .units || []
        return units.map((unit) => ({
          text: this.metricsConfig.units[unit],
          value: unit,
        }))
      }
      return []
    },
  },
  mounted() {
    this.obj = this.$_.merge(this.obj, deepCopy(this.item))
    this.getMonitorConfig()
  },
  methods: {
    // eslint-disable-next-line vue/no-unused-properties
    init(data) {
      this.$nextTick(() => {
        this.obj = this.$_.merge(this.obj, deepCopy(data))
      })
    },
    // eslint-disable-next-line vue/no-unused-properties
    back(data) {
      this.$nextTick(() => {
        this.obj = deepCopy(data)
      })
    },
    addData(data) {
      this.obj.alertLevels = data
      this.$refs.alertLevelForm.closeCard()
    },
    updateAlertLevel(index) {
      const alertLevel = this.obj.alertLevels[index]
      const data = {
        index: index,
        compareOp: alertLevel.compareOp,
        compareValue: alertLevel.compareValue,
        severity: alertLevel.severity,
      }

      this.$refs.alertLevelForm.alertLevel.compareSelector =
        alertLevel.compareOp
      this.$refs.alertLevelForm.alertLevel.severity = alertLevel.severity
      this.$nextTick(() => {
        this.$refs.alertLevelForm.init(data)
        this.expand = true
      })
    },
    removeAlertLevel(index) {
      this.$delete(this.obj.alertLevels, index)
    },
    expandCard() {
      this.$refs.alertLevelForm.alertLevel = {
        index: -1,
        compareOp: '>',
        compareValue: '',
        severity: 'error',
      }
      this.$nextTick(() => {
        this.$refs.alertLevelForm.expandCard()
        this.expand = true
      })
    },
    // eslint-disable-next-line vue/no-unused-properties
    setData(data) {
      this.obj = data
    },
    closeExpand() {
      this.expand = false
    },
    // eslint-disable-next-line vue/no-unused-properties
    reset() {
      this.$refs.alertLevelForm.closeCard()
      this.obj = {
        name: '',
        namespace: '',
        for: '1m',
        resource: '',
        rule: '',
        unit: '',
        labelpairs: {},
        alertLevels: [],
        receivers: [],
      }
      this.$refs.form.reset()
    },
    onResourceChange() {
      // resource选择变更时需要重置rule值
      this.obj.rule = ''
      this.obj.unit = ''
    },
    onRuleChange() {
      this.obj.unit = ''
      this.setLabelpairs()
    },
    // mergeLabelpairs 点击编辑时数据labelpairs与全值合并
    setLabelpairs(mergeLabelpairs = {}) {
      const { resource, rule } = this.obj
      const labelpairs = {}
      if (resource && rule && this.metricsConfig) {
        const labels =
          this.metricsConfig.resources?.[resource].rules[rule].labels || []
        labels.forEach((item) => {
          labelpairs[item] = ''
        })
      }
      this.$set(this.obj, 'labelpairs', { ...labelpairs, ...mergeLabelpairs })
    },
    async getMonitorConfig() {
      const data = await getSystemConfigData('Monitor')
      this.metricsConfig = data.content || {}
      this.setLabelpairs(this.obj.labelpairs) // 此处确保配置项加载完后更新labelpairs列表
    },
  },
}
</script>
