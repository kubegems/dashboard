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
  <v-card>
    <v-card-title class="text-h6 primary--text">
      {{ item ? item.name || item.metadata.name : '' }}
    </v-card-title>
    <v-list-item two-line>
      <v-list-item-content class="kubegems__text">
        <v-list-item-title class="text-subtitle-2"> {{ $root.$t('resource.project') }} </v-list-item-title>
        <v-list-item-subtitle class="text-body-2">
          {{ $route.params.project }}
        </v-list-item-subtitle>
      </v-list-item-content>
    </v-list-item>
    <v-list-item v-if="ThisAppEnvironmentID" two-line>
      <v-list-item-content class="kubegems__text">
        <v-list-item-title class="text-subtitle-2"> {{ $root.$t('resource.environment') }} </v-list-item-title>
        <v-list-item-subtitle class="text-body-2">
          {{ $route.params.environment }}
        </v-list-item-subtitle>
      </v-list-item-content>
    </v-list-item>
    <template v-if="$route.query.kind === 'modelstore'">
      <v-list-item two-line>
        <v-list-item-content class="kubegems__text">
          <v-list-item-title class="text-subtitle-2"> {{ $t('table.model_name') }} </v-list-item-title>
          <v-list-item-subtitle class="text-body-2">
            {{ item ? item.spec.model.name : '' }}
          </v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>
      <v-list-item two-line>
        <v-list-item-content class="kubegems__text">
          <v-list-item-title class="text-subtitle-2"> {{ $t('table.model_version') }} </v-list-item-title>
          <v-list-item-subtitle class="text-body-2">
            {{ item ? item.spec.model.version : '' }}
          </v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>
      <v-list-item two-line>
        <v-list-item-content class="kubegems__text">
          <v-list-item-title class="text-subtitle-2"> {{ $t('table.source') }} </v-list-item-title>
          <v-list-item-subtitle class="text-body-2">
            {{ item ? item.spec.model.source : '' }}
          </v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>
      <v-list-item two-line>
        <v-list-item-content class="kubegems__text">
          <v-list-item-title class="text-subtitle-2"> {{ $root.$t('resource.create_at') }} </v-list-item-title>
          <v-list-item-subtitle class="text-body-2">
            {{ item ? $moment(item.metadata.creationTimestamp).format('lll') : '' }}
          </v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>
    </template>
    <template v-else>
      <v-list-item two-line>
        <v-list-item-content class="kubegems__text">
          <v-list-item-title class="text-subtitle-2"> {{ $t('table.kind') }} </v-list-item-title>
          <v-list-item-subtitle class="text-body-2">
            {{ item ? item.kind : '' }}
          </v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>
      <v-list-item two-line>
        <v-list-item-content class="kubegems__text">
          <v-list-item-title class="text-subtitle-2"> {{ $t('table.creator') }} </v-list-item-title>
          <v-list-item-subtitle class="text-body-2">
            {{ item ? item.runtime.creator : '' }}
          </v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>
      <v-list-item two-line>
        <v-list-item-content class="kubegems__text">
          <v-list-item-title class="text-subtitle-2"> {{ $root.$t('resource.create_at') }} </v-list-item-title>
          <v-list-item-subtitle class="text-body-2">
            {{ item && item.runtime.createAt ? $moment(item.runtime.createAt).format('lll') : '' }}
          </v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>
    </template>
  </v-card>
</template>

<script>
  import { mapGetters } from 'vuex';

  import messages from '../i18n';
  import BaseResource from '@/mixins/resource';

  export default {
    name: 'ResourceInfo',
    i18n: {
      messages: messages,
    },
    mixins: [BaseResource],
    props: {
      item: {
        type: Object,
        default: () => null,
      },
    },
    computed: {
      ...mapGetters(['Project', 'Environment']),
    },
  };
</script>
