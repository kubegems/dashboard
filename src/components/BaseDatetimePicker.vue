<template>
  <v-menu
    v-model="menu"
    :close-on-content-click="false"
    bottom
    left
    offset-y
    origin="top center"
    transition="scale-transition"
    nudge-bottom="5px"
    :disabled="disabled"
  >
    <template #activator="{ on }">
      <v-btn
        depressed
        :color="white ? 'white' : 'primary'"
        :class="white ? 'primary--text' : 'white--text'"
        :small="small"
        dark
        v-on="on"
      >
        {{ dateRangeStr }}
        <v-icon v-if="menu" right>fas fa-angle-up</v-icon>
        <v-icon v-else right>fas fa-angle-down</v-icon>
      </v-btn>
    </template>
    <v-card width="450px">
      <v-row>
        <v-col cols="3">
          <v-list dense class="ml-2 mt-2">
            <v-list-item-group v-model="quickSelect" color="primary">
              <v-list-item
                v-for="(item, i) in quickTimeItems"
                :key="i"
                @click="changeQuickTime(item.value)"
                class="text-left pa-0 px-1"
              >
                <v-list-item-content class="pa-0">
                  <v-list-item-title
                    class="text-caption"
                    v-text="item.text"
                  ></v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </v-list-item-group>
          </v-list>
        </v-col>
        <v-divider vertical class="my-6" />
        <v-col cols="9" class="pl-1">
          <v-flex class="pt-3">
            <v-text-field
              v-model="tRangeStr"
              class="date-select"
              label="起止时间(示例09:00:00,11:00:00)"
            ></v-text-field>
            <v-date-picker
              v-model="dDate"
              range
              no-title
              flat
              locale="zh-cn"
              @change="onDateChange"
            ></v-date-picker>
          </v-flex>
        </v-col>
      </v-row>
      <v-divider class="mx-2" />
      <v-card-actions>
        <v-spacer />
        <v-btn text color="error" @click="cancelDatePicker">取消</v-btn>
        <v-btn text color="primary" @click="checkDatePicker"> 确定 </v-btn>
      </v-card-actions>
    </v-card>
  </v-menu>
</template>

<script>
import { formatDatetime, parserDatetime } from '@/utils/helpers'

