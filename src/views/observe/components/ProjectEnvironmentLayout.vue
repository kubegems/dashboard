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
  <v-container fluid>
    <BaseSplitContainer side-width="250px" :title="$root.$t('resource.environment')" :tooltip="!!env">
      <ProjectEnvironmentTree slot="side" v-model="env" @change="onEnvChange" />

      <div v-if="!!env" slot="tooltip" class="text-caption" :style="{ maxWidth: '200px' }">
        <v-flex class="text-body-2 text-center primary white--text py-2">
          <v-icon color="white" left small> mdi-cloud </v-icon>
          <span>{{ $root.$t('resource.environment') }}</span>
        </v-flex>
        <v-list class="pa-0 kubegems__tip" dense>
          <v-list-item>
            <v-list-item-content>
              <v-list-item-title>{{ $root.$t('resource.cluster') }}</v-list-item-title>
              <v-list-item-content class="text-caption kubegems__text">
                {{ env.clusterName }}
              </v-list-item-content>
              <v-list-item-title>{{ $root.$t('resource.project') }}</v-list-item-title>
              <v-list-item-content class="text-caption kubegems__text">
                {{ env.projectName }}
              </v-list-item-content>
              <v-list-item-title>{{ $root.$t('resource.environment') }}</v-list-item-title>
              <v-list-item-content class="text-caption kubegems__text my-0">
                {{ env.name }}
              </v-list-item-content>
              <v-list-item-title>{{ $root.$t('resource.namespace') }}</v-list-item-title>
              <v-list-item-content class="text-caption kubegems__text my-0">
                {{ env.namespace }}
              </v-list-item-content>
            </v-list-item-content>
          </v-list-item>
        </v-list>
      </div>
      <EmptyOverlay :text="$root.$t('tip.select_environment')" :visible="!env" />

      <slot v-if="missingPlugins.length === 0" />
      <v-card v-else class="mx-3" flat :height="`400px`">
        <v-row :style="{ height: `400px` }">
          <v-col class="d-flex align-center justify-center">
            <div class="d-flex align-center pa-10">
              <div class="text-center">
                <h2 class="text-h5 primary--text font-weight-medium">
                  {{ $root.$t('plugin.environment_missing', [missingPlugins.join(', ')]) }}
                </h2>
                <h6 class="text-subtitle-1 mt-4 primary--text op-5 font-weight-regular">
                  {{ $root.$t('plugin.no_permission') }}
                </h6>
              </div>
            </div>
          </v-col>
        </v-row>
      </v-card>
    </BaseSplitContainer>
  </v-container>
</template>

<script>
  import BasePermission from '@/mixins/permission';
  import EmptyOverlay from '@/views/observe/components/EmptyOverlay';
  import ProjectEnvironmentTree from '@/views/observe/components/ProjectEnvironmentTree';

  export default {
    name: 'ProjectEnvironmentLayout',
    components: {
      EmptyOverlay,
      ProjectEnvironmentTree,
    },
    mixins: [BasePermission],
    data() {
      return {
        env: undefined,
        missingPlugins: [],
        pass: false,
      };
    },
    watch: {
      value: {
        handler(newValue) {
          this.value = newValue;
        },
        deep: true,
        immediate: true,
      },
    },
    methods: {
      async onEnvChange(env) {
        if (env?.clusterName) {
          this.missingPlugins = await this.m_permission_plugin_pass(
            env?.clusterName,
            this.$route.meta?.dependencies || [],
          );
        } else {
          this.missingPlugins = [];
        }

        if (this.missingPlugins?.length === 0) {
          this.$router.replace({
            query: {
              ...this.$route.query,
              proj: env?.projectName,
              env: env?.name,
              envid: env?.id,
              projid: env?.projectId,
              cluster: env?.clusterName,
              namespace: env?.namespace,
            },
          });
          this.pass = true;
          this.$emit('input', this.pass);
          this.$emit('change', this.pass);
        }
      },
    },
  };
</script>
