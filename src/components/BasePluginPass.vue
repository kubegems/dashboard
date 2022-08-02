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
  <div class="pass">
    <template v-if="!pluginPass">
      <div class="container container--fluid">
        <BaseBreadcrumb />
      </div>
      <v-card class="mx-3" flat :height="`${height}px`">
        <v-row :style="{ height: `${height}px` }">
          <v-col class="d-flex align-center justify-center">
            <div class="d-flex align-center pa-10">
              <div class="text-center">
                <h2 class="text-h5 primary--text font-weight-medium">
                  您暂时还未启用 {{ noPermisionPlugins.join(', ') }} 插件！
                </h2>
                <h6 class="text-subtitle-1 mt-4 primary--text op-5 font-weight-regular">
                  您可以联系平台管理员启用该插件
                </h6>
              </div>
            </div>
          </v-col>
        </v-row>
      </v-card>
    </template>
    <slot v-else />
  </div>
</template>

<script>
  import { mapState } from 'vuex';

  export default {
    name: 'BasePluginPass',
    data() {
      return {
        noPermisionPlugins: [],
      };
    },
    computed: {
      ...mapState(['Plugins', 'Scale']),
      pluginPass() {
        let pass = true;
        this.noPermisionPlugins = [];
        if (this.$route.meta.innerCheck) return pass;
        const dependencies = this.$route.meta.dependencies;
        if (dependencies === undefined) return pass;
        dependencies.forEach((d) => {
          if (!this.Plugins[d]) {
            this.noPermisionPlugins.push(d);
            pass = false;
            return;
          }
        });
        return pass;
      },
      height() {
        return parseInt((window.innerHeight - 128) / this.Scale) - 24;
      },
    },
  };
</script>

<style lang="scss" scoped>
  .pass {
    position: relative;
  }
</style>
