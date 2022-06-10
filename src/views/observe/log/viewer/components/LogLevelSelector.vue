<template>
  <div class="d-inline-block">
    <span>级别:</span>
    <v-menu
      v-for="item in legends"
      :key="item.value"
      top
      open-on-hover
      nudge-top="23px"
      :close-delay="200"
    >
      <template #activator="{ on }">
        <v-btn
          x-small
          light
          :outlined="!checked.includes(item.value)"
          :color="item.color"
          :class="{ 'white--text': checked.includes(item.value) }"
          class="ml-3 log-level-select__btn"
          v-on="on"
          @click="handleClick(item.value)"
        >
          {{ item.text }}
        </v-btn>
      </template>
      <v-card>
        <v-card-text class="pa-2"> {{ item.intro }} </v-card-text>
      </v-card>
    </v-menu>
  </div>
</template>

<script>
export default {
  name: 'LogLevelSelect',
  props: {
    value: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    this.legends = [
      {
        text: 'Info',
        value: 'info',
        color: 'success',
        intro: '匹配元素:[I],[info],【info】,info,level=info,忽略大小写',
      },
      {
        text: 'Debug',
        value: 'debug',
        color: 'primary',
        intro: '匹配元素:[D],[debug],【debug】,debug,level=debug,忽略大小写',
      },
      {
        text: 'Warn',
        value: 'warn',
        color: 'warning',
        intro:
          '匹配元素:[W],[warn],[warning],【warn】,【warning】,warn,warning,level=warn,level=warning,忽略大小写',
      },
      {
        text: 'Error',
        value: 'error',
        color: 'error',
        intro: '匹配元素:[E],[error],【error】,error,level=error,忽略大小写',
      },
      {
        text: 'Unknown',
        value: 'unknown',
        color: 'blue-grey',
        intro: '无法匹配前面四个日志级别的其他日志',
      },
    ]

    return {
      checked: this.value,
    }
  },
  watch: {
    value() {
      this.checked = [...this.value]
    },
  },
  methods: {
    handleClick(value) {
      if (this.checked.includes(value)) {
        this.checked = this.checked.filter((l) => l !== value)
      } else {
        this.checked.push(value)
      }
      this.$emit('input', [...this.checked])
      this.$emit('change', [...this.checked])
    },
  },
}
</script>

<style lang="scss" scoped>
.log-level-select__btn {
  position: relative;
  top: -2px;
}
</style>
