<template>
  <v-dialog
    v-model="dialog"
    :max-width="width"
    persistent
    scrollable
    height="100%"
  >
    <v-card>
      <v-sheet class="px-4 py-2 primary">
        <div class="justify-center float-left text-h6 py-1 white--text">
          <v-icon left class="mt-n1 white--text">{{ icon }}</v-icon>
          {{ title }}
          <div v-if="Progress" :style="{
            position: 'absolute',
            right: '15px',
            top: '12px',
          }">
            <v-progress-circular
              size="20"
              width="3"
              indeterminate
              color="white"
            ></v-progress-circular>
          </div>
        </div>
        <div class="float-left">
          <slot name="header-action"></slot>
        </div>
        <div class="kubegems__clear-float"></div>
      </v-sheet>
      <v-card-text class="pa-0">
        <v-container>
          <slot name="content"></slot>
        </v-container>
      </v-card-text>
      <div class="px-4 py-2">
        <slot name="action"></slot>
        <v-btn
          class="float-right mx-2"
          color="error"
          text
          :dialog="dialog"
          v-on="clickListeners"
        >
          {{ $slots.action ? '取消' : '关闭' }}
        </v-btn>
        <div class="kubegems__clear-float"></div>
      </div>
    </v-card>
  </v-dialog>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'BaseDialog',
  model: {
    prop: 'dialog',
    event: 'click',
  },
  props: {
    title: {
      type: String,
      default: () => '',
    },
    icon: {
      type: String,
      default: () => '',
    },
    width: {
      type: Number,
      default: () => 800,
    },
    dialog: {
      type: Boolean,
      default: () => false,
    },
  },
  watch: {
    dialog: {
      handler(newValue) {
        this.$store.commit('SET_DIALOG', newValue)
      },
      deep: true
    }
  },
  computed: {
    ...mapState(['Progress']),
    clickListeners: function () {
      var vm = this
      return Object.assign({}, this.$listeners, {
        click: function () {
          vm.$emit('click', false)
          vm.$emit('reset')
        },
      })
    },
  },
}
</script>
