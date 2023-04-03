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
  <v-flex>
    <v-flex v-for="(item, index) in items" :key="index" class="grey lighten-4 rounded ma-2">
      <v-list-item two-line>
        <v-list-item-content class="py-2">
          <v-list-item-subtitle class="text-body-2 py-0">
            <v-list-item class="float-left py-0 pl-0" two-line>
              <v-list-item-content class="py-0">
                <v-list-item-title class="text-subtitle-2 py-1 primary--text">
                  {{ $t('form.domain') }} {{ index + 1 }}
                </v-list-item-title>
                <v-list-item-subtitle class="text-body-2 py-1">
                  {{ item }}
                </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
          </v-list-item-subtitle>
          <div class="kubegems__clear-float" />
        </v-list-item-content>
        <v-btn color="primary" dark fab right text x-small @click="updateConfig(index)">
          <v-icon>mdi-pencil</v-icon>
        </v-btn>
        <v-btn color="error" dark fab right text x-small @click="removeConfig(index)">
          <v-icon>mdi-delete</v-icon>
        </v-btn>
      </v-list-item>
    </v-flex>
    <v-flex class="grey lighten-4 rounded ma-2">
      <v-list-item two-line>
        <v-list-item-content class="py-2">
          <v-list-item-subtitle class="text-body-2 py-0 text-center">
            <v-btn color="primary" text @click="expandCard">
              <v-icon left small> mdi-plus </v-icon>
              {{ $root.$t('operate.add_c', [$t('form.domain')]) }}
            </v-btn>
          </v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>
    </v-flex>
  </v-flex>
</template>

<script>
  import messages from '../../i18n';

  export default {
    name: 'DnsNameItem',
    i18n: {
      messages: messages,
    },
    props: {
      items: {
        type: Array,
        default: () => null,
      },
    },
    methods: {
      expandCard() {
        this.$emit('expandCard', 'dnsNameForm');
      },
      removeConfig(index) {
        this.$emit('removeConfig', 'DnsName', index);
      },
      updateConfig(index) {
        this.$emit('updateConfig', 'DnsName', index);
      },
    },
  };
</script>
