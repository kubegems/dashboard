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
  <v-menu :nudge-width="200" offset-x open-on-hover>
    <template #activator="{ on, attrs }">
      <v-icon v-bind="attrs" color="warning" small v-on="on"> mdi-alert-circle </v-icon>
    </template>
    <v-card flat max-width="300">
      <v-list dense>
        <v-flex class="text-subtitle-2 text-center ma-2">
          <span>{{ $t('tip.third_registry') }}</span>
        </v-flex>
        <v-divider class="mx-2" />
        <v-list-item>
          <v-list-item-content>
            <v-list-item-title>{{ $t('tip.advise') }}:</v-list-item-title>
            <v-list-item-content class="text-body-2 kubegems__text">
              {{ msg }}
            </v-list-item-content>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-card>
  </v-menu>
</template>

<script>
  import messages from '../../i18n';

  export default {
    name: 'Tips',
    i18n: {
      messages: messages,
    },
    props: {
      msg: {
        type: String,
        default: () => '',
      },
    },
  };
</script>
