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
    <v-sheet v-for="(item, index) in ports" :key="index" class="grey lighten-4 rounded mb-3">
      <v-list-item two-line>
        <v-list-item-content class="py-2">
          <v-list-item-subtitle class="text-subtitle-2 py-1 primary--text">
            {{ item.name }}
          </v-list-item-subtitle>
          <v-list-item-subtitle class="text-body-2 py-0">
            <v-list-item class="float-left py-0 pl-0" :style="{ width: `250px` }" two-line>
              <v-list-item-content class="py-0">
                <v-list-item-title class="text-subtitle-2 py-1"> {{ item.targetPort }}&nbsp; </v-list-item-title>
                <v-list-item-subtitle class="text-body-2 py-1"> {{ $t('tip.container_port') }} </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
            <v-list-item class="float-left py-0" :style="{ width: `250px` }" two-line>
              <v-list-item-content class="py-0">
                <v-list-item-title class="text-subtitle-2 py-1">
                  {{
                    item.name && item.name.indexOf('-') > -1
                      ? item.name.substr(0, item.name.indexOf('-'))
                      : appProtocol.indexOf(item.name) > -1
                      ? item.name
                      : $root.$t('data.unknown')
                  }}&nbsp;
                </v-list-item-title>
                <v-list-item-subtitle class="text-body-2 py-1"> {{ $t('tip.protocol') }} </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
            <v-list-item class="float-left py-0" :style="{ width: `250px` }" two-line>
              <v-list-item-content class="py-0">
                <v-list-item-title class="text-subtitle-2 py-1"> {{ item.port }}&nbsp; </v-list-item-title>
                <v-list-item-subtitle class="text-body-2 py-1"> {{ $t('tip.service_port') }} </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
          </v-list-item-subtitle>
          <div class="kubegems__clear-float" />
        </v-list-item-content>
        <v-btn color="primary" dark fab right text x-small @click="updatePort(index)">
          <v-icon>mdi-pencil</v-icon>
        </v-btn>
        <v-btn color="error" dark fab right text x-small @click="removePort(index)">
          <v-icon>mdi-delete</v-icon>
        </v-btn>
      </v-list-item>
    </v-sheet>
    <v-flex class="grey lighten-4 rounded">
      <v-list-item two-line>
        <v-list-item-content class="py-2">
          <v-list-item-subtitle class="text-body-2 py-0 text-center">
            <v-btn color="primary" text @click="expandCard">
              <v-icon left small> mdi-plus </v-icon>
              {{ $root.$t('operate.add_c', [$t('tip.port')]) }}
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
    name: 'ServicePortItem',
    i18n: {
      messages: messages,
    },
    props: {
      ports: {
        type: Array,
        default: () => [],
      },
    },
    data() {
      return {
        appProtocol: ['http', 'https', 'tcp', 'mongo', 'grpc', 'tls', 'http2', 'mysql', 'redis'],
      };
    },
    methods: {
      updatePort(index) {
        this.$emit('updatePort', index);
      },
      removePort(index) {
        this.$emit('removePort', index);
      },
      expandCard() {
        this.$emit('expandCard', 'servicePortForm');
      },
    },
  };
</script>
