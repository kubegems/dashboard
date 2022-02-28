<template>
  <v-flex class="ma-0">
    <span class="ml-3 mr-2 text-body-2">选择标签</span>
    <span
      v-for="(labelObj, label) in labels"
      :key="label"
    >
      <v-btn
        v-if="showLabel(label)"
        x-small
        light
        color="primary"
        class="ml-1"
        :outlined="!labelObj.selected"
        :disabled="
          Object.keys(labelObj.labelValues).length === 0 && disableLabelClick
        "
        @click="chooseLabel(label, labelObj)"
      >
        {{
          Object.keys(labelObj.labelValues).length > 0
            ? `${label}(${Object.keys(labelObj.labelValues).length})`
            : `${label}`
        }}
      </v-btn>
    </span>
    <!-- 遍历标签值 -->
    <v-card-text v-if="showLabelValueCard">
      <v-row class="mx-1">
        <v-col
          v-for="(label, index) in Object.keys(labels).filter((l) => {
            return l !== 'tenant'
          })"
          v-show="labels[label].selected"
          :key="index"
          cols="2"
          class="mb-2 vcol"
        >
          <template v-if="showLabelValue(label, labels[label])">
            <div class="d-flex justify-content-between">
              <v-chip
                dense
                small
                color="primary"
                class="font-weight-medium flex-auto"
              >
                {{
                  Object.keys(labels[label].labelValues).length > 0
                    ? `${label}(${
                      Object.keys(labels[label].labelValues).length
                    })`
                    : `${label}`
                }}
              </v-chip>
              <v-text-field
                v-if="Object.keys(labels[label].labelValues).length > 5"
                v-model="labels[label].search"
                solo
                dense
                hide-details
                flat
                clearable
                color="primary"
                class="search-filter"
                label="搜索"
              />
            </div>

            <v-list
              flat
              dense
              height="300"
              class="overflow-y-auto overflow-x-auto"
            >
              <v-list-item
                v-for="(labelValueObj, labelValue) in labels[label].labelValues"
                v-show="
                  !labels[label].search ||
                    labelValue.includes(labels[label].search)
                "
                :key="labelValue"
                dense
                class="mx-0 px-0"
              >
                <span
                  v-if="renderLabelValue"
                  :class="
                    labelValueObj.selected
                      ? 'item-selected item'
                      : 'item-noselected item'
                  "
                  @click="clickLabelValues(label, labelValue, labelValueObj)"
                >
                  <EllipsisLabel :text="labelValue" />
                </span>
              </v-list-item>
            </v-list>
          </template>
        </v-col>
      </v-row>
    </v-card-text>
    <v-btn
      absolute
      right
      bottom
      text
      color="error"
      class="margin-r32"
      @click="clearLabels"
    >
      清空
    </v-btn>
    <v-btn
      absolute
      right
      bottom
      text
      color="primary"
      class="margin-r16"
      @click="refreshLabel"
    >
      刷新
    </v-btn>
    <v-btn
      absolute
      right
      bottom
      text
      color="primary"
      @click="confirmLabels"
    >
      确认
    </v-btn>
  </v-flex>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
import { getLogLabels } from '@/api'
import EllipsisLabel from './EllipsisLabel'

