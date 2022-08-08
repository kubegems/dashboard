<!--
 * Copyright 2022 The kubegems.io Authors
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *       http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License. 
-->

<template>
  <v-navigation-drawer
    id="panel"
    v-model="panel"
    app
    class="rounded-0"
    height="100%"
    :overlay-opacity="0.3"
    right
    stateless
    temporary
    :width="width"
  >
    <v-flex class="px-4 py-4 primary white--text panel__header">
      <v-flex class="float-left white--text">
        <v-icon class="white--text mt-n1" left>{{ icon }}</v-icon>
        <span class="text-h6 white--text">
          {{ title }}
        </span>
      </v-flex>
      <v-flex class="float-left white--text text-h6">
        <slot name="header" />
      </v-flex>
      <div class="float-right">
        <v-btn class="mt-n1 ml-2" color="white" :panel="panel" text v-on="clickListeners">
          {{ $t('operate.close') }}
        </v-btn>
      </div>
      <div class="float-right">
        <div v-if="Progress" :style="{ float: 'left' }">
          <v-progress-circular color="white" indeterminate size="20" width="3" />
        </div>
        <slot name="action" />
      </div>
      <div class="kubegems__clear-float" />
    </v-flex>
    <v-divider />
    <v-container class="pa-0">
      <slot name="content" />
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
      icon: {
        type: String,
        default: () => '',
      },
      panel: {
        type: Boolean,
        default: () => false,
      },
      title: {
        type: String,
        default: () => '',
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
