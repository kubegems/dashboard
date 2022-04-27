<template>
  <v-menu
    v-model="showPicker"
    :close-on-content-click="false"
    bottom
    left
    offset-y
    origin="top center"
    transition="scale-transition"
    nudge-bottom="5px"
    :disabled="disabled"
    @input="onMenuInput"
  >
    <template #activator="{ on }">
      <v-btn
        depressed
        :color="color"
        :class="color === 'white' ? 'primary--text' : `white--text`"
        :small="small"
        dark
        v-on="on"
      >
        {{ label }}
        <v-icon right>fas fa-angle-{{ showPicker ? 'up' : 'down' }}</v-icon>
      </v-btn>
    </template>

    <v-card width="480px" class="pa-3">
      <v-row>
        <!-- 快捷选项 -->
        <v-col cols="3">
          <v-list-item
            v-for="item in dateShortcutOptions"
            :key="item.value"
            class="v-list-item__title text-caption font-weight-medium"
            :class="{
              'v-item--active v-list-item--active': shortcut === item.value,
            }"
            style="min-height: 40px;"
            color="primary"
            @click="shortcutDate(item)"
          >
            {{ item.text }}
          </v-list-item>
        </v-col>
        <!-- 快捷选项 -->

        <v-divider vertical class="my-4" />

        <!-- 选择面板 -->
        <v-col cols="9">
          <div class="time-label">
            起止时间(格式：1、12、12:30、12:30:30、1230、123030)
          </div>
          <v-divider class="mb-2" />
          <div class="d-flex align-center">
            <v-combobox
              v-model="time[0]"
              label="开始时间"
              :items="timeShortcutOptions"
              hide-details
              solo
              flat
              dense
              attach
              @blur="onComboboxBlur($event, 0)"
              @change="onTouchChange"
            >
            </v-combobox>
            <span class="mx-2">~</span>
            <v-combobox
              v-model="time[1]"
              label="结束时间"
              :items="timeShortcutOptions"
              hide-details
              solo
              flat
              dense
              attach
              @blur="onComboboxBlur($event, 1)"
              @change="onTouchChange"
            >
            </v-combobox>
          </div>
          <v-date-picker
            v-model="date"
            range
            no-title
            flat
            locale="zh-cn"
            class="mt-4"
            @change="onTouchChange"
          />
        </v-col>
        <!-- 选择面板 -->
      </v-row>

      <!-- 确认 -->
      <v-divider class="my-1" />
      <v-card-actions class="pa-0">
        <v-spacer />
        <v-btn v-if="clearable" text color="error" @click="clear">清空</v-btn>
        <v-btn text color="primary" @click="confirm">确定</v-btn>
      </v-card-actions>
      <!-- 确认 -->
    </v-card>
  </v-menu>
</template>

<script>
import { formatDatetime } from '@/utils/helpers'

