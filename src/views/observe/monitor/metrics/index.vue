<template>
  <v-container
    fluid
    class="queryer"
  >
    <BaseBreadcrumb
      :breadcrumb="breadcrumb"
      class="queryer__header"
    >
      <template #extend>
        <div class="float-right">
          <ButtonInput
            v-model="topk"
            label="Topk:"
            empty-value-placeholder="auto"
            class="mr-2"
          >
            <v-text-field
              v-model="topk"
              dense
              solo
              flat
              hide-details
              type="number"
              :rules="fieldRules.topk"
              placeholder="Topk"
              :style="{ width: '100px' }"
              @change="_handleRefresh(undefined)"
            />
          </ButtonInput>

          <ButtonInput
            v-model="step"
            label="Step:"
            empty-value-placeholder="auto"
            class="mr-2"
          >
            <v-combobox
              v-model="step"
              :items="['auto']"
              dense
              solo
              flat
              hide-details
              :rules="fieldRules.step"
              placeholder="Step"
              :style="{ width: '110px' }"
              @change="_handleRefresh(undefined)"
            />
          </ButtonInput>

          <BaseDatetimePicker
            ref="baseDatetimePicker"
            v-model="date"
            :default-value="30"
            @change="onRefresh(undefined)"
          />
          <v-btn
            color="primary"
            text
            small
            @click="onRefresh(undefined)"
          >
            <v-icon
              left
              small
            >
              fas fa-redo
            </v-icon>
            刷新
          </v-btn>
        </div>
      </template>
    </BaseBreadcrumb>

    <div class="queryer__main">
      <div class="queryer__main-box">
        <div class="queryer__main-inner">
          <v-expansion-panels
            v-model="expand"
            accordion
            class="queryer__panel"
          >
            <v-expansion-panel
              v-for="(item, index) in queryList"
              :key="item._$id"
            >
              <!-- panel-header -->
              <v-expansion-panel-header disable-icon-rotate>
                <div>
                  <v-btn
                    x-small
                    depressed
                    color="primary"
                    class="mr-2"
                  >
                    {{ index + 1 }}
                  </v-btn>
                  <v-btn
                    v-if="item.resource"
                    x-small
                    depressed
                    class="mr-2"
                    color="success"
                  >
                    {{ item.resource.showName }}
                  </v-btn>
                  <v-btn
                    v-if="item.rule"
                    x-small
                    depressed
                    color="success"
                  >
                    {{ item.rule.showName }}
                  </v-btn>
                </div>
                <template #actions>
                  <v-icon
                    v-if="metricsObject[item._$id]"
                    color="success"
                  >
                    mdi-check
                  </v-icon>
                  <v-icon v-else>mdi-alert-circle</v-icon>
                </template>
              </v-expansion-panel-header>
              <!-- panel-header -->

              <!-- panel-content -->
              <v-expansion-panel-content>
                <v-form
                  :ref="`${item._$id}-form`"
                  lazy-validation
                  @submit.prevent="onSearch(item._$id)"
                >
                  <!-- 集群 -->
                  <template v-if="AdminViewport">
                    <BaseSubTitle
                      title="集群"
                      class="mb-3"
                    />
                    <v-select
                      v-model="queryList[index].cluster"
                      :items="m_select_clusterItems"
                      item-text="text"
                      item-value="value"
                      label="集群"
                      dense
                      solo
                      flat
                      return-object
                      no-data-text="暂无可选数据"
                      :rules="fieldRules.cluster(index)"
                      @change="onClusterChange(index)"
                    />
                  </template>

                  <!-- 项目环境 -->
                  <BaseSubTitle
                    title="项目环境"
                    class="mb-3"
                  />
                  <v-row>
                    <v-col :cols="6">
                      <v-select
                        v-model="queryList[index].project"
                        :items="queryList[index].projectItems"
                        item-text="text"
                        item-value="value"
                        label="项目"
                        dense
                        solo
                        flat
                        no-data-text="暂无可选数据"
                        return-object
                        :loading="projectListLoading"
                        :rules="AdminViewport ? [] : fieldRules.required"
                        @change="onProjectChange(index)"
                      />
                    </v-col>
                    <v-col :cols="6">
                      <v-select
                        v-model="queryList[index].environment"
                        :items="queryList[index].environmentItems"
                        item-text="EnvironmentName"
                        item-value="ID"
                        label="环境"
                        dense
                        solo
                        flat
                        return-object
                        no-data-text="暂无可选数据"
                        :loading="queryList[index].environmentItemsLoading"
                        :disabled="!queryList[index].project"
                        :rules="
                          !queryList[index].project && AdminViewport
                            ? []
                            : fieldRules.required
                        "
                      />
                    </v-col>
                  </v-row>
                  <!-- 项目环境 -->

                  <!-- 资源规则 -->
                  <BaseSubTitle
                    title="资源规则"
                    class="mb-3"
                  />
                  <v-select
                    v-model="queryList[index].resource"
                    :items="resourceItems"
                    item-text="showName"
                    item-value="_$value"
                    label="资源"
                    dense
                    solo
                    flat
                    return-object
                    :rules="fieldRules.required"
                    no-data-text="暂无可选数据"
                    @change="setRuleItems(index)"
                  />
                  <v-row>
                    <v-col :cols="6">
                      <v-select
                        v-model="queryList[index].rule"
                        :items="queryList[index].ruleItems"
                        item-text="showName"
                        item-value="_$value"
                        label="规则"
                        dense
                        solo
                        flat
                        return-object
                        no-data-text="暂无可选数据"
                        :disabled="!queryList[index].resource"
                        :rules="fieldRules.required"
                        @change="setUnitItems(index)"
                      />
                    </v-col>

                    <v-col :cols="6">
                      <v-select
                        v-model="queryList[index].unit"
                        :items="queryList[index].unitItems"
                        label="单位"
                        item-value="_$value"
                        item-text="text"
                        dense
                        solo
                        flat
                        return-object
                        no-data-text="暂无可选数据"
                        :disabled="
                          !queryList[index].rule ||
                            !queryList[index].unitItems.length
                        "
                        :rules="
                          queryList[index].unitItems.length
                            ? fieldRules.required
                            : undefined
                        "
                      />
                    </v-col>
                  </v-row>
                  <!-- 资源规则 -->

                  <!-- 查询 -->
                  <div class="queryer__panel-search">
                    <v-btn
                      depressed
                      class="mr-4"
                      @click="onRemove(item._$id)"
                    >
                      移除
                    </v-btn>
                    <v-btn
                      depressed
                      color="primary"
                      type="submit"
                    >
                      查询
                    </v-btn>
                  </div>
                  <!-- 查询 -->
                </v-form>
              </v-expansion-panel-content>
              <!-- panel-content -->
            </v-expansion-panel>
          </v-expansion-panels>
          <v-row>
            <v-col :cols="6">
              <v-btn
                block
                class="mt-4"
                @click="onClean"
              >
                <v-icon>mdi-redo</v-icon>
                重置
              </v-btn>
            </v-col>
            <v-col :cols="6">
              <v-btn
                block
                color="primary"
                class="mt-4"
                @click="onAddQuery"
              >
                <v-icon>mdi-plus-box</v-icon>
                添加查询
              </v-btn>
            </v-col>
          </v-row>
        </div>
      </div>

      <div class="queryer__main-box">
        <div class="queryer__main-inner">
          <transition-group name="scroll-x-reverse-transition">
            <MetricsItem
              v-for="item in metricsItems"
              :key="item._$value"
              :title="item._$title"
              :unit="item._$unit"
              :data="item"
              :labelpairs="labelpairs[item._$value]"
              :label-object="labelObject[item._$value]"
              class="mb-3"
              @loadLabel="getLabelItems($event, item._$value)"
              @change="onLabelChange($event, item._$value)"
              @refresh="onRefresh(item._$value)"
              @alert="onAddAlert"
            />
          </transition-group>
        </div>
      </div>
    </div>

    <AddPrometheusRule ref="addPrometheusRule" />
  </v-container>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
