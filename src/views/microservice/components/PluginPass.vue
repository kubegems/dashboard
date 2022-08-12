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
  <div>
    <v-card v-if="!pass" class="mx-0 mt-6" flat :height="`400px`">
      <v-row :style="{ height: `400px` }">
        <v-col class="d-flex align-center justify-center">
          <div class="d-flex align-center pa-10">
            <div class="text-center">
              <h2 class="text-h5 primary--text font-weight-medium">
                {{ $t('tip.missing_plugin', [missingPlugins.join(', ')]) }}
              </h2>
              <h6 class="text-subtitle-1 mt-4 primary--text op-5 font-weight-regular">
                {{ $t('tip.plugin_tip') }}
              </h6>
            </div>
          </div>
        </v-col>
      </v-row>
    </v-card>
    <slot v-else />
  </div>
</template>

<script>
  import messages from './i18n';
  import { getClusterPluginsList } from '@/api';

  export default {
    name: 'PluginPass',
    i18n: {
      messages: messages,
    },
    data() {
      return {
        missingPlugins: [],
        pass: true,
      };
    },
    watch: {
      value: {
        handler(newValue) {
          this.pass = newValue;
        },
        deep: true,
      },
      '$store.state.EnvironmentFilter': {
        handler: function (env) {
          if (env) {
            this.pluginsPass(env.cluster);
          } else {
            if (this.$route.query.cluster) {
              this.pluginsPass(this.$route.query.cluster);
            }
          }
        },
        deep: true,
        immediate: true,
      },
    },
    methods: {
      async pluginsPass(cluster) {
        if (!cluster) {
          cluster = this.$route.query.cluster;
        }
        const data = await getClusterPluginsList(cluster, { simple: true, noprocessing: true });
        const plugins = this.$route.meta?.dependencies || [];
        this.missingPlugins = plugins.filter((p) => {
          return !data[p];
        });
        this.pass = this.missingPlugins?.length === 0;
        this.$emit('change', this.pass);
        this.$emit('input', this.pass);
      },
    },
  };
</script>
