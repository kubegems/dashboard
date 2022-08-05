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
    content-class="header__bg"
    left
    min-width="120"
    nudge-bottom="5px"
    offset-y
    origin="top center"
    transition="scale-transition"
  >
    <template #activator="{ on }">
      <v-btn color="primary" dark depressed v-on="on">
        <v-icon class="header-icon-line-height"> mdi-translate </v-icon>
        <v-icon v-if="menu"> mdi-chevron-up </v-icon>
        <v-icon v-else> mdi-chevron-down </v-icon>
      </v-btn>
    </template>
    <v-data-iterator hide-default-footer :items="[{ text: '', values: languages }]">
      <template #default="props">
        <v-card v-for="item in props.items" :key="item.text" flat>
          <v-list dense>
            <v-list-item
              v-for="(language, index) in item.values"
              :key="index"
              class="text-body-2 text-start font-weight-medium pl-2 mx-2"
              link
              :style="{
                color: language.locale === Locale ? '#1e88e5 !important' : 'rgba(0, 0, 0, 0.7) !important',
              }"
              @click="setLocale(language)"
            >
              <v-list-item-content class="text-body-2 font-weight-medium">
                <span>
                  <v-icon :class="language.locale === Locale ? 'header__highlight' : ''" left small>
                    mdi-translate
                  </v-icon>
                  {{ language.title }}
                </span>
              </v-list-item-content>
            </v-list-item>
          </v-list>
        </v-card>
      </template>
    </v-data-iterator>
  </v-menu>
</template>

<script>
  import { mapState } from 'vuex';

  import locales from '@/i18n/locales';

  export default {
    name: 'Translate',
    inject: ['reload'],
    data() {
      return {
        menu: false,
      };
    },
    computed: {
      ...mapState(['Locale']),
      languages() {
        return locales;
      },
    },
    methods: {
      setLocale(locale) {
        this.$i18n.locale = locale.locale;
        this.$moment.locale(locale.locale === 'zh-Hans' ? 'zh-cn' : locale.locale);
        this.$store.commit('SET_LOCALE', locale.locale);
        this.reload();
      },
    },
  };
</script>

<style lang="scss" scoped>
  .header {
    &__highlight {
      color: #1e88e5 !important;
    }
  }
</style>
