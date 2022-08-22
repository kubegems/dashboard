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
  <BaseFullScreenDialog v-model="dialog" kubegems-logo :title="$root.$t('header.model_store')" @dispose="dispose">
    <template #content>
      <v-flex>
        <v-row class="mt-0 ma-0">
          <v-col class="px-6 pa-0" cols="3">
            <ModelInfo :item="item" no-version />
          </v-col>
          <v-flex class="py-2" :style="{ height: `${height}px` }">
            <v-divider vertical />
          </v-flex>
          <v-col class="pa-0" cols="9">
            <DeployWizard ref="deployWizard" :item="item" @dispose="dispose" />
          </v-col>
        </v-row>
      </v-flex>
    </template>
  </BaseFullScreenDialog>
</template>

<script>
  import { mapState } from 'vuex';

  import DeployWizard from './DeployWizard';
  import ModelInfo from './ModelInfo';

  export default {
    name: 'Deploy',
    components: {
      DeployWizard,
      ModelInfo,
    },
    props: {
      item: {
        type: Object,
        default: () => null,
      },
    },
    data: () => ({
      dialog: false,
    }),
    computed: {
      ...mapState(['Scale']),
      height() {
        return (window.innerHeight - 64) / this.Scale;
      },
    },
    methods: {
      open() {
        this.dialog = true;
      },
      async init() {},
      dispose() {
        this.dialog = false;
        this.$refs.deployWizard.reset();
      },
    },
  };
</script>

<style lang="scss" scoped>
  .deploy-wizard-overflow-y {
    overflow-y: auto;
  }
</style>
