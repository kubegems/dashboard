<template>
  <v-dialog v-model="dialog" height="100%" :max-width="width" :overlay-opacity="0.3" persistent scrollable>
    <v-card>
      <v-sheet class="px-4 py-2 primary">
        <div class="justify-center float-left text-h6 py-1 white--text">
          <v-icon class="mt-n1 white--text" left>{{ icon }}</v-icon>
          {{ title }}
          <div
            v-if="Progress"
            :style="{
              position: 'absolute',
              right: '15px',
              top: '12px',
            }"
          >
            <v-progress-circular color="white" indeterminate size="20" width="3" />
          </div>
        </div>
        <div class="float-left">
          <slot name="header-action" />
        </div>
        <div class="kubegems__clear-float" />
      </v-sheet>
      <v-card-text class="pa-0">
        <v-container>
          <slot name="content" />
        </v-container>
      </v-card-text>
      <div class="px-4 py-2">
        <slot name="action" />
        <v-btn class="float-right mx-2" color="error" :dialog="dialog" text v-on="clickListeners">
          {{ $slots.action ? '取消' : '关闭' }}
        </v-btn>
        <div class="kubegems__clear-float" />
      </div>
    </v-card>
  </v-dialog>
</template>

<script>
  import { mapState } from 'vuex';

  export default {
    name: 'BaseDialog',
    model: {
      prop: 'dialog',
      event: 'click',
    },
    props: {
      dialog: {
        type: Boolean,
        default: () => false,
      },
      icon: {
        type: String,
        default: () => '',
      },
      title: {
        type: String,
        default: () => '',
      },
      width: {
        type: Number,
        default: () => 800,
      },
    },
    computed: {
      ...mapState(['Progress']),
      clickListeners: function () {
        var vm = this;
        return Object.assign({}, this.$listeners, {
          click: function () {
            vm.$emit('click', false);
            vm.$emit('reset');
          },
        });
      },
    },
    watch: {
      dialog: {
        handler(newValue) {
          this.$store.commit('SET_DIALOG', newValue);
        },
        deep: true,
      },
    },
  };
</script>
