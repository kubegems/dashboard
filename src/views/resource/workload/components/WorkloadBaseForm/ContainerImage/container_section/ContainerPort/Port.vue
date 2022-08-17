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
  <div>
    <v-sheet
      v-for="(item, index) in containerCopy && containerCopy.ports ? containerCopy.ports : []"
      :key="index"
      class="grey lighten-4 rounded ma-2"
    >
      <v-list-item two-line>
        <v-list-item-content class="py-2">
          <v-list-item-subtitle class="text-body-2 py-0">
            <v-list-item class="float-left pa-0 kubegems__three-width" two-line>
              <v-list-item-content class="py-0">
                <v-list-item-title class="text-subtitle-2 py-1">
                  {{ item.name }}
                </v-list-item-title>
                <v-list-item-subtitle class="text-body-2 py-1"> {{ $root.$t('form.name') }} </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
            <v-list-item class="float-left pa-0 kubegems__three-width" two-line>
              <v-list-item-content class="py-0">
                <v-list-item-title class="text-subtitle-2 py-1">
                  {{ item.protocol }}
                </v-list-item-title>
                <v-list-item-subtitle class="text-body-2 py-1"> {{ $t('tip.protocol') }} </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
            <v-list-item class="float-left pa-0 kubegems__three-width" two-line>
              <v-list-item-content class="py-0">
                <v-list-item-title class="text-subtitle-2 py-1">
                  {{ item.containerPort }}
                </v-list-item-title>
                <v-list-item-subtitle class="text-body-2 py-1"> {{ $t('tip.container_port') }} </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
          </v-list-item-subtitle>
          <div class="kubegems__clear-float" />
        </v-list-item-content>
        <v-btn color="primary" dark fab right text x-small @click="updateData(index)">
          <v-icon>mdi-pencil</v-icon>
        </v-btn>
        <v-btn color="error" dark fab right text x-small @click="removeData(index)">
          <v-icon>mdi-delete</v-icon>
        </v-btn>
      </v-list-item>
    </v-sheet>
  </div>
</template>

<script>
  import messages from '../../../../../i18n';

  export default {
    name: 'Port',
    i18n: {
      messages: messages,
    },
    props: {
      containerCopy: {
        type: Object,
        default: () => {},
      },
    },
    methods: {
      updateData(index) {
        this.$emit('updateData', index);
      },
      removeData(index) {
        this.$emit('removeData', index);
      },
    },
  };
</script>
