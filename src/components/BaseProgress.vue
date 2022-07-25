<template>
  <v-overlay :opacity="0.3" :value="Progress && !DialogActive && !PanelActive && !FullDialogActive">
    <v-card class="progress__light" flat height="100px" width="130px">
      <v-card-text>
        <div class="text-center primary--text progress__loading" :style="{ fontFamily: 'kubegems-sample' }">
          <span
            v-for="(char, index) in processName"
            :key="index"
            class="progress__loading__span"
            :style="{ animationDelay: `${index * 70}ms`, left: `${charWidth[index]}px` }"
          >
            {{ char }}
          </span>
        </div>
        <div class="text-subtitle-2 text-center grey--text" :style="{ marginTop: '50px' }">数据获取中...</div>
      </v-card-text>
    </v-card>
  </v-overlay>
</template>

<script>
  import { mapState } from 'vuex';

  export default {
    name: 'BaseProgress',
    data() {
      return {
        processName: this.$PLATFORM,
        charWidth: [0, 13, 24, 36, 46, 60, 70, 86, 98, 110, 122, 134, 146],
      };
    },
    computed: {
      ...mapState(['Progress', 'DialogActive', 'PanelActive', 'FullDialogActive']),
    },
  };
</script>

<style lang="scss" scoped>
  .v-progress-linear-position {
    top: 64px !important;
    z-index: 20;
  }

  .v-overlay {
    z-index: 20 !important;
  }

  .progress {
    &__light {
      background-color: #ffffff !important;
      border-color: #ffffff !important;
      color: rgba(0, 0, 0, 0.87) !important;
    }

    &__loading {
      font-family: 'kubegems-sample';
      font-size: 20px;
      position: relative;

      &__span {
        animation-name: loading;
        animation-duration: 0.5s;
        animation-timing-function: linear;
        animation-delay: 0s;
        animation-iteration-count: infinite;
        animation-direction: alternate;
        position: absolute;
      }
    }
  }

  @keyframes loading {
    0% {
      top: 0;
    }
    100% {
      top: 20px;
    }
  }
</style>
