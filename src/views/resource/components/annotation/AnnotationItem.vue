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
      <template v-for="(value, key) in annotations">
        <v-col v-if="$ANNOTATION_IGNORE_ARRAY.indexOf(key) === -1" :key="key" class="pa-0" cols="6">
          <v-flex class="grey lighten-4 rounded mt-3 mx-3">
            <v-list-item>
              <v-list-item-content class="kubegems__label-class-padding kubegems__break-all">
                <strong class="mr-2 primary--text py-1"> {{ key }} </strong>
                {{ value }}
              </v-list-item-content>

              <v-btn color="primary" dark fab right text x-small @click="updateAnnotations(key)">
                <v-icon>mdi-pencil</v-icon>
              </v-btn>
              <v-btn color="error" dark fab right text x-small @click="removeAnnotations(key)">
                <v-icon>mdi-delete</v-icon>
              </v-btn>
            </v-list-item>
          </v-flex>
        </v-col>
      </template>
    </v-row>
    <v-flex class="grey lighten-4 rounded mt-6">
      <v-list-item two-line>
        <v-list-item-content class="py-2">
          <v-list-item-subtitle class="text-body-2 py-0 text-center">
            <v-btn color="primary" text @click="expandCard">
              <v-icon left small> mdi-tag-plus </v-icon>
              {{ $root.$t('operate.add_c', [$t('tip.annotation')]) }}
            </v-btn>
          </v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>
    </v-flex>
  </v-flex>
</template>

<script>
  import messages from '../i18n';
  import BaseResource from '@/mixins/resource';

  export default {
    name: 'AnnotationItem',
    i18n: {
      messages: messages,
    },
    mixins: [BaseResource],
    props: {
      annotations: {
        type: Object,
        default: () => {},
      },
    },
    methods: {
      updateAnnotations(key) {
        this.$emit('updateAnnotations', key);
      },
      removeAnnotations(key) {
        this.$emit('removeAnnotations', key);
      },
      expandCard() {
        this.$emit('expandCard', 'annotationForm');
      },
    },
  };
</script>
