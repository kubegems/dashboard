<template>
  <v-navigation-drawer
    v-model="panel"
    stateless
    app
    temporary
    right
    :width="width"
    height="100%"
    class="rounded-0"
    id="panel"
    :overlay-opacity="0.3"
  >
    <v-flex class="px-4 py-4 primary white--text panel__header">
      <v-flex class="float-left white--text">
        <v-icon left class="white--text mt-n1">{{ icon }}</v-icon>
        <span class="text-h6 white--text">
          {{ title }}
        </span>
      </v-flex>
      <v-flex class="float-left white--text text-h6">
        <slot name="header"></slot>
      </v-flex>
      <div class="float-right">
        <v-btn color="white" text :panel="panel" class="mt-n1 ml-2" v-on="clickListeners"> 关闭 </v-btn>
      </div>
      <div class="float-right">
        <div v-if="Progress" :style="{ float: 'left' }">
          <v-progress-circular size="20" width="3" indeterminate color="white"></v-progress-circular>
        </div>
        <slot name="action"></slot>
      </div>
      <div class="kubegems__clear-float"></div>
    </v-flex>
    <v-divider></v-divider>
    <v-container class="pa-0">
      <slot name="content"></slot>
    </v-container>
  </v-navigation-drawer>
</template>

<script>
  import { mapState } from 'vuex';

  export default {
    name: 'BasePanel',
    model: {
      prop: 'panel',
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
      panel: {
        type: Boolean,
        default: () => false,
      },
      width: {
        type: String,
        default: () => '50%',
      },
    },
    computed: {
      ...mapState(['Progress']),
      clickListeners: function () {
        var vm = this;
        return Object.assign({}, this.$listeners, {
          click: function () {
            vm.$emit('click', false);
            vm.$emit('dispose');
          },
        });
      },
    },
    watch: {
      panel: {
        handler(newValue) {
          this.$store.commit('SET_PANEL', newValue);
          if (this.panel === true) {
            this.$nextTick(() => {
              const timeout = setTimeout(() => {
                document.getElementById('panel').style.display = 'flex';
                clearTimeout(timeout);
              }, 300);
            });
          } else {
            const timeout = setTimeout(() => {
              document.getElementById('panel').style.display = 'block';
              clearTimeout(timeout);
            }, 300);
          }
        },
      },
    },
    destroyed() {
      window.removeEventListener('keydown', this.escOccur);
    },
    mounted() {
      window.addEventListener('keydown', this.escOccur);
    },
    methods: {
      escOccur(e) {
        if (e.key === 'Escape') {
          this.$emit('click', false);
          this.$emit('dispose');
        }
      },
    },
  };
</script>

<style lang="scss" scoped>
  .panel__header {
    height: 64px;
  }

  .v-navigation-drawer {
    display: block;
    z-index: 10;
  }

  #panel {
    @media (max-width: 1300px) {
      width: 700px !important;
    }
  }
</style>
