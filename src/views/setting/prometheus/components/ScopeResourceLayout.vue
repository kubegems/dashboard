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
  <v-container class="pa-0" fluid>
    <BaseSplitContainer side-width="250px" :title="$root.$t('resource.resource')" :tooltip="!!resource">
      <ScopeResourceTree slot="side" v-model="resource" @change="onResourceChange" />

      <div v-if="!!resource" slot="tooltip" class="text-caption" :style="{ maxWidth: '200px' }">
        <v-flex class="text-body-2 text-center primary white--text py-2">
          <v-icon color="white" left small> mdi-cloud </v-icon>
          <span>{{ $t('tip.group_and_resource') }}</span>
        </v-flex>
        <v-list class="pa-0 kubegems__tip" dense>
          <v-list-item>
            <v-list-item-content>
              <v-list-item-title>{{ $t('tip.group') }}</v-list-item-title>
              <v-list-item-content class="text-caption kubegems__text">
                {{ resource.scopeName }}
              </v-list-item-content>
              <v-list-item-title>{{ $root.$t('resource.resource') }}</v-list-item-title>
              <v-list-item-content class="text-caption kubegems__text">
                {{ resource.name }}
              </v-list-item-content>
            </v-list-item-content>
          </v-list-item>
        </v-list>
      </div>

      <slot />
    </BaseSplitContainer>
  </v-container>
</template>

<script>
  import messages from '../i18n';
  import ScopeResourceTree from './ScopeResourceTree';
  import BasePermission from '@/mixins/permission';

  export default {
    name: 'ScopeResourceLayout',
    i18n: {
      messages: messages,
    },
    components: {
      ScopeResourceTree,
    },
    mixins: [BasePermission],
    data() {
      return {
        resource: undefined,
      };
    },
    methods: {
      async onResourceChange(resource) {
        if (resource) {
          this.$router.replace({
            query: {
              ...this.$route.query,
              scopeId: resource?.scopeId,
              resourceId: resource?.id,
            },
          });
        }
      },
    },
  };
</script>
