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
  <v-app id="kubegems" :class="`${!$vuetify.breakpoint.smAndDown ? 'full-sidebar' : 'mini-sidebar'}`">
    <router-view v-if="isReloadAlive" />
    <BaseProgress />
    <BaseSnackBar />
    <BaseConfirm />
  </v-app>
</template>

<script>
  import { mapState } from 'vuex';

  export default {
    name: 'App',
    provide() {
      return {
        reload: this.reload,
      };
    },
    data() {
      this.latestVersion = process.env.VUE_APP_RELEASE;
      return {
        isReloadAlive: true,
      };
    },
    computed: {
      ...mapState(['Scale', 'Version']),
    },
    mounted() {
      // 初始化缩放
      this.initScale();
      // 版本迭代清理本地缓存
      this.clearLocalStorage();
      this.$nextTick(() => {
        const { set } = this.$meta().addApp('custom');
        set({
          meta: [
            { keyWords: `gitops,kubegems,kubernetes,Cloud Native` },
            { description: this.$t('metadata.description') },
          ],
        });
      });
    },
    methods: {
      reload() {
        this.isReloadAlive = false;
        this.$nextTick(function () {
          this.isReloadAlive = true;
        });
      },
      initScale() {
        let scale = 1.0;
        if (this.$vuetify.breakpoint.name === 'lg') {
          if (window.innerWidth > 1440 && window.innerWidth < 1920) {
            scale = 0.9;
          } else if (window.innerWidth > 1280 && window.innerWidth <= 1440) {
            scale = 0.85;
          }
        } else if (this.$vuetify.breakpoint.name === 'xl') {
          scale = 0.95;
        }
        document.getElementsByTagName('body')[0].style.zoom = scale;
        this.$store.commit('SET_SCALE', scale);
      },
      async clearLocalStorage() {
        if (this.Version && this.Version !== this.latestVersion) {
          this.$store.commit('CLEARALL');
          await this.$router.push({ name: 'login' });
          this.$store.commit('SET_SNACKBAR', {
            text: this.$t('tip.version', [this.latestVersion]),
            color: 'warning',
          });
          this.$store.commit('SET_VERSION', this.latestVersion);
        }
      },
    },
  };
</script>
