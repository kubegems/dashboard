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
  <v-sheet class="text-body-2 text--darken-1 mx-1 mt-4 version">
    <div>
      <v-menu
        v-model="versionMenu"
        bottom
        class="mx-1 px-1"
        left
        offset-y
        origin="top center"
        transition="scale-transition"
      >
        <template #activator="{ on }">
          <span class="text-body-2 mr-2">{{ $t('tip.version') }}</span>
          <v-btn class="primary--text font-weight-medium" color="white" text v-on="on">
            {{ selectVersion }}
            <v-icon v-if="versionMenu" right> mdi-chevron-up </v-icon>
            <v-icon v-else right> mdi-chevron-down </v-icon>
          </v-btn>
        </template>
        <v-data-iterator
          class="file-iterator"
          hide-default-footer
          :items="[{ text: $t('tip.version'), values: versions }]"
        >
          <template #no-data>
            <v-card>
              <v-card-text> {{ $root.$t('data.no_data') }} </v-card-text>
            </v-card>
          </template>
          <template #default="props">
            <v-card v-for="item in props.items" :key="item.text" flat min-height="100">
              <v-list dense>
                <v-flex class="text-subtitle-2 text-center ma-2">
                  <span>{{ $t('tip.version') }}</span>
                </v-flex>
                <v-divider class="mx-2" />
                <v-list-item
                  v-for="(ver, index) in item.values"
                  :key="index"
                  class="text-body-2 text-center font-weight-medium mx-2"
                  link
                  :style="{ color: ver.name === selectVersion ? `#1e88e5 !important` : `` }"
                  @click="setVersion(ver)"
                >
                  <v-list-item-content>
                    <span>{{ ver.name }}</span>
                  </v-list-item-content>
                </v-list-item>
              </v-list>
            </v-card>
          </template>
        </v-data-iterator>
      </v-menu>
    </div>
  </v-sheet>
</template>

<script>
  import messages from '../../i18n';

  export default {
    name: 'VersionSelect',
    i18n: {
      messages: messages,
    },
    props: {
      versions: {
        type: Array,
        default: () => [],
      },
    },
    data() {
      return {
        versionMenu: false,
        selectVersion: '',
      };
    },
    watch: {
      versions: {
        handler(newValue) {
          if (newValue && newValue.length > 0) {
            this.selectVersion = newValue[0]?.name;
            this.$emit('change', this.selectVersion);
            this.$emit('input', this.selectVersion);
          }
        },
        deep: true,
        immediate: true,
      },
      value: {
        handler(newValue) {
          this.selectVersion = newValue;
        },
        deep: true,
        immediate: true,
      },
    },
    methods: {
      setVersion(ver) {
        this.selectVersion = ver?.name;
        this.$emit('change', this.selectVersion);
        this.$emit('input', this.selectVersion);
      },
    },
  };
</script>
