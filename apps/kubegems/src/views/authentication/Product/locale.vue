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
    v-model="state.menu"
    attach="#login_locale"
    bottom
    left
    nudge-bottom="5px"
    offset-y
    origin="top center"
    transition="scale-transition"
  >
    <template #activator="{ on }">
      <div id="login_locale" />
      <v-btn class="primary--text font-weight-medium mb-1" color="white" dark depressed v-on="on">
        {{ i18nLocal.t('tip.i18n') }}: &nbsp;
        <img class="locale__icon mr-2" :src="`/icon/i18n/${store.state.Locale}.svg`" />
        {{ localeShow }}
        <v-icon v-if="state.menu" right> mdi-chevron-up </v-icon>
        <v-icon v-else right> mdi-chevron-down </v-icon>
      </v-btn>
    </template>
    <v-data-iterator hide-default-footer :items="[{ text: i18nLocal.t('tip.i18n'), values: locales }]">
      <template #no-data>
        <v-card>
          <v-card-text>{{ i18n.t('data.no_data') }} </v-card-text>
        </v-card>
      </template>
      <template #default="props">
        <v-card v-for="item in props.items" :key="item.text" flat min-width="100px">
          <v-list dense>
            <v-flex class="text-subtitle-2 text-center ma-2">
              <span>{{ i18nLocal.t('tip.i18n') }}</span>
            </v-flex>
            <v-divider class="mx-2" />
            <v-list-item
              v-for="(ln, index) in item.values"
              :key="index"
              class="text-caption text-start font-weight-medium mx-2"
              link
              :style="{ color: ln.locale === locale ? `var(--primary-color) !important` : `` }"
              @click="setLocale(ln)"
            >
              <v-list-item-content>
                <div>
                  <div class="float-left mr-2">
                    <img class="locale__icon" :src="`/icon/i18n/${ln.locale}.svg`" />
                  </div>
                  <div class="float-left locale">{{ ln.title }}</div>
                  <div class="kubegems__clear-float" />
                </div>
              </v-list-item-content>
            </v-list-item>
          </v-list>
        </v-card>
      </template>
    </v-data-iterator>
  </v-menu>
</template>

<script lang="ts" setup>
  import { useGlobalI18n } from '@kubegems/extension/i18n';
  import locales from '@kubegems/extension/i18n/locales';
  import { useMeta } from '@kubegems/extension/router';
  import { useStore } from '@kubegems/extension/store';
  import config from '@kubegems/libs/constants/global';
  import moment from 'moment';
  import { computed, reactive, ref } from 'vue';

  import { useI18n } from '../i18n';

  const store = useStore();
  const i18n = useGlobalI18n();
  const i18nLocal = useI18n();
  const meta = useMeta();

  const state = reactive({
    menu: false,
  });

  const localeShow = computed(() => {
    const l = locales.find((l) => {
      return l.locale === locale.value;
    });
    if (l) {
      return `${l.title}`;
    }
    return ``;
  });

  const locale = ref(store.state.Locale || 'zh-Hans');
  const setLocale = (_locale) => {
    locale.value = _locale.locale;
    if (store.state.Locale === locale.value) return;
    useGlobalI18n().locale = _locale.locale;
    useI18n().locale = _locale.locale;
    moment.locale(locale.value === 'zh-Hans' ? 'zh-cn' : _locale.value);
    if (window) {
      window.document.title = `${i18nLocal.t(meta.value.title)} - ${config.layout.PLATFORM}`;
    }
    store.commit('SET_LOCALE', _locale.locale);
  };
</script>