export default {
  name: 'BaseDatetimePicker',
  props: {
    value: {
      type: Array,
      default: () => [],
    },
    // 默认值（设置默认相对时间，分钟为单位，仅在组件初始化时生效）
    defaultValue: {
      type: Number,
      default: undefined,
    },
    // 数据格式化
    valueFormat: {
      type: String,
      default: 'timestamp',
    },
    // 值改变时是否自动映射到query
    valueChangeToQuery: {
      type: Boolean,
      default: false,
    },
    // 默认值从query中读取
    defaultValueForQuery: {
      type: Boolean,
      default: false,
    },
    // 从query中读取值开始时间的key
    queryStartTimeKey: {
      type: String,
      default: 'timeStart',
    },
    // 从query中读取值结束时间的key
    queryEndTimeKey: {
      type: String,
      default: 'timeEnd',
    },
    // 是否可清空
    clearable: {
      type: Boolean,
      default: false,
    },
    // 关闭卡片式还原状态
    onCloseRestoreState: {
      type: Boolean,
      default: true,
    },
    // 颜色
    color: {
      type: String,
      default: 'white',
      validator: (v) =>
        ['white', 'primary', 'success', 'error', 'warning'].includes(v),
    },
    // 小尺寸
    small: {
      type: Boolean,
      default: true,
    },
    // 禁用
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    this.dateShortcutOptions = [
      { text: '最近5分钟', value: 5, type: 'relative' },
      { text: '最近15分钟', value: 15, type: 'relative' },
      { text: '最近30分钟', value: 30, type: 'relative' },
      { text: '最近1小时', value: 60, type: 'relative' },
      { text: '最近3小时', value: 180, type: 'relative' },
      { text: '最近6小时', value: 360, type: 'relative' },
      { text: '最近12小时', value: 720, type: 'relative' },
      { text: '最近24小时', value: 1440, type: 'relative' },
      { text: '最近2天', value: 2880, type: 'relative' },
      { text: '最近1周', value: 10080, type: 'relative' },
    ]

    this.state = {}

    return {
      showPicker: false,
      datetime: [],
      date: [],
      time: ['00:00:00', '23:59:59'],
      type: this.defaultValue ? 'relative' : 'absolute',
      shortcut: this.defaultValue,
      timeShortcutOptions: [],
      touch: false, // 记录用户是否手动输入过时间
    }
  },
  computed: {
    label() {
      if (!this.datetime.length) {
        return '请选择日期时间范围'
      }
      if (this.type === 'relative' && this.shortcut) {
        return (
          this.dateShortcutOptions.find((item) => item.value === this.shortcut)
            ?.text || `最近${this.shortcut}分钟`
        )
      } else {
        return `${formatDatetime(
          this.datetime[0],
          'yyyy-MM-dd hh:mm:ss',
        )} - ${formatDatetime(this.datetime[1], 'yyyy-MM-dd hh:mm:ss')}`
      }
    },
  },
  watch: {
    value(newValue) {
      if (
        newValue[0] !== this.datetime[0] ||
        newValue[1] !== this.datetime[1]
      ) {
        this.type = 'absolute'
        this.shortcut = undefined
        this.setDatetime(newValue[0], newValue[1])
      }
    },
  },
  mounted() {
    this.generateTimeShortcutOptions()
    this.setDatetime(this.value[0], this.value[1])
    this.setDatetimeByShortcut()
    this.setDatetimeByQuery()
    this.emit(false)
  },
  methods: {
    // 生成快捷选项
    generateTimeShortcutOptions() {
      const opts = []
      for (let i = 0; i < 24; i++) {
        const h = i.toString().padStart(2, '0')
        opts.push(`${h}:00:00`, `${h}:30:00`)
      }
      this.timeShortcutOptions = opts
    },
    // 设置date、time及datetime的值
    setDatetime(start, end) {
      if (start && end) {
        this.datetime = [
          formatDatetime(start, this.valueFormat),
          formatDatetime(end, this.valueFormat),
        ]
        this.date = [
          formatDatetime(start, 'yyyy-MM-dd'),
          formatDatetime(end, 'yyyy-MM-dd'),
        ]
        this.time = [
          formatDatetime(start, 'hh:mm:ss'),
          formatDatetime(end, 'hh:mm:ss'),
        ]
      }
    },
    // 根据query中设置值
    setDatetimeByQuery() {
      if (!this.defaultValueForQuery) return
      let start =
        Number(this.$route.query[this.queryStartTimeKey]) ||
        Date.parse(new Date(this.$route.query[this.queryStartTimeKey]))
      let end =
        Number(this.$route.query[this.queryEndTimeKey]) ||
        Date.parse(new Date(this.$route.query[this.queryEndTimeKey]))
      if (start && end) {
        start = new Date(start).getTime()
        end = new Date(end).getTime()
        const s = start < end ? start : end
        const e = start > end ? start : end
        this.setDatetime(s, e)
        this.type = 'absolute'
        this.shortcut = undefined
      }
    },
    // 根据快捷选项设置值
    setDatetimeByShortcut() {
      if (this.shortcut) {
        const end = Date.now()
        const start = end - this.shortcut * 60 * 1000
        this.setDatetime(start, end)
        this.type = 'relative'
      }
    },
    // 保存状态
    saveState() {
      this.state = {
        datetime: [...this.datetime],
        date: [...this.date],
        time: [...this.time],
        type: this.type,
        shortcut: this.shortcut,
        touch: this.touch,
      }
    },
    // 恢复状态
    restoreState() {
      this.datetime = this.state.datetime
      this.date = this.state.date
      this.time = this.state.time
      this.type = this.state.type
      this.shortcut = this.state.shortcut
      this.touch = this.state.touch
      this.state = {}
    },
    // 菜单v-model内部发生变更
    onMenuInput(value) {
      if (value) {
        this.saveState()
      } else {
        if (this.onCloseRestoreState) {
          this.restoreState()
        }
      }
    },
    // 触碰标记
    onTouchChange() {
      this.touch = true
    },
    // 失焦验证
    onComboboxBlur(e, type) {
      const value = e.target.value
      let time = ''
      switch (true) {
        // 验证1~2位数字格式(1、12)
        case new RegExp('^([0-9]|[0-1][0-9]|2[0-3])$').test(value): {
          time = `${value.padStart(2, '0')}:00:00`
          break
        }
        // 验证4位数字格式(1230)
        case new RegExp('^([0-9]|[0-1][0-9]|2[0-3])?[0-5][0-9]$').test(value): {
          const str = value.padStart(4, '0')
          time = `${str.slice(0, 2)}:${str.slice(2, 4)}:00`
          break
        }
        // 验证6位数字(123034)
        case new RegExp('^([0-9]|[0-1][0-9]|2[0-3])?([0-5][0-9]){2}$').test(value): {
          const str = value.padStart(6, '0')
          time = `${str.slice(0, 2)}:${str.slice(2, 4)}:${str.slice(4, 6)}`
          break
        }
        // 验证时分格式(12:30)
        case new RegExp('^([0-9]|[0-1][0-9]|2[0-3])?:[0-5][0-9]$').test(value): {
          const str = value.padStart(5, '0')
          time = `${str}:00`
          break
        }
        // 验证时分秒格式(12:30:30)
        case new RegExp('^([0-9]|[0-1][0-9]|2[0-3])?(:[0-5][0-9]){2}$').test(value): {
          time = value.padStart(8, '0')
          break
        }
        // 格式错误
        default: {
          time = type === 0 ? '00:00:00' : '23:59:59'
        }
      }
      if (this.time[type] !== time) {
        this.touch = true
        this.$set(this.time, type, time)
      }
    },
    // 验证时间顺序
    checkDatetime() {
      if (this.datetime.length === 0) return
      let start = new Date(this.datetime[0]).getTime()
      let end = new Date(this.datetime[1]).getTime()
      if (start > end) {
        const v = [...this.datetime]
        this.datetime = [v[1], v[0]]
        if (this.date[0] === this.date[1]) {
          this.time = [
            formatDatetime(v[1], 'hh:mm:ss'),
            formatDatetime(v[0], 'hh:mm:ss'),
          ]
        } else {
          this.date = [
            formatDatetime(v[1], 'yyyy-MM-dd'),
            formatDatetime(v[0], 'yyyy-MM-dd'),
          ]
        }
      }
    },
    // 检查是否手动触碰值
    checkTouch() {
      if (this.touch) {
        this.type = 'absolute'
        this.shortcut = undefined
      }
      this.touch = false
    },
    // 快捷日期
    shortcutDate(item) {
      this.type = item.type
      this.shortcut = item.value
      this.setDatetimeByShortcut()
      this.emit()
      this.touch = false
      this.showPicker = false
    },
    // input、change事件分发
    emit(emitChange = true) {
      if (this.valueChangeToQuery) {
        this.$router.replace({
          name: this.$route.name,
          query: {
            ...this.$route.query,
            [this.queryStartTimeKey]: this.datetime[0],
            [this.queryEndTimeKey]: this.datetime[1],
          },
        })
      }
      this.$emit('input', [...this.datetime])
      if (emitChange) {
        this.$emit('change', [...this.datetime])
      }
    },
    // 取消
    cancel() {
      this.restoreState()
      this.showPicker = false
    },
    // 确认
    confirm() {
      if (this.date.length === 0) {
        this.touch = true
        this.datetime = []
      } else {
        if (this.date.length === 1) {
          this.touch = true
          this.date = [this.date[0], this.date[0]]
        }
        this.datetime = [
          new Date(`${this.date[0]} ${this.time[0]}`).getTime(),
          new Date(`${this.date[1]} ${this.time[1]}`).getTime(),
        ]
      }
      this.checkDatetime()
      this.emit()
      this.checkTouch()
      this.showPicker = false
    },

    /**
     * 支持组件实例调用方法
     */
    // 清空值
    clear(emitChange = true) {
      this.datetime = []
      this.date = []
      this.time = ['00:00:00', '23:59:59']
      this.shortcut = undefined
      this.type = 'absolute'
      this.showPicker = false
      this.touch = false
      this.emit(emitChange)
    },
    // 相对时间更新值
    refresh(emitChange) {
      if (this.type === 'relative') {
        this.setDatetimeByShortcut()
        this.emit(emitChange)
      }
    },
    // 设置快捷值
    setShortcut(value) {
      this.shortcut = value || 5
      this.shortcutDate()
    },
  },
}
</script>

<style lang="scss" scoped>
.time-label {
  height: 20px;
  line-height: 20px;
  font-size: 12px;
  color: rgba(#000000, 0.6);
  margin-bottom: 4px;
}

.v-picker--date {
  box-shadow: none !important;
}
</style>