export default {
  name: 'LogLabelFilter',
  components: {
    EllipsisLabel,
  },
  props: {
    currentCluster: {
      type: Object,
      default: () => {},
    },
  },

  data: () => ({
    labels: {},
    match: '',
    renderLabelValue: true,
    disableLabelClick: false,
    initSeries: {},
  }),
  computed: {
    ...mapState(['Progress', 'JWT', 'User', 'AdminViewport']),
    ...mapGetters(['Tenant']),
    logLabelClusterKey() {
      return process.env.VUE_APP_LOG_LABEL_CLUSTER_KEY
    },
    // 返回所有已选中的label数组
    selectedLabel() {
      const tmp = []
      for (const label in this.labels) {
        if (this.labels[label].selected) {
          tmp.push(label)
        }
      }
      return tmp
    },
    // 选中的标签值列表
    selectedLabelValueList() {
      const tmp = []
      for (const label in this.labels) {
        if (this.labels[label].selected) {
          for (const labelValue in this.labels[label].labelValues) {
            if (this.labels[label].labelValues[labelValue].selected) {
              tmp.push({ label: label, labelValue: labelValue })
            }
          }
        }
      }
      return tmp
    },
    selectedLabelValueListWithDefault() {
      const tmp = {
        [process.env.VUE_APP_LOG_LABEL_CLUSTER_KEY]: [this.currentCluster.text],
      }
      for (const label in this.labels) {
        if (this.labels[label].selected) {
          tmp[label] = []
          for (const labelValue in this.labels[label].labelValues) {
            if (this.labels[label].labelValues[labelValue].selected) {
              tmp[label].push(labelValue)
            }
          }
        }
      }
      return tmp
    },
    showLabelValueCard() {
      return (
        this.selectedLabel &&
        this.selectedLabel.filter((l) => {
          return l !== 'tenant'
        }).length > 0
      )
    },
  },
  methods: {
    async refreshLabel() {
      this.$emit('refresh')
    },
    showLabel(label) {
      return this.AdminViewport ? true : label !== 'tenant'
    },
    showLabelValue(label, labelObj) {
      return this.AdminViewport
        ? labelObj.selected
        : labelObj.selected && label !== 'tenant'
    },
    // eslint-disable-next-line vue/no-unused-properties
    async logLabels(getdata) {
      const data = await getLogLabels(getdata.ClusterName, getdata)
      data.forEach((label) => {
        if (label !== '__name__') {
          this.$set(this.labels, label, {
            selected: false,
            search: '',
            labelValues: {},
          })
        }
      })
      if (!this.AdminViewport) {
        this.labels['tenant'].selected = true
        this.$set(this.labels['tenant'].labelValues, this.Tenant().TenantName, {
          selected: true,
        })
      }
      this.updateMatch()
    },
    // eslint-disable-next-line vue/no-unused-properties
    async getLabels(cluster) {
      const data = await getLogLabels(cluster.text, {
        ClusterID: cluster.value,
        ClusterName: cluster.text,
        start:
          Date.parse(
            this.$moment(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).utc(),
          ) + '000000',
        end: Date.parse(this.$moment(new Date(Date.now())).utc()) + '000000',
        noprocessing: true,
      })
      // 去掉集群和租户标签
      data.forEach((label) => {
        if (label !== '__name__' && label !== `${this.logLabelClusterKey}`) {
          this.$set(this.labels, label, {
            selected: false,
            labelValues: {},
          })
        }
      })
      if (!this.AdminViewport && this.labels['tenant']) {
        this.labels['tenant'].selected = true
        this.$set(this.labels['tenant'].labelValues, this.Tenant().TenantName, {
          selected: true,
        })
      }
      this.updateMatch()
    },
    initLogLabelValues(data) {
      if (data.length) {
        this.initSeries = data
        if (Object.keys(this.labels).length > 0) {
          data.forEach((item) => {
            for (const k in item) {
              if (this.labels[k] && !this.labels[k].labelValues[item[k]]) {
                this.$set(this.labels[k].labelValues, item[k], {
                  selected: false,
                })
              }
            }
          })
        }
      }
      this.disableLabelClick = true
    },
    // eslint-disable-next-line vue/no-unused-properties
    clear() {
      this.labels = {}
    },

    async chooseLabel(label, labelObj) {
      labelObj.selected = !labelObj.selected
      // 如果是取消标签选中
      if (!labelObj.selected) {
        for (const labelValue in this.labels[label].labelValues) {
          this.$set(
            this.labels[label].labelValues[labelValue],
            'selected',
            false,
          )
        }
        // 如果没有任何标签选中,则复原标签
        if (this.selectedLabel.length === 0) {
          this.initLogLabelValues(this.initSeries)
        }
        this.updateMatch()
      }
    },
    // 根据label返回该label所有选中的label值数组
    getSelectedValuesByLabel(label) {
      if (
        this.labels[label] &&
        Object.keys(this.labels[label].labelValues).length > 0
      ) {
        return Object.keys(this.labels[label].labelValues).filter(
          (labelValue) => this.labels[label].labelValues[labelValue].selected,
        )
      } else {
        return []
      }
    },
    updateMatch() {
      let matchStr = ''
      for (const label in this.labels) {
        const labelValueSelect = this.getSelectedValuesByLabel(label)
        if (labelValueSelect.length === 1) {
          matchStr !== ''
            ? (matchStr = matchStr + ',' + `${label}="${labelValueSelect}"`)
            : (matchStr = `${label}="${labelValueSelect}"`)
        } else if (labelValueSelect.length > 1) {
          matchStr !== ''
            ? (matchStr =
                matchStr + ',' + `${label}=~"${labelValueSelect.join('|')}"`)
            : (matchStr = `${label}=~"${labelValueSelect.join('|')}"`)
        }
      }
      // 添加集群
      if (matchStr === '') {
        this.match = `{${this.logLabelClusterKey}="${this.currentCluster.text}"}`
      } else {
        this.match = `{${matchStr},${this.logLabelClusterKey}="${this.currentCluster.text}"}`
      }
      this.$emit('updateMatch', this.match)
    },
    // 检查series对象是否满足当前选中的标签和标签值
    checkObjContain(obj, selectedObj) {
      let contain = true
      Object.keys(selectedObj).forEach((k) => {
        if (!obj[k]) contain = false
        // 当前series对象键对应的值要出现在选中的标签键对应的值列表中
        if (selectedObj[k].length > 0) {
          if (
            !selectedObj[k].some((labelValue) => {
              return labelValue === obj[k]
            })
          ) {
            contain = false
          }
        }
      })
      return contain
    },
    async clickLabelValues(labelClick, labelValue, labelValueObj) {
      this.$set(labelValueObj, 'selected', !labelValueObj.selected)
      this.$emit('clickLabelValues', labelClick, labelValue)
      this.updateMatch()
      const filteredSeries = this.initSeries.filter((item) => {
        return this.checkObjContain(
          item,
          this.selectedLabelValueListWithDefault,
        )
      })
      for (const label in this.labels) {
        // 清除其他标签对应的标签值,保留选中状态
        if (label !== labelClick) {
          for (const labelValue in this.labels[label].labelValues) {
            if (!this.labels[label].labelValues[labelValue].selected) {
              this.$delete(this.labels[label].labelValues, labelValue)
            }
          }
        }
        filteredSeries.forEach((labelNew) => {
          const labelValueFind = labelNew[label]
          // 如果原来的labels不包含新的labelValue则添加该labelValue
          if (
            labelValueFind &&
            !this.labels[label].labelValues[labelValueFind]
          ) {
            if (label !== labelClick) {
              // 排除当前操作的标签
              this.$set(this.labels[label].labelValues, labelValueFind, {
                selected: false,
              })
            }
          }
        })
      }
      // 如果没有一个标签值被选中, 则用初始series初始化一次,租户视图最小长度为1,管理员最小长度为0
      const minLabelValueLen = this.AdminViewport ? 0 : 1
      if (this.selectedLabelValueList.length === minLabelValueLen) {
        this.initLogLabelValues(this.initSeries)
      }
    },
    // eslint-disable-next-line vue/no-unused-properties
    deleteLabelValue(label, value) {
      if (this.labels[label] && this.labels[label].labelValues[value]) {
        this.renderLabelValue = false
        this.labels[label].labelValues[value].selected = false
        this.renderLabelValue = true
        if (this.getSelectedValuesByLabel(label).length === 0) {
          this.labels[label].selected = false
        }
      }
      this.updateMatch()
    },
    closeExpand() {
      this.$emit('closeExpand')
    },
    clearLabels() {
      for (const label in this.labels) {
        if ((!this.AdminViewport && label !== 'tenant') || this.AdminViewport) {
          for (const labelValue in this.labels[label].labelValues) {
            this.$set(
              this.labels[label].labelValues[labelValue],
              'selected',
              false,
            )
          }
        }
        this.labels[label].selected = false
      }
      this.updateMatch()
      this.$emit('confirmLabels', this.selectedLabelValueList)
      this.initLogLabelValues(this.initSeries)
      this.$emit('logqlReset')
    },
    confirmLabels() {
      this.$emit('confirmLabels', this.selectedLabelValueList)
      this.closeExpand()
    },

    // 暴露设置值的方法
    // eslint-disable-next-line vue/no-unused-properties
    setLabelValue(label, value) {
      if (
        this.labels[label] &&
        this.labels[label].labelValues[value] &&
        !this.labels[label].labelValues[value].selected
      ) {
        this.$set(this.labels[label], 'selected', true)
        this.$set(this.labels[label].labelValues[value], 'selected', true)
        this.$emit('confirmLabels', this.selectedLabelValueList)
        this.updateMatch()
        return true
      }
      return false
    },
  },
}
</script>

<style lang="scss" scoped>
.word-no-break {
  white-space: nowrap;
}
.word-keep-all {
  word-break: keep-all;
}
.item {
  max-width: 100%;
  text-align: center;
  background-color: #f0f4f7;
  white-space: nowrap;
  border-radius: 3px;
  padding: 0 8px;
  line-height: inherit;
  cursor: pointer;
}
.item-noselected {
  background-color: #f0f4f7;
}
.item-selected {
  background-color: #00bcd4;
  color: white;
}
.vcol {
  border-left: 1px solid rgba(200, 200, 200, 0.3);
}
span:hover.item-noselected {
  background-color: rgb(224, 234, 240);
  border-radius: 3px;
}

.margin-r32 {
  margin-right: 128px;
}
.margin-r16 {
  margin-right: 64px;
}

.search-filter {
  width: 1px;
  margin-left: 24px;

  ::v-deep {
    .v-input__control {
      min-height: 24px !important;
    }
  }
}
</style>