import {
  getSystemConfigData,
  getMyConfigData,
  getMetricsQueryrange,
  getProjectList,
  getProjectEnvironmentList,
  getMetricsLabelValues,
} from '@/api'
import ButtonInput from './components/ButtonInput'
import MetricsItem from './components/MetricsItem'
import AddPrometheusRule from '@/views/observe/monitor/config/prometheusrule/components/AddPrometheusRule'
import BaseSelect from '@/mixins/select'
import { deepCopy, debounce } from '@/utils/helpers'
import { required } from '@/utils/rules'

export default {
  name: 'MetricsIndex',
  components: {
    MetricsItem,
    AddPrometheusRule,
    ButtonInput,
  },
  mixins: [BaseSelect],
  data() {
    this.breadcrumb = {
      title: '指标查询器',
      tip: '查询系统监控指标，并支持生成告警',
      icon: 'mdi-feature-search-outline',
    }

    this.fieldRules = {
      cluster: (index) => {
        return [
          (v) => {
            const query = this.queryList[index]
            return !!v || !!query.project || '集群和项目环境不能同时为空'
          },
        ]
      },
      required: [required],
      step: [
        (v) =>
          !v ||
          v.trim() === 'auto' ||
          !!new RegExp('^\\d+$').test(v) ||
          '格式错误(示例:整数)',
      ],
      topk: [
        (v) => !v || !!new RegExp('^\\d+$').test(v) || '格式错误(示例:整数)',
      ],
    }

    this.defaultParams = {
      _$id: `0-${Date.now()}`,
      cluster: undefined,
      resource: undefined,
      project: undefined,
      environment: undefined,
      rule: undefined,
      unit: undefined,
      labelpairs: undefined,
      projectItems: [],
      environmentItems: [],
      environmentItemsLoading: false,
      ruleItems: [],
      unitItems: [],
      _$origin: undefined,
    }

    this._handleRefresh = debounce(this.onRefresh, 500)

    return {
      expand: 0,
      queryList: [{ ...this.defaultParams }],
      date: [],
      step: 'auto',
      topk: 20,
      allProjectList: [],
      projectListLoading: false,
      config: {},
      labelObject: {},
      metricsObject: {},
      labelpairs: {},
      isMounted: true,
    }
  },
  computed: {
    ...mapGetters(['Tenant']),
    ...mapState(['AdminViewport', 'Scale']),
    resourceItems() {
      return this.formatObject2Array(this.config.resources || {})
        .filter(item => this.AdminViewport || item.namespaced)
    },
    metricsItems() {
      return Object.keys(this.metricsObject).map((id) => {
        const index = this.queryList.findIndex((item) => item._$id === id)
        const query = this.queryList[index]
        return {
          _$value: id,
          _$index: index,
          _$unit: query._$origin?.unit?.text,
          _$title: `${index + 1}-${query._$origin?.resource.showName}-${
            query._$origin?.rule.showName
          }`,
          _$origin: query._$origin,
          data: this.metricsObject[id],
        }
      })
    },
  },
  mounted() {
    if (this.AdminViewport) {
      this.m_select_clusterSelectData()
    }
    this.getMonitorConfig()
    this.getProjectList()
    this.isMounted = false
  },
  methods: {
    formatObject2Array(obj) {
      return Object.keys(obj || {}).map((key) => ({
        _$value: key,
        ...obj[key],
      }))
    },
    onClean() {
      this.queryList = [{ ...this.defaultParams }]
      this.labelObject = {}
      this.labelpairs = {}
      this.metricsObject = {}
      this.expand = 0
    },
    onAddQuery() {
      this.queryList.push({
        ...this.defaultParams,
        projectItems: this.allProjectList,
        _$id: `${this.queryList.length}-${Date.now()}`,
      })
      this.expand = this.queryList.length - 1
    },
    onRemove(id) {
      this.queryList = this.queryList.filter((item) => item._$id !== id)
      this.expand = 0
      this.$delete(this.labelObject, id)
      this.$delete(this.labelpairs, id)
      this.$delete(this.metricsObject, id)
    },
    onAddAlert(data) {
      this.$refs.addPrometheusRule.open()
      this.$refs.addPrometheusRule.init(data)
    },
    // 设置各项独立的ruleItems
    setRuleItems(index) {
      const params = this.queryList[index]
      let items = []
      if (params.resource) {
        const rulesObj =
          this.config.resources?.[params.resource._$value]?.rules || {}
        items = this.formatObject2Array(rulesObj)
      }
      this.$set(this.queryList[index], 'rule', undefined)
      this.$set(this.queryList[index], 'ruleItems', items)
    },
    // 设置各项独立的unitItems
    setUnitItems(index) {
      const params = this.queryList[index]
      let items = []
      if (params.rule) {
        items = (params.rule.units || []).map((unit) => ({
          _$value: unit,
          text: this.config.units[unit],
        }))
      }
      this.$set(
        this.queryList[index],
        'unit',
        items.length ? items[0] : undefined,
      )
      this.$set(this.queryList[index], 'unitItems', items)
    },

    // 获取格式化后的params
    getParams(params) {
      const newParams = {
        ...params,
        cluster:
          params.cluster?.text || params.environment?.Cluster.ClusterName,
        namespace: params.environment?.Namespace,
        resource: params.resource._$value,
        rule: params.rule._$value,
        unit: params.unit?._$value,
        topk: this.topk,
        start: this.$moment(this.date[0]).utc().format(),
        end: this.$moment(this.date[1]).utc().format(),
        step: this.step === 'auto' ? undefined : this.step,
      }

      // 设置labelpairs值
      const labelpairs = this.labelpairs[params._$id]
      for (const key in labelpairs) {
        if (labelpairs[key] && labelpairs[key].length) {
          newParams[`labelpairs[${key}]`] = labelpairs[key].reduce(
            (pre, current, index, arr) =>
              pre + current + `${index === arr.length - 1 ? '' : '|'}`,
            '',
          )
        }
      }

      // 移除空值
      for (const key in newParams) {
        if (!newParams[key]) delete newParams[key]
      }

      // 移除标记值
      delete newParams.project
      delete newParams.environment
      delete newParams.environmentItems
      delete newParams.environmentItemsLoading
      delete newParams.ruleItems
      delete newParams.unitItems
      delete newParams.projectItems
      delete newParams._$id
      delete newParams._$origin
      return newParams
    },
    // 设置labelObject
    setLabelObject(query) {
      const data = {}
      const labels = query.rule?.labels || []
      labels.forEach((label) => {
        data[label] = {
          text: label,
          items: [],
          request: false,
        }
      })
      this.$set(this.labelpairs, query._$id, {}) // 清空图表选中值
      this.$set(this.labelObject, query._$id, data)
    },
    // 设置label查询值
    onLabelChange(data, id) {
      this.$set(this.labelpairs[id], data.label, data.value)
      this.onSearch(id, false)
    },
    onClusterChange(index) {
      const query = this.queryList[index]
      const items = query.cluster
        ? this.allProjectList.filter((pro) =>
            pro.environments.some(
              (env) => env.ClusterID === query.cluster.value,
            ),
          )
        : this.allProjectList
      this.$set(query, 'projectItems', items)
      this.$set(query, 'project', undefined)
      this.$set(query, 'environment', undefined)
    },
    async onProjectChange(index) {
      const query = this.queryList[index]
      let envItems = []
      this.$refs[`${query._$id}-form`][0].validate()
      if (query.project) {
        this.$set(query, 'environmentItemsLoading', true)
        const data = await getProjectEnvironmentList(query.project.value, {
          noprocessing: true,
        })
        envItems = query.cluster
          ? data.List.filter((pro) => pro.ClusterID === query.cluster.value)
          : data.List
      }
      this.$set(query, 'environment', undefined)
      this.$set(query, 'environmentItems', envItems)
      this.$set(query, 'environmentItemsLoading', false)
    },
    async getMonitorConfig() {
      let data = null
      if (this.AdminViewport) {
        data = await getSystemConfigData('Monitor')
      } else {
        data = await getMyConfigData('Monitor')
      }

      this.config = data?.content || {}
    },
    async getProjectList() {
      this.projectListLoading = true
      const data = await getProjectList(this.Tenant().ID, { noprocessing: true })
      this.allProjectList = data.List.map((item) => ({
        value: item.ID,
        text: item.ProjectName,
        environments: item.Environments,
      }))
      this.onClusterChange(0)
      this.projectListLoading = false
    },
    async getLabelItems(label, id) {
      if (this.labelObject[id][label]?.request) return
      const query = this.queryList.find((item) => item._$id === id)
      if (query) {
        const params = this.getParams(query)
        params.label = label
        const data = await getMetricsLabelValues(Object.assign(params, {noprocessing: true}))
        this.$set(this.labelObject[id][label], 'items', data)
        this.$set(this.labelObject[id][label], 'request', true)
      }
    },
    async onSearch(id, reset = true) {
      const form = `${id}-form`
      if (this.$refs[form][0].validate(true)) {
        this.$refs.baseDatetimePicker.refresh(false)
        const query = this.queryList.find((item) => item._$id === id)
        // 重置labelpairs
        reset && this.setLabelObject(query)
        const params = this.getParams(query)
        const data = await getMetricsQueryrange(params)
        const origin = deepCopy(query)
        delete origin._$origin

        this.$set(query, '_$origin', origin)
        this.$set(this.metricsObject, id, data)
        this.$set(this.labelpairs, id, this.labelpairs[id] || {})
      }
    },
    async onRefresh(id) {
      const ids = id ? [id] : this.queryList.map((item) => item._$id)
      await Promise.all(ids.map((i) => this.onSearch(i)))
    },
  },
}
</script>

<style lang="scss" scoped>
.queryer {
  display: flex;
  flex-direction: column;
  height: 100%;

  &__header {
    max-height: 64px;
  }

  &__main {
    display: flex;
    flex: 1;
    overflow: hidden;

    &-box {
      position: relative;
      height: 100%;

      &:nth-child(1) {
        max-width: 30%;
        min-width: 30%;
        margin-right: 12px;
      }
      &:nth-child(2) {
        flex: auto;
      }
    }

    &-inner {
      position: absolute;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
      overflow: auto;
    }
  }

  &__panel {
    box-shadow: 0 3px 1px -2px rgb(0 0 0 / 20%),
      0 2px 2px 0 rgb(0 0 0 / 14%),
      0 1px 5px 0 rgb(0 0 0 / 12%);

    &-search {
      text-align: right;
    }
  }
}
</style>
