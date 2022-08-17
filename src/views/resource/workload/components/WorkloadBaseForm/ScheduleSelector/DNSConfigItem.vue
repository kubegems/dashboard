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
    <v-sheet v-if="dnsConfig" class="grey lighten-4 rounded mb-3">
      <v-list-item two-line>
        <v-list-item-content class="py-2">
          <v-list-item-subtitle class="text-subtitle-2 py-1 primary--text" />
          <v-list-item-subtitle class="text-body-2 py-0">
            <v-list-item class="pa-0" two-line>
              <v-list-item-content class="py-0">
                <v-list-item-title class="text-subtitle-2 py-1">
                  <span
                    v-for="(nameserver, index) in dnsConfig && dnsConfig.nameservers ? dnsConfig.nameservers : []"
                    :key="index"
                    class="mr-2"
                  >
                    {{ nameserver }}
                  </span>
                </v-list-item-title>
                <v-list-item-subtitle class="text-body-2 py-1"> nameservers </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
            <v-list-item class="pa-0" two-line>
              <v-list-item-content class="py-0">
                <v-list-item-title class="text-subtitle-2 py-1">
                  <span
                    v-for="(search, index) in dnsConfig && dnsConfig.searches ? dnsConfig.searches : []"
                    :key="index"
                    class="mr-2"
                  >
                    {{ search }}
                  </span>
                </v-list-item-title>
                <v-list-item-subtitle class="text-body-2 py-1"> searches </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
            <v-list-item class="pa-0" two-line>
              <v-list-item-content class="py-0">
                <v-list-item-title class="text-subtitle-2 py-1">
                  <span
                    v-for="(option, index) in dnsConfig && dnsConfig.options ? dnsConfig.options : []"
                    :key="index"
                    class="mr-2"
                  >
                    {{ option.name }}
                    <span v-if="option.value">: {{ option.value }}</span>
                  </span>
                </v-list-item-title>
                <v-list-item-subtitle class="text-body-2 py-1"> options </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
          </v-list-item-subtitle>
          <div class="kubegems__clear-float" />
        </v-list-item-content>
        <v-btn color="primary" dark fab right text x-small @click="updateDNSConfig">
          <v-icon>mdi-pencil</v-icon>
        </v-btn>
        <v-btn color="error" dark fab right text x-small @click="removeDNSConfig">
          <v-icon>mdi-delete</v-icon>
        </v-btn>
      </v-list-item>
    </v-sheet>
    <v-flex v-else class="grey lighten-4 rounded mt-0">
      <v-list-item two-line>
        <v-list-item-content class="py-2">
          <v-list-item-subtitle class="text-body-2 py-0 text-center">
            <v-btn color="primary" text @click="expandCard">
              <v-icon left small> mdi-plus </v-icon>
              {{ $root.$t('operate.add_c', [$t('tip.dns_config')]) }}
            </v-btn>
          </v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>
    </v-flex>
  </v-flex>
</template>

<script>
  import messages from '../../../i18n';
  import BaseResource from '@/mixins/resource';

  export default {
    name: 'DNSConfigItem',
    i18n: {
      messages: messages,
    },
    mixins: [BaseResource],
    props: {
      dnsConfig: {
        type: Object,
        default: () => null,
      },
    },
    methods: {
      updateDNSConfig() {
        this.$emit('updateDNSConfig');
      },
      removeDNSConfig() {
        this.$emit('removeDNSConfig');
      },
      expandCard() {
        this.$emit('expandCard', 'dnsConfigForm');
      },
    },
  };
</script>
