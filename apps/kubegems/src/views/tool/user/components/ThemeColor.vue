<template>
  <div>
    <v-card class="mt-3" flat>
      <v-card-text class="pa-2">
        <BaseSubTitle :divider="false" :title="i18nLocal.t('setting.tip.theme_color')" />
        <v-form class="px-4" lazy-validation @submit.prevent>
          <v-row class="mt-0">
            <v-col :class="`clear-zoom-${store.state.Scale.toString().replaceAll('.', '-')}`" cols="12">
              <div class="ml-6 mb-2">
                {{ i18nLocal.t('setting.tip.now_theme_color') }}
                <div
                  :style="{
                    backgroundColor: store.state.ThemeColor || config.theme.THEME_COLOR.primary,
                    width: '46px',
                    height: '20px',
                    borderRadius: '3px',
                  }"
                />
              </div>
              <div class="ml-6">{{ themeColor }}</div>
              <v-color-picker
                v-model="themeColor"
                class="mx-2"
                hide-canvas
                hide-inputs
                hide-mode-switch
                mode="hexa"
                swatches-max-height="200"
                width="100%"
              />
            </v-col>
          </v-row>
          <v-btn class="my-4" color="primary" small @click="updateThemeColor">
            {{ i18n.t('operate.update_c', [i18nLocal.t('setting.tip.theme_color')]) }}
          </v-btn>
        </v-form>
      </v-card-text>
    </v-card>
  </div>
</template>

<script lang="ts" setup>
  import { useGlobalI18n } from '@kubegems/extension/i18n';
  import { useVuetify } from '@kubegems/extension/proxy';
  import { useStore } from '@kubegems/extension/store';
  import { ref } from 'vue';

  import config from '../../../../config.json';
  import { refreshColor } from '../../../../loadConfig';
  import { useI18n } from '../i18n';

  const store = useStore();
  const i18n = useGlobalI18n();
  const i18nLocal = useI18n();

  const vuetify = useVuetify();
  const themeColor = ref(store.state.ThemeColor || config.theme.THEME_COLOR.primary);
  const updateThemeColor = (): void => {
    store.commit('SET_THEME_COLOR', themeColor.value);
    refreshColor();
    vuetify.theme.themes.light.primary = themeColor.value;
  };
</script>
