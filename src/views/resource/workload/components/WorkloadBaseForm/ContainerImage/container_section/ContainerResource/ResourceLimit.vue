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
  <v-sheet class="grey lighten-4 rounded ma-2">
    <v-list-item two-line>
      <v-list-item-content class="py-2">
        <v-list-item-subtitle class="text-body-2 py-0">
          <v-list-item class="float-left pa-0 kubegems__form-width" two-line>
            <v-list-item-content class="py-0">
              <v-list-item-title class="text-subtitle-2 py-1">
                {{
                  containerCopy && containerCopy.resources && containerCopy.resources.requests
                    ? containerCopy.resources.requests.cpu === '0'
                      ? $t('tip.no_limit')
                      : containerCopy.resources.requests.cpu
                    : $t('tip.no_limit')
                }}
                ~
                {{
                  containerCopy && containerCopy.resources && containerCopy.resources.limits
                    ? containerCopy.resources.limits.cpu === '0'
                      ? $t('tip.no_limit')
                      : containerCopy.resources.limits.cpu
                    : $t('tip.no_limit')
                }}
              </v-list-item-title>
              <v-list-item-subtitle class="text-body-2 py-1"> {{ $root.$t('resource.cpu') }} </v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
          <v-list-item class="float-left pa-0 kubegems__form-width" two-line>
            <v-list-item-content class="py-0">
              <v-list-item-title class="text-subtitle-2 py-1">
                {{
                  containerCopy && containerCopy.resources && containerCopy.resources.requests
                    ? containerCopy.resources.requests.memory === '0'
                      ? $t('tip.no_limit')
                      : containerCopy.resources.requests.memory
                    : $t('tip.no_limit')
                }}
                ~
                {{
                  containerCopy && containerCopy.resources && containerCopy.resources.limits
                    ? containerCopy.resources.limits.memory === '0'
                      ? $t('tip.no_limit')
                      : containerCopy.resources.limits.memory
                    : $t('tip.no_limit')
                }}
              </v-list-item-title>
              <v-list-item-subtitle class="text-body-2 py-1"> {{ $root.$t('resource.memory') }} </v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
        </v-list-item-subtitle>
        <div class="kubegems__clear-float" />
      </v-list-item-content>
      <v-btn color="primary" dark fab right text x-small @click="updateData">
        <v-icon>mdi-pencil</v-icon>
      </v-btn>
      <v-btn color="error" dark fab right text x-small @click="removeData">
        <v-icon>mdi-delete</v-icon>
      </v-btn>
    </v-list-item>
  </v-sheet>
</template>

<script>
  import messages from '../../../../../i18n';

  export default {
    name: 'ResourceLimit',
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
      updateData() {
        this.$emit('updateData');
      },
      removeData() {
        this.$emit('removeData');
      },
    },
  };
</script>
