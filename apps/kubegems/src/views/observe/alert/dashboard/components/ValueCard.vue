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
    <v-card-text class="pa-5">
      <div class="d-flex justify-space-between">
        <div class="d-flex">
          <v-btn class="elevation-0 ml-4 mr-4" color="primary" dark fab>
            <v-icon large>{{ icon }}</v-icon>
          </v-btn>
          <div>
            <h2 class="text-h5">{{ value }}</h2>
            <h5 class="text-subtitle-2 font-weight-regular">{{ name }}</h5>
          </div>
        </div>
        <div class="d-flex align-center justify-center">
          <CompareValue :name="$t('tip.compare_yestoday')" :value1="compareValue" :value2="value" />
        </div>
      </div>
    </v-card-text>
  </v-card>
</template>

<script>
  import messages from '../../i18n';
  import CompareValue from './CompareValue';

  export default {
    name: 'ValueCard',
    i18n: {
      messages: messages,
    },
    components: {
      CompareValue,
    },
    props: {
      compareValue: {
        type: Number,
        default: 0,
      },
      icon: {
        type: String,
        default: 'mdi-format-list-checkbox',
      },
      name: {
        type: String,
        default: '',
      },
      value: {
        type: Number,
        default: 0,
      },
    },
  };
</script>
