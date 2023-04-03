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
    <v-row>
      <v-col v-for="(option, index) in options" :key="index" class="pa-0" cols="6">
        <v-flex class="grey lighten-4 rounded mt-3 mx-3">
          <v-list-item>
            <v-list-item-content class="kubegems__label-class-padding kubegems__break-all">
              <strong class="mr-2 primary--text py-1">
                {{ option.name }}
              </strong>
              <span v-if="option.value">{{ option.value }}</span>
              <span v-else>&nbsp;</span>
            </v-list-item-content>

            <v-btn color="primary" dark fab right text x-small @click="updateOption(index)">
              <v-icon>mdi-pencil</v-icon>
            </v-btn>
            <v-btn color="error" dark fab right text x-small @click="removeOption(index)">
              <v-icon>mdi-delete</v-icon>
            </v-btn>
          </v-list-item>
        </v-flex>
      </v-col>
    </v-row>
    <v-flex class="grey lighten-4 rounded mt-6">
      <v-list-item two-line>
        <v-list-item-content class="py-2">
          <v-list-item-subtitle class="text-body-2 py-0 text-center">
            <v-btn color="primary" text @click="expandCard">
              <v-icon left small> mdi-plus </v-icon>
              {{ $root.$t('operate.add_c', ['Option']) }}
            </v-btn>
          </v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>
    </v-flex>
  </v-flex>
</template>

<script>
  import BaseResource from '@/mixins/resource';

  export default {
    name: 'DNSOptionItem',
    mixins: [BaseResource],
    props: {
      options: {
        type: Array,
        default: () => [],
      },
    },
    methods: {
      updateOption(index) {
        this.$emit('updateOption', index);
      },
      removeOption(index) {
        this.$emit('removeOption', index);
      },
      expandCard() {
        this.$emit('expandCard', 'dnsOptionForm');
      },
    },
  };
</script>
