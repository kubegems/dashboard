<template>
  <div
    v-transfer-dom
    class="v-application drawer"
  >
    <transition name="fade">
      <div
        v-if="visible"
        class="drawer__mask"
        @click="onClickMask"
      />
    </transition>

    <transition name="drawer">
      <div
        v-if="visible"
        class="drawer__wrapper"
        :style="{ 'width': width }"
      >
        <div class="drawer__header">
          <span>{{ title }}</span>
          <v-icon
            class="drawer__close"
            @click="onClose"
          >
            mdi-close
          </v-icon>
        </div>

        <div
          class="drawer__body"
          :class="bodyClass">
          <slot />
        </div>

        <div
          v-if="footer"
          class="drawer__footer"
        >
          <v-btn
            text
            depressed
            @click="onCancel"
          >
            {{ cancelText }}
          </v-btn>
          <v-btn
            depressed
            class="ml-1"
            color="primary"
            :loading="confirmLoading"
            @click="onConfirm"
          >
            {{ confirmText }}
          </v-btn>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
export default {
  name: 'Drawer',
  props: {
    // 显示/隐藏
    value: {
      type: Boolean,
      default: false,
    },
    // 开启/关闭遮罩层关闭
    maskClose: {
      type: Boolean,
      default: false,
    },
    // 抽屉宽度
    width: {
      type: String,
      default: '30%',
    },
    // 标题
    title: {
      type: String,
      default: '',
    },
    // 确认按钮文字
    confirmText: {
      type: String,
      default: '确定',
    },
    // 取消按钮文字
    cancelText: {
      type: String,
      default: '取消',
    },
    // 确定loading
    confirmLoading: {
      type: Boolean,
      default: false,
    },
    // 显示footer
    footer: {
      type: Boolean,
      default: false,
    },
    bodyClass: {
      type: String,
      default: undefined
    }
  },
  data () {
    return {
      visible: this.value,
    }
  },
  watch: {
    value (val) {
      this.visible = val
    },
    visible (val) {
      this.$emit('input', val)
    },
  },
  methods: {
    /**
     * 点击遮罩层关闭
     */
    onClickMask () {
      if (this.maskClose) this.visible = false
    },
    /**
     * 关闭
     */
    onClose () {
      this.visible = false
    },
    /**
     * 确认
     */
    onConfirm () {
      this.$emit('confirm')
    },
    /**
     * 取消
     */
    onCancel () {
      this.visible = false
      this.$emit('cancel')
    },
  },
}
</script>

<style lang="scss" scoped>
.drawer {
  &__mask {
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    z-index: 999;
    background-color: rgba(#212121, 0.46);
  }

  &__wrapper {
    position: fixed;
    top: 0;
    bottom: 0;
    right: 0;
    z-index: 1001;
    display: flex;
    flex-direction: column;
    background-color: #ffffff;
    border: 1px solid rgba(#000000, 0.12);
    box-shadow: 0 3px 1px -2px rgb(0 0 0 / 20%),
      0 2px 2px 0 rgb(0 0 0 / 14%),
      0 1px 5px 0 rgb(0 0 0 / 12%);
  }

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 64px;
    padding: 16px;
    font-size: 1.25rem;
    color: $primary;
    border-bottom: 1px solid rgba(#000000, 0.12);
  }

  &__body {
    flex: 1;
    position: relative;
    padding: 16px;
    overflow-x: hidden;
    overflow-y: auto;
  }

  &__footer {
    padding: 16px;
    text-align: right;
    border-top: 1px solid rgba(#000000, 0.12);
  }

  &__close {
    float: right;
    position: relative;
    top: 2px;
    transition: color 0.5s ease;
    cursor: pointer;

    &:hover {
      color: $primary;
    }
  }
}
</style>
