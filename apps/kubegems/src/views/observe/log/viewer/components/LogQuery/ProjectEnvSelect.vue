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
    <v-flex class="d-flex" :style="{ display: 'inline-flex !important' }">
      <ProjectEnvSelectCascade v-model="env" :tenant="Tenant()" />

      <v-sheet class="tip">
        <v-icon right small> mdi-help-rhombus </v-icon>
      </v-sheet>

      <v-sheet class="text-body-2 ml-2" :style="{ lineHeight: '36px' }">
        <v-btn bottom color="primary" small text @click="handleRefresh"> {{ $root.$t('operate.refresh') }} </v-btn>
      </v-sheet>

      <v-sheet class="text-body-2 ml-2" :style="{ lineHeight: '36px' }">
        <v-btn bottom color="error" small text @click="handleClear"> {{ $root.$t('operate.clear') }} </v-btn>
      </v-sheet>

      <v-sheet v-if="loading" class="tip ml-2">
        <v-progress-circular color="primary" indeterminate size="20" :width="3" />
      </v-sheet>
    </v-flex>

    <v-flex :style="{ display: 'inline-flex !important', float: 'right' }">
      <v-sheet class="text-body-2 tip ml-6 kubegems__text">
        {{ $root.$t('resource.cluster') }} :
        <span class="text-body-2 font-weight-medium">
          {{ env ? env.clusterName : '' }}
        </span>
      </v-sheet>
      <v-sheet class="text-body-2 tip ml-4 kubegems__text">
        {{ $root.$t('resource.namespace') }} :
        <span class="text-body-2 font-weight-medium">
          {{ env ? env.namespace : '' }}
        </span>
      </v-sheet>

      <v-sheet class="text-body-2 tip ml-4 kubegems__text">
        Series:
        <span class="text-body-2 font-weight-medium">
          {{ series.length > 5000 ? '5000+' : series.length }}
        </span>
      </v-sheet>
    </v-flex>
  </div>
</template>

<script>
  import { mapGetters } from 'vuex';

  import BaseSelect from '@/mixins/select';
  import ProjectEnvSelectCascade from '@/views/observe/components/ProjectEnvSelectCascade';

  export default {
    name: 'ProjectEnvSelect',
    components: {
      ProjectEnvSelectCascade,
    },
    mixins: [BaseSelect],
    props: {
      loading: {
        type: Boolean,
        default: () => false,
      },
      series: {
        type: Array,
        default: () => [],
      },
    },
    data() {
      return {
        env: undefined,
      };
    },
    computed: {
      ...mapGetters(['Tenant']),
    },
    watch: {
      env: {
        handler(newValue) {
          if (newValue) {
            this.$emit('setEnvironment', this.env, this.env.projectName, this.env.trigger);
          }
        },
        deep: true,
        immediate: true,
      },
    },
    methods: {
      handleClear() {
        this.$emit('clear');
      },

      handleRefresh() {
        if (this.env) {
          this.$emit('refresh');
        }
      },
    },
  };
</script>

<style lang="scss" scoped>
  .tip {
    line-height: 38px;
  }
</style>
