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
    <Breadcrumb
      :hub="registry ? registry.name : ''"
      sync-status
      @setOnline="setOnline"
      @updateModelCount="updateModelCount"
    >
      <template #extend>
        <v-flex class="kubegems__full-right">
          <RegistrySelect v-model="registry" />
        </v-flex>
      </template>
    </Breadcrumb>
    <template v-if="GlobalPlugins['kubegems-models']">
      <v-row class="mt-0">
        <v-col class="pt-0" cols="3">
          <ModelFilter :model-count="modelCount" :registry="registry" @filter="filter" @search="search" />
        </v-col>
        <v-col class="pt-0" cols="9">
          <ModelCard ref="modelCard" :online="online" :registry="registry" />
        </v-col>
      </v-row>
    </template>
    <template v-else>
      <v-card class="mt-6" flat :height="`400px`">
        <v-row :style="{ height: `400px` }">
          <v-col class="d-flex align-center justify-center">
            <div class="d-flex align-center pa-10">
              <div class="text-center">
                <h2 class="text-h5 primary--text font-weight-medium">
                  {{ $root.$t('plugin.missing', ['kubegems-model']) }}
                </h2>
                <h6 class="text-subtitle-1 mt-4 primary--text op-5 font-weight-regular">
                  {{ $root.$t('plugin.no_permission') }}
                </h6>
              </div>
            </div>
          </v-col>
        </v-row>
      </v-card>
    </template>
  </v-container>
</template>

<script>
  import { mapState } from 'vuex';

  import Breadcrumb from './components/Breadcrumb';
  import ModelCard from './components/ModelCard';
  import ModelFilter from './components/ModelFilter';
  import RegistrySelect from './components/RegistrySelect';
  import messages from './i18n';

  export default {
    name: 'ModelStoreCenter',
    i18n: {
      messages: messages,
    },
    components: {
      Breadcrumb,
      ModelCard,
      ModelFilter,
      RegistrySelect,
    },
    data() {
      return {
        registry: null,
        modelCount: 0,
        online: true,
      };
    },
    computed: {
      ...mapState(['GlobalPlugins']),
    },
    methods: {
      search(search) {
        this.$refs.modelCard.search(search);
      },
      filter(filter) {
        this.$refs.modelCard.filter(filter);
      },
      updateModelCount(modelCount) {
        this.modelCount = modelCount;
      },
      setOnline(online) {
        this.online = online;
      },
    },
  };
</script>
