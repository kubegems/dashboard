<template>
  <v-card
    class="split-container"
    :class="{ 'split-container--hidden': !expand }"
  >
    <div
      class="split-container__side"
      :style="sideStyle"
    >
      <div class="split-container__side-header">
        <div class="split-container__side-title">
          <slot name="title">{{ title }}</slot>
        </div>
        <v-btn
          v-if="expand"
          icon
          type="text"
          color="primary"
          x-small
          :disabled="disabled"
          @click="onToggle"
        >
          <v-icon>mdi-menu</v-icon>
        </v-btn>
      </div>
      <slot name="side" />
    </div>

    <v-divider
      vertical
      class="mx-4"
    />

    <div
      class="split-container__main"
      :style="mainStyle"
    >
      <slot />
    </div>


    <!-- 收起时标签 -->
    <transition name="slide-x-transition">
      <div
        v-if="!expand"
        class="split-container__fiexd">
        <!-- label -->
        <span class="split-container__fiexd-label">
          <slot name="label">{{ title }}</slot>
        </span>

        <!-- tooltip -->
        <v-menu
          v-if="tooltip"
          right
          open-on-hover
          nudge-right="24px"
        >
          <template #activator="{ on }">
            <v-btn
              icon
              x-small
              v-on="on"
              color="white"
            >
              <v-icon>mdi-tooltip-text-outline</v-icon>
            </v-btn>
          </template>
          <v-card class="pa-0">
            <slot name="tooltip"></slot>
          </v-card>
        </v-menu>

        <!-- 展开按钮 -->
        <v-btn
          icon
          x-small
          color="white"
          :disabled="disabled"
          @click="onToggle"
        >
          <v-icon>mdi-menu</v-icon>
        </v-btn>
      </div>
    </transition>
    <!-- 收起时标签 -->
  </v-card>
</template>

<script>
/**
 * 插槽：
 * default  默认插槽（main）
 * side     侧边内容
 * title    标题插槽
 * label    收起时侧边标签插槽
 * tooltip  v-menu内容插槽
 */
export default {
  name: 'BaseSplitContainer',
  props: {
    // 侧边栏标题
    title: {
      type: String,
      default: undefined
    },
    // 收骑时使用tooltip展示更多信息
    tooltip: {
      type: Boolean,
      default: false,
    },
    // 侧边栏宽度
    sideWidth: {
      type: String,
      default: '300px'
    },
    // 隐藏side-header
    hiddenSideHeader: {
      type: Boolean,
      default: false,
    },
    // 展开与收缩是否触发window.resize
    dispatchResize: {
      type: Boolean,
      default: false
    },
    // 是否允许展开收起
    disabled: {
      type: Boolean,
      default: false
    }
  },
  data: () => ({
    expand: true, // 展开
  }),
  computed: {
    sideStyle () {
      return {
        width: this.sideWidth || '300px'
      }
    },
    mainStyle () {
      return {
        width: this.expand ? `calc(100% - 33px - ${this.sideWidth})` : 'calc(100% - 33px)'
      }
    }
  },
  watch: {
    expand () {
      if (this.dispatchResize) {
        this.manualResize()
      }
    }
  },
  methods: {
    onToggle () {
      this.setExpand(!this.expand)
    },
    manualResize () {
      const event = new Event('resize', {
        bubbles: true,
        cancelable: true
      })
      document.dispatchEvent(event)
    },
    setExpand (value) {
      this.expand = value
    }
  }
}
</script>

<style lang="scss" scoped>
.split-container {
  min-height: 100px;
  position: relative;
  display: flex;
  width: 100%;
  padding: 16px;

  &__side,
  &__main {
    position: relative;
    transition: width 0.5s ease;
  }

  &__side {
    width: 300px;

    &-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      height: 48px;
      line-height: 46px;
      border-bottom: 2px solid $primary;
      margin-bottom: 12px;
      overflow: hidden;
    }

    &-title {
      font-size: 0.875rem;
      font-weight: 500;
      color: $primary;
    }
  }

  &__fiexd {
    position: absolute;
    top: 4px;
    left: 4px;
    width: 24px;
    padding: 8px 2px;
    border-radius: 4px;
    background-color: $primary;
    font-size: 14px;
    text-align: center;
    line-height: 24px;
    letter-spacing: 4px;
    color: #ffffff;

    &-label {
      position: relative;
      left: -2.5px;
      writing-mode: tb-rl;
    }
  }

  &--hidden {
    .split-container__side {
      width: 0 !important;
      white-space: nowrap;
      overflow: hidden;
    }
  }
}
</style>
