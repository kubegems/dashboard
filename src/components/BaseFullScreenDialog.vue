<template>
  <v-dialog
    v-model="dialog"
    fullscreen
    hide-overlay
    transition="dialog-bottom-transition"
    eager
    @keydown.esc="escOccur"
    persistent
    no-click-animation
  >
    <v-card class="rounded-0">
      <v-flex class="px-4 py-3 primary white--text fixed">
        <div v-if="isAppstore" class="justify-center float-left text-h6 py-1">
          <span class="hidden-sm-and-down float-left">
            <v-img
              src="/logo.svg"
              width="140"
              contain
              class="kubegems__absolute-middle"
            />
          </span>
          <span
            class="pl-2 text-h6"
            style="
              font-family: Yuanti SC, YouYuan, Microsoft Yahei !important;
              font-weight: bold;
              font-size: 1.1rem !important;
              margin-left: 140px;
"
          >
            {{ title }}
          </span>
        </div>
        <div v-else class="justify-center float-left text-h6 py-1">
          <v-icon left class="white--text mt-n1">{{ icon }}</v-icon>
          <span class="white--text">{{ title }}</span>
        </div>
        <div class="float-left mt-2 white--text ml-3">
          <slot name="header"></slot>
        </div>
        <v-flex class="float-right">
          <v-flex class="float-left mt-1">
            <slot name="action"></slot>
          </v-flex>
          <v-flex class="float-left">
            <v-btn
              color="white"
              class="mx-2"
              text
              :dialog="dialog"
              v-on="clickListeners"
            >
              关闭
            </v-btn>
          </v-flex>
          <div class="kubegems__clear-float"></div>
        </v-flex>
        <div class="kubegems__clear-float"></div>
      </v-flex>
      <v-divider />
      <v-card-text class="pa-0 margin-top-fixed">
        <slot name="content"></slot>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: 'BaseFullScreenDialog',
  model: {
    prop: 'dialog',
    event: 'click',
  },
  props: {
    title: {
      type: String,
      default: () => '',
    },
    isAppstore: {
      type: Boolean,
      default: () => false,
    },
    icon: {
      type: String,
      default: () => '',
    },
    dialog: {
      type: Boolean,
      default: () => false,
    },
  },
  computed: {
    clickListeners: function () {
      var vm = this
      return Object.assign({}, this.$listeners, {
        click: function () {
          vm.$emit('click', false)
          vm.$emit('dispose')
        },
      })
    },
  },
  methods: {
    escOccur() {
      this.$emit('click', false)
      this.$emit('dispose')
    },
  },
}
</script>

<style lang="scss" scoped>
.fixed {
  position: fixed;
  z-index: 10;
  width: 100%;
  height: 64px;
}
.margin-top-fixed {
  margin-top: 64px;
}
</style>
