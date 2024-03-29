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
    <v-sheet v-for="(item, index) in alertlevels" :key="index" class="grey lighten-4 rounded mb-3">
      <v-list-item two-line>
        <v-list-item-content class="py-2">
          <v-list-item-subtitle class="text-body-2 py-0">
            <v-list-item class="float-left py-0 pl-0" :style="{ width: `270px` }" two-line>
              <v-list-item-content class="py-0">
                <v-list-item-title class="text-subtitle-2 py-1 primary--text">
                  {{ $t('table.severity') }}
                </v-list-item-title>
                <v-list-item-subtitle class="text-body-2 py-1">
                  {{ severityMap(item.severity) }}
                </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
            <template v-if="mod === 'template'">
              <v-list-item class="float-left py-0 pl-0" :style="{ width: `270px` }" two-line>
                <v-list-item-content class="py-0">
                  <v-list-item-title class="text-subtitle-2 py-1 primary--text">
                    {{ $t('tip.trigger_condition') }}
                  </v-list-item-title>
                  <v-list-item-subtitle class="text-body-2 py-1">
                    {{ compareMap(item.compareOp) }}
                  </v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
              <v-list-item class="float-left py-0 pl-0" :style="{ width: `270px` }" two-line>
                <v-list-item-content class="py-0">
                  <v-list-item-title class="text-subtitle-2 py-1 primary--text">
                    {{ $t('tip.trigger_val') }}
                  </v-list-item-title>
                  <v-list-item-subtitle class="text-body-2 py-1">
                    {{ item.compareValue }}
                  </v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
            </template>
          </v-list-item-subtitle>
          <div class="kubegems__clear-float" />
        </v-list-item-content>
        <v-btn color="primary" dark fab right text x-small @click="updateAlertLevel(index)">
          <v-icon>mdi-pencil</v-icon>
        </v-btn>
        <v-btn color="error" dark fab right text x-small @click="removeAlertLevel(index)">
          <v-icon>mdi-delete</v-icon>
        </v-btn>
      </v-list-item>
    </v-sheet>
    <v-flex v-if="mod === 'template' || alertlevels.length === 0" class="grey lighten-4 rounded">
      <v-list-item two-line>
        <v-list-item-content class="py-2">
          <v-list-item-subtitle class="text-body-2 py-0 text-center">
            <v-btn color="primary" text @click="expandCard">
              <v-icon left small> mdi-plus </v-icon>
              {{ $root.$t('operate.add_c', [$t('table.severity')]) }}
            </v-btn>
          </v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>
    </v-flex>
  </v-flex>
</template>

<script>
  import messages from '../../../../../i18n';

  export default {
    name: 'AlertLevelItem',
    i18n: {
      messages: messages,
    },
    props: {
      alertlevels: {
        type: Array,
        default: () => [],
      },
      mod: {
        type: String,
        default: () => 'template',
      },
    },
    methods: {
      updateAlertLevel(index) {
        this.$emit('updateAlertLevel', index);
      },
      removeAlertLevel(index) {
        this.$emit('removeAlertLevel', index);
      },
      expandCard() {
        this.$emit('expandCard', 'alertLevelForm');
      },
      severityMap(text) {
        const obj = { warning: '普通', error: '重要', critical: '紧急' };
        return obj[text] || '';
      },
      compareMap(text) {
        const obj = {
          '>': '大于',
          '<': '小于',
          '<=': '小于或等于',
          '>=': '大于或等于',
          '=': '等于',
          '==': '等于',
          '!=': '不等于',
        };
        return obj[text] || '';
      },
    },
  };
</script>
