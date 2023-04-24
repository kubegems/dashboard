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
  <v-menu
    v-model="menu"
    bottom
    :close-on-content-click="false"
    content-class="menu"
    max-height="300px"
    max-width="200px"
    min-width="100px"
    nudge-bottom="5px"
    offset-y
    origin="top center"
    right
    transition="scale-transition"
  >
    <template #activator="{ on }">
      <div class="float-left">
        <v-btn class="font-weight-medium primary--text select__btn" color="white" dark depressed small v-on="on">
          {{ version }}
          <v-icon v-if="menu" right> mdi-chevron-up </v-icon>
          <v-icon v-else right> mdi-chevron-down </v-icon>
        </v-btn>
        <div class="kubegems__clear-float" />
      </div>
    </template>
    <v-data-iterator
      hide-default-footer
      :items="[
        {
          text: $t('tip.version'),
          values: versions,
        },
      ]"
    >
      <template #no-data>
        <v-card>
          <v-card-text> {{ $t('data.no_data') }} </v-card-text>
        </v-card>
      </template>
      <template #default="props">
        <v-card v-for="(item, index) in props.items" :key="index" flat>
          <v-list class="pb-3" dense>
            <v-flex class="text-subtitle-2 text-center ma-2">
              <span>{{ $t('tip.version') }}</span>
            </v-flex>
            <v-divider class="mx-2" />
            <div class="header__list px-2">
              <v-list-item
                v-for="(v, index) in item.values"
                :key="`v${index}`"
                class="text-body-2 text-center font-weight-medium px-0"
                link
                :style="{ color: v === version ? `var(--primary-color) !important` : `` }"
                @click="setVersion(v)"
              >
                <v-list-item-content class="text-body-2 font-weight-medium text-start">
                  <div class="kubegems__break-all">
                    {{ v }}{{ installedVersion === v ? `(${$t('tip.now')})` : '' }}
                  </div>
                </v-list-item-content>
              </v-list-item>
            </div>
          </v-list>
        </v-card>
      </template>
    </v-data-iterator>
  </v-menu>
</template>

<script>
  import messages from '../i18n';

  export default {
    name: 'VersionSelect',
    i18n: {
      messages: messages,
    },
    props: {
      installedVersion: {
        type: String,
        default: () => '',
      },
      versions: {
        type: Array,
        default: () => [],
      },
    },
    data() {
      return {
        menu: false,
        version: '',
      };
    },
    watch: {
      installedVersion: {
        handler(newValue) {
          if (newValue) {
            this.version = newValue;
          } else {
            this.version = this.versions[0];
          }
        },
        deep: true,
        immediate: true,
      },
    },
    methods: {
      setVersion(v) {
        this.version = v;
        this.menu = false;
        this.$emit('input', v);
        // this.$emit('change', v);
      },
    },
  };
</script>

<style lang="scss" scoped>
  .select__btn {
    padding: 0 2px !important;
  }
</style>
