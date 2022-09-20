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
  <BaseFullScreenDialog v-model="dialog" kubegems-logo :title="$t('tip.plugin_params')" @dispose="dispose">
    <template #content>
      <v-flex>
        <v-row class="mt-0 ma-0">
          <v-col class="px-6 pa-0" cols="3">
            <PluginInfo :item="plugin" />
          </v-col>
          <v-flex class="py-2" :style="{ height: `${height}px` }">
            <v-divider vertical />
          </v-flex>
          <v-col class="pa-0" cols="9">
            <SchemaRender ref="schemaRender" :item="plugin" />
          </v-col>
        </v-row>
      </v-flex>
      <v-flex class="kubegems__wizard-footer" :style="{ right: `${footerWidth}px` }">
        <v-btn color="primary" :loading="Circular" text @click="installPlugin">
          {{ $root.$t('operate.confirm') }}
        </v-btn>
      </v-flex>
    </template>
  </BaseFullScreenDialog>
</template>

<script>
  import { mapGetters, mapState } from 'vuex';

  import messages from '../../i18n';
  import PluginInfo from './PluginInfo';
  import SchemaRender from './SchemaRender';
  import { postEnablePlugin } from '@/api';
  import { deepCopy } from '@/utils/helpers';

  export default {
    name: 'InstallPluginSchema',
    i18n: {
      messages: messages,
    },
    components: {
      PluginInfo,
      SchemaRender,
    },
    data: () => ({
      dialog: false,
      plugin: undefined,
    }),
    computed: {
      ...mapState(['Scale', 'Circular']),
      ...mapGetters(['Cluster']),
      height() {
        return (window.innerHeight - 64) / this.Scale;
      },
      footerWidth() {
        return (window.innerWidth / this.Scale / 12) * 9 + 10;
      },
    },
    methods: {
      open() {
        this.dialog = true;
      },
      async init(plugin) {
        this.plugin = deepCopy(plugin);
      },
      dispose() {
        this.dialog = false;
      },
      async installPlugin() {
        if (this.$refs.schemaRender.validate()) {
          const data = this.$refs.schemaRender.getData();
          await postEnablePlugin(this.Cluster().ClusterName, this.plugin.name, data);
          this.dispose();
          this.$emit('refresh');
        }
      },
    },
  };
</script>
