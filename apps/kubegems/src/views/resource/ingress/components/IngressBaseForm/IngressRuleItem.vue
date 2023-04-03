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
    <v-sheet v-for="(item, index) in rules" :key="index" class="grey lighten-4 rounded mb-3">
      <v-list-item two-line>
        <v-list-item-content class="py-2">
          <v-list-item-subtitle class="text-subtitle-2 py-1 primary--text">
            <span>{{ item.host }}</span>
          </v-list-item-subtitle>
          <v-list-item-content v-for="(path, i) in item.http.paths" :key="i">
            <v-row>
              <v-col class="py-1" cols="4">
                <span class="text-body-2">{{ $t('tip.path') }} : </span>
                <span class="text-subtitle-2">{{ path.path }}</span>
              </v-col>
              <v-col class="py-1" cols="4">
                <span class="text-body-2">{{ $root.$t('resource.service') }} : </span>
                <span class="text-subtitle-2">
                  {{ path.backend.service.name }}
                </span>
              </v-col>
              <v-col class="py-1" cols="4">
                <span class="text-body-2">{{ $t('tip.port') }} : </span>
                <span class="text-subtitle-2">
                  {{ path.backend.service.port.name || path.backend.service.port.number }}
                </span>
              </v-col>
            </v-row>
          </v-list-item-content>
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
              {{ $root.$t('operate.add_c', [$t('tip.ingress_rule')]) }}
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
    name: 'IngressRuleItem',
    i18n: {
      messages: messages,
    },
    props: {
      rules: {
        type: Array,
        default: () => [],
      },
    },
    methods: {
      updatePort(index) {
        this.$emit('updatePort', index);
      },
      removePort(index) {
        this.$emit('removePort', index);
      },
      expandCard() {
        this.$emit('expandCard', 'ingressRuleForm');
      },
    },
  };
</script>
