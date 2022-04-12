<template>
  <v-form
    ref="form"
    v-model="valid"
    lazy-validation
    class="my-2"
  >
    <v-expand-transition>
      <v-card
        v-show="expand"
        class="my-2 pa-2 kubegems__expand-transition"
        :elevation="4"
      >
        <v-card-text class="pa-0">
          <v-sheet class="pt-2 px-2">
            <v-flex
              class="float-left text-subtitle-2 pt-6 primary--text kubegems__min-width"
            >
              <span>告警级别</span>
            </v-flex>
            <v-flex class="float-left ml-2 kubegems__form-width">
              <v-autocomplete
                v-model="alertLevel.severity"
                color="primary"
                :items="severitySelect"
                label="告警级别"
                hide-selected
                :rules="alertLevelRules.severityRule"
                no-data-text="暂无可选数据"
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
            </v-flex>
            <v-flex class="float-left ml-2 kubegems__form-width">
              <v-autocomplete
                v-model="alertLevel.compareOp"
                color="primary"
                :items="comepareSelect"
                label="触发条件"
                hide-selected
                no-data-text="暂无可选数据"
                :rules="alertLevelRules.compareRule"
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
            </v-flex>
            <v-flex
              class="float-left text-subtitle-2 pt-4 primary--text kubegems__min-width"
            />
            <v-flex class="float-left ml-2 kubegems__form-width">
              <v-text-field
                v-model="alertLevel.compareValue"
                required
                label="阈值"
                :rules="alertLevelRules.compareValueRule"
              />
            </v-flex>
            <div class="kubegems__clear-float" />
          </v-sheet>
        </v-card-text>
        <v-card-actions class="pa-0">
          <v-spacer />
          <v-btn
            text
            small
            color="error"
            @click="closeCard"
          >
            取消
          </v-btn>
          <v-btn
            text
            small
            color="primary"
            @click="addData"
          >
            保存
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-expand-transition>
  </v-form>
</template>

<script>
import { deepCopy } from '@/utils/helpers'
import { required } from '@/utils/rules'

export default {
  name: 'AlertLevelForm',
  props: {
    data: {
      type: Array,
      default: () => null,
    },
  },
  data() {
    return {
      valid: false,
      expand: false,
      alertLevelCopy: [],
      alertLevel: {
        index: -1,
        compareOp: '>',
        compareValue: '',
        severity: 'error',
      },
      alertLevelRules: {
        nameRule: [required],
        metricRule: [required],
        forRule: [
          (v) =>
            !!new RegExp('(^\\d+[s|m|h]$)').test(v) ||
            '格式错误(示例:30s,1m,1h)',
        ],
        compareRule: [required],
        severityRule: [required],
        compareValueRule: [required],
      },
      comepareSelect: [
        { text: '大于', value: '>' },
        { text: '大于或等于', value: '>=' },
        { text: '小于', value: '<' },
        { text: '小于或等于', value: '<=' },
        { text: '等于', value: '==' },
        { text: '不等于', value: '!=' },
      ],
      severitySelect: [
        { text: '重要', value: 'error' },
        { text: '紧急', value: 'critical' },
      ],
    }
  },
  watch: {
    data() {
      this.alertLevelCopy = deepCopy(this.data)
    },
  },
  mounted() {
    if (this.data) {
      this.alertLevelCopy = deepCopy(this.data)
    }
  },
  methods: {
    // eslint-disable-next-line vue/no-unused-properties
    init(data) {
      this.alertLevel = data
      this.expand = true
    },
    addData() {
      if (this.$refs.form.validate(true)) {
        if (this.alertLevel.index === -1) {
          const alertLevel = {
            compareOp: this.alertLevel.compareOp,
            compareValue: this.alertLevel.compareValue + '',
            severity: this.alertLevel.severity,
          }
          this.alertLevelCopy.push(alertLevel)
        } else {
          const alertLevel = this.alertLevelCopy[this.alertLevel.index]
          alertLevel.compareOp = this.alertLevel.compareOp
          alertLevel.compareValue = this.alertLevel.compareValue + ''
          alertLevel.severity = this.alertLevel.severity
          this.$set(this.alertLevelCopy, this.alertLevel.index, alertLevel)
        }
        this.$emit('addData', this.alertLevelCopy)
        this.closeCard()
      }
    },
    closeCard() {
      this.expand = false
      this.$refs.form.reset()
      this.alertLevel.index = -1
      this.$emit('closeOverlay')
    },
    // eslint-disable-next-line vue/no-unused-properties
    expandCard() {
      this.expand = true
    },
  },
}
</script>