export default {
  name: 'BaseDatetimePicker',
  props: {
    disabled: {
      type: Boolean,
      default: false,
    },
    quicktimeindex: {
      type: Number,
      default: () => 2,
    },
    subtitle: {
      type: Boolean,
      default: () => true,
    },
    white: {
      type: Boolean,
      default: () => true,
    },
    small: {
      type: Boolean,
      default: () => true,
    },
  },
  data: () => ({
    lastDateRange: [
      formatDatetime(
        new Date(new Date().setMinutes(new Date().getMinutes() - 5)),
        'yyyy-MM-dd hh:mm:ss',
      ),
      formatDatetime(new Date(), 'yyyy-MM-dd hh:mm:ss'),
    ],
    dateRange: [
      formatDatetime(
        new Date(new Date().setMinutes(new Date().getMinutes() - 5)),
        'yyyy-MM-dd hh:mm:ss',
      ),
      formatDatetime(new Date(), 'yyyy-MM-dd hh:mm:ss'),
    ],
    dDate: [],
    dStart: '',
    dEnd: '',
    tRangeStr: '',
    menu: false,
    quickSelect: 2,
    quickTime: 30,
    quickTimeItems: [
      { text: '最近5分钟', value: 5 },
      { text: '最近15分钟', value: 15 },
      { text: '最近30分钟', value: 30 },
      { text: '最近1小时', value: 60 },
      { text: '最近3小时', value: 180 },
      { text: '最近6小时', value: 360 },
      { text: '最近12小时', value: 720 },
      { text: '最近24小时', value: 1440 },
      { text: '最近2天', value: 2880 },
      { text: '最近1周', value: 10080 },
    ],
    quick: true,
    dateStart: '',
    dateEnd: '',
    timeStart: '',
    timeEnd: '',
  }),
  computed: {
    dateRangeStr() {
      if (this.quick && this.quickSelect) {
        return this.quickTimeItems[this.quickSelect].text
      }
      if (this.dateRange[0] !== undefined && this.dateRange[1] !== undefined) {
        return (
          formatDatetime(parserDatetime(this.dateRange[0]), 'MM-dd hh:mm:ss') +
          '～' +
          formatDatetime(parserDatetime(this.dateRange[1]), 'MM-dd hh:mm:ss')
        )
      } else return ''
    },
    tRange() {
      if (
        new RegExp(
          '^[0-2][0-9]:[0-5][0-9]:[0-5][0-9],[0-2][0-9]:[0-5][0-9]:[0-5][0-9]$',
          'g',
        ).test(this.tRangeStr.trim())
      ) {
        return this.tRangeStr.split(',')
      }
      return []
    },
  },
  mounted() {
    this.changeQuickTime()
  },
  methods: {
    changeQuickTime(val) {
      if (val !== undefined) {
        this.quickSelect = this.quickTimeItems.findIndex((q) => {
          return q.value === val
        })
        this.quickTime = val
      } else {
        this.quickSelect = this.quicktimeindex
        this.quickTime = this.quickTimeItems[this.quicktimeindex].value
      }
      const end = new Date()
      const start = new Date(
        new Date().setMinutes(new Date().getMinutes() - this.quickTime),
      )

      this.dateRange = [
        formatDatetime(start, 'yyyy-MM-dd hh:mm:ss'),
        formatDatetime(end, 'yyyy-MM-dd hh:mm:ss'),
      ]
      this.dStart = formatDatetime(start, 'yyyy-MM-dd')
      this.dEnd = formatDatetime(end, 'yyyy-MM-dd')
      this.dDate = [this.dStart, this.dEnd]
      this.tRangeStr =
        formatDatetime(start, 'hh:mm:ss') +
        ',' +
        formatDatetime(end, 'hh:mm:ss')
      this.lastDateRange = this.dateRange
      this.quick = true
      this.menu = false
      this.$emit('date', this.dateRange[0], this.dateRange[1], this.quickSelect)
    },
    onDateChange() {
      const dateStart = formatDatetime(
        parserDatetime(this.dDate[0]),
        'yyyy-MM-dd 00:00:00',
      )
      const dateEnd = formatDatetime(
        parserDatetime(this.dDate[1]),
        'yyyy-MM-dd 00:00:00',
      )
      this.dateRange[0] = dateStart
      this.dateRange[1] = dateEnd
    },
    checkDatePicker() {
      if (
        new RegExp(
          '^[0-2][0-9]:[0-5][0-9]:[0-5][0-9],[0-2][0-9]:[0-5][0-9]:[0-5][0-9]$',
          'g',
        ).test(this.tRangeStr.trim()) === false
      ) {
        this.$store.commit('SET_SNACKBAR', {
          text: '时间格式有误',
          color: 'warning',
        })
        return
      }
      const dateStart = this.dateRange[0].substr(0, 10) + ' ' + this.tRange[0]
      const dateEnd = this.dateRange[1].substr(0, 10) + ' ' + this.tRange[1]
      this.dateRange = [dateStart, dateEnd]

      if (
        Date.parse(parserDatetime(this.dateRange[1])) <=
        Date.parse(parserDatetime(this.dateRange[0]))
      ) {
        this.$store.commit('SET_SNACKBAR', {
          text: '截止时间超过起始时间，请重新选择',
          color: 'warning',
        })
        return
      }
      this.$set(this.dateRange, 0, this.dateRange[0])
      this.$set(this.dateRange, 1, this.dateRange[1])
      this.lastDateRange = this.dateRange
      this.$emit('date', this.dateRange[0], this.dateRange[1], this.quickSelect)
      this.quickSelect = null
      this.quick = false
      this.menu = false
    },
    cancelDatePicker() {
      this.dateRange = this.lastDateRange
      this.menu = false
    },
    refresh() {
      if (this.quick) this.changeQuickTime(this.quickTime)
    },
  },
}
</script>

<style lang="scss" scoped>
.v-picker--date {
  box-shadow: none !important;
}
</style>
