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
  <v-list-item-content class="py-2">
    <v-list-item-subtitle class="text-body-2 py-0">
      <v-list-item class="float-left pa-0 downward__item" two-line>
        <v-list-item-content class="py-0">
          <v-list-item-title class="text-subtitle-2 py-1">
            <span> Downward API </span>
          </v-list-item-title>
          <v-list-item-subtitle class="text-body-2 py-1"> {{ $root.$t('resource.type') }} </v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>
      <v-list-item class="float-left pa-0 downward__item" two-line>
        <v-list-item-content class="py-0">
          <v-list-item-title class="text-subtitle-2 py-1">
            <span>
              {{ item.name }}
            </span>
          </v-list-item-title>
          <v-list-item-subtitle class="text-body-2 py-1"> {{ $root.$t('form.name') }} </v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>
      <v-list-item class="float-left pa-0 downward__item" two-line>
        <v-list-item-content class="py-0">
          <v-list-item-title class="text-subtitle-2 py-1">
            <span> Pod </span>
          </v-list-item-title>
          <v-list-item-subtitle class="text-body-2 py-1"> {{ $t('tip.method') }} </v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>
      <v-list-item class="float-left pa-0 downward__item" two-line>
        <v-list-item-content class="py-0">
          <v-list-item-title class="text-subtitle-2 py-1">
            <span>
              {{ item.valueFrom.fieldRef.fieldPath }}
            </span>
          </v-list-item-title>
          <v-list-item-subtitle class="text-body-2 py-1"> fieldPath </v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>
    </v-list-item-subtitle>
    <div class="kubegems__clear-float" />
  </v-list-item-content>
</template>

<script>
  import messages from '../../../../../i18n';

  export default {
    name: 'DownwardPod',
    i18n: {
      messages: messages,
    },
    props: {
      item: {
        type: Object,
        default: () => ({}),
      },
    },
  };
</script>

<style lang="scss" scoped>
  .downward__item {
    width: 200px;
    word-break: break-all;
    white-space: break-spaces;
  }
</style>
