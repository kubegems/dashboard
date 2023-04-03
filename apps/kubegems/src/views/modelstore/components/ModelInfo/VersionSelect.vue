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
        v-model="state.menu"
        bottom
        class="mx-1 px-1"
        left
        offset-y
        origin="top center"
        transition="scale-transition"
      >
        <template #activator="{ on }">
          <div class="text-body-2 mr-2 float-left mt-2">{{ i18nLocal.t('tip.version') }}</div>
          <v-btn class="primary--text font-weight-medium" color="white" text v-on="on">
            {{ selectVersion }}
            <v-icon v-if="state.menu" right> mdi-chevron-up </v-icon>
            <v-icon v-else right> mdi-chevron-down </v-icon>
          </v-btn>
          <v-btn
            v-clipboard:copy="selectVersion"
            v-clipboard:success="copyed"
            class="float-right mt-1"
            color="primary"
            icon
            small
          >
            <v-icon small> mdi-content-copy</v-icon>
          </v-btn>
        </template>
        <v-data-iterator
          class="file-iterator"
          hide-default-footer
          :items="[{ text: i18nLocal.t('tip.version'), values: versions || [] }]"
        >
          <template #no-data>
            <v-card>
              <v-card-text> {{ i18n.t('data.no_data') }} </v-card-text>
            </v-card>
          </template>
          <template #default="props">
            <v-card v-for="item in props.items" :key="item.text" flat min-height="100">
              <v-list dense>
                <v-flex class="text-subtitle-2 text-center ma-2">
                  <span>{{ i18nLocal.t('tip.version') }}</span>
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

<script lang="ts" setup>
  import { useGlobalI18n } from '@kubegems/extension/i18n';
  import { useStore } from '@kubegems/extension/store';
  import { reactive, ref, watch } from 'vue';

  import { useI18n } from '../../i18n';

  const props = withDefaults(
    defineProps<{
      versions?: { [key: string]: any }[];
    }>(),
    {
      versions: undefined,
    },
  );

  const i18n = useGlobalI18n();
  const i18nLocal = useI18n();
  const store = useStore();

  const state = reactive({
    menu: false,
  });

  const emit = defineEmits(['change', 'input']);
  const selectVersion = ref<string>('');
  const setVersion = (ver) => {
    selectVersion.value = ver?.name;
    emit('change', selectVersion.value);
    emit('input', selectVersion.value);
  };

  const copyed = () => {
    store.commit('SET_SNACKBAR', {
      text: i18nLocal.t('tip.copyed'),
      color: 'success',
    });
  };

  watch(
    () => props.versions,
    async (newValue) => {
      if (newValue && newValue?.length > 0) {
        selectVersion.value = newValue[0]?.name;
        emit('change', selectVersion.value);
        emit('input', selectVersion.value);
      }
    },
    { immediate: true, deep: true },
  );
</script>
