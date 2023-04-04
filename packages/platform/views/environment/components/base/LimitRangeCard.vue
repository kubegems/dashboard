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
  <v-flex class="mx-2">
    <v-sheet class="pa-1">
      <v-flex class="float-left">
        <v-flex class="float-left text-body-2 py-2 kubegems__min-width">
          <span>{{ $root.$t('resource.cpu_c', [$root.$t('resource.container')]) }}</span>
        </v-flex>
        <v-flex class="float-left limit-range-min-width">
          <v-flex class="text-body-2 text-center">
            {{ obj ? obj.LimitRange.Container.default.cpu : 0 }}
          </v-flex>
          <v-flex class="text-center py-0"> {{ $t('tip.default') }} </v-flex>
        </v-flex>
        <v-flex class="float-left limit-range-min-width">
          <v-flex class="text-body-2 text-center">
            {{ obj ? obj.LimitRange.Container.defaultRequest.cpu : 0 }}
          </v-flex>
          <v-flex class="text-center py-0"> {{ $t('tip.default_request') }} </v-flex>
        </v-flex>
        <v-flex class="float-left limit-range-min-width">
          <v-flex class="text-body-2 text-center">
            {{ obj ? obj.LimitRange.Container.max.cpu : 0 }}
          </v-flex>
          <v-flex class="text-center py-0"> {{ $t('tip.limit') }} </v-flex>
        </v-flex>
        <div class="kubegems__clear-float" />
      </v-flex>
      <div class="kubegems__clear-float" />
    </v-sheet>

    <v-sheet class="pa-1">
      <v-flex class="float-left">
        <v-flex class="float-left text-body-2 py-2 kubegems__min-width">
          <span>{{ $root.$t('resource.memory_c', [$root.$t('resource.container')]) }}</span>
        </v-flex>
        <v-flex class="float-left limit-range-min-width">
          <v-flex class="text-body-2 text-center">
            {{ obj ? obj.LimitRange.Container.default.memory : 0 }}
          </v-flex>
          <v-flex class="text-center py-0"> {{ $t('tip.default') }} </v-flex>
        </v-flex>
        <v-flex class="float-left limit-range-min-width">
          <v-flex class="text-body-2 text-center">
            {{ obj ? obj.LimitRange.Container.defaultRequest.memory : 0 }}
          </v-flex>
          <v-flex class="text-center py-0"> {{ $t('tip.default_request') }} </v-flex>
        </v-flex>
        <v-flex class="float-left limit-range-min-width">
          <v-flex class="text-body-2 text-center">
            {{ obj ? obj.LimitRange.Container.max.memory : 0 }}
          </v-flex>
          <v-flex class="text-center py-0"> {{ $t('tip.limit') }} </v-flex>
        </v-flex>
        <div class="kubegems__clear-float" />
      </v-flex>
      <div class="kubegems__clear-float" />
    </v-sheet>

    <v-sheet class="pa-1">
      <v-flex class="float-left">
        <v-flex class="float-left text-body-2 py-2 kubegems__min-width">
          <span>{{ $root.$t('resource.cpu_c', [$root.$t('resource.pod')]) }}</span>
        </v-flex>
        <v-flex class="float-left limit-range-min-width">
          <v-flex class="text-body-2 text-center">
            {{ obj ? obj.LimitRange.Pod.max.cpu : 0 }}
          </v-flex>
          <v-flex class="text-center py-0"> {{ $t('tip.limit') }} </v-flex>
        </v-flex>
        <div class="kubegems__clear-float" />
      </v-flex>
      <div class="kubegems__clear-float" />
    </v-sheet>

    <v-sheet class="pa-1">
      <v-flex class="float-left">
        <v-flex class="float-left text-body-2 py-2 kubegems__min-width">
          <span>{{ $root.$t('resource.memory_c', [$root.$t('resource.pod')]) }}</span>
        </v-flex>
        <v-flex class="float-left limit-range-min-width">
          <v-flex class="text-body-2 text-center">
            {{ obj ? obj.LimitRange.Pod.max.memory : 0 }}
          </v-flex>
          <v-flex class="text-center py-0"> {{ $t('tip.limit') }} </v-flex>
        </v-flex>
        <v-flex class="float-left limit-range-min-width">
          <v-flex class="text-body-2 text-center" />
          <v-flex class="text-center py-0" />
        </v-flex>
        <div class="kubegems__clear-float" />
      </v-flex>
      <div class="kubegems__clear-float" />
    </v-sheet>

    <v-sheet class="pa-1">
      <v-flex class="float-left">
        <v-flex class="float-left text-body-2 py-2 kubegems__min-width">
          <span>{{ $t('tip.storage_capacity') }}</span>
        </v-flex>
        <v-flex class="float-left limit-range-min-width">
          <v-flex class="text-body-2 text-center">
            {{ obj ? obj.LimitRange.PersistentVolumeClaim.max.storage : 0 }}
          </v-flex>
          <v-flex class="text-center py-0"> {{ $t('tip.limit') }} </v-flex>
        </v-flex>
        <div class="kubegems__clear-float" />
      </v-flex>
      <div class="kubegems__clear-float" />
    </v-sheet>
  </v-flex>
</template>

<script>
  import messages from '../../i18n';

  export default {
    name: 'LimitRangeCard',
    i18n: {
      messages: messages,
    },
    props: {
      obj: {
        type: Object,
        default: () => null,
      },
    },
  };
</script>

<style>
  .limit-range-min-width {
    width: 120px;
  }
</style>
