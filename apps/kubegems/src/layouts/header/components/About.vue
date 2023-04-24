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
  <v-dialog v-model="state.dialog" height="100%" :max-width="700" persistent scrollable>
    <v-card>
      <v-card-text class="pa-0">
        <div>
          <v-img class="ma-2" contain :src="config.layout.LOGO_BLUE" width="200" />
          <div class="kubegems__clear-float" />
        </div>
        <v-divider />
        <h6 class="text-subtitle-2 ma-4 font-weight-medium">
          {{ config.layout.SLOGAN_CN }}
        </h6>

        <v-flex v-for="(value, key) in version" :key="key" class="mx-4">
          <h6 class="text-body-2 grey--text text--darken-1 font-weight-regular"> {{ cnDict[key] }} : {{ value }} </h6>
        </v-flex>
      </v-card-text>
      <v-divider class="mt-4" />
      <v-card-title class="text-body-2 kubegems__text px-4">
        <div class="title__pointer mr-1" :style="{ fontWeight: 500 }" @click.stop="toOpenProtocol">
          <a class="float-left title__div kubegems__text">
            <BaseLogo icon-name="apache" :ml="0" :width="18" />
            {{ i18nLocal.t('tip.openresource') }}
          </a>
        </div>

        <div class="title__pointer" @click.stop="toProject">
          <v-btn class="float-left" icon small>
            <v-icon>mdi-github</v-icon>
          </v-btn>
          <div class="float-left title__div"> {{ i18nLocal.t('tip.project_address') }} </div>
        </div>

        <div class="ml-2 title__pointer" @click.stop="toIssue">
          <v-btn class="float-left" color="red lighten-1" icon small>
            <v-icon>mdi-bug</v-icon>
          </v-btn>
          <div class="float-left title__div"> {{ i18nLocal.t('tip.issue') }} </div>
        </div>

        <v-spacer />

        <div class="ml-2 title__pointer" @click.stop="toStar">
          <v-btn class="float-left" color="orange" icon small>
            <v-icon>mdi-star</v-icon>
          </v-btn>
          <div class="float-left title__div"> {{ i18nLocal.t('tip.star') }} </div>
        </div>
      </v-card-title>
      <div class="pa-2">
        <v-btn class="float-right" color="error" small text @click="state.dialog = false">
          {{ i18n.t('operate.close') }}
        </v-btn>
      </div>
    </v-card>
  </v-dialog>
</template>

<script lang="ts" setup>
  import { Version } from '@kubegems/api/typed/version';
  import { useGlobalI18n } from '@kubegems/extension/i18n';
  import { useRouter } from '@kubegems/extension/proxy';
  import moment from 'moment';
  import { reactive, ref } from 'vue';

  import config from '../../../config.json';
  import { useI18n } from '../i18n';

  const i18nLocal = useI18n();
  const i18n = useGlobalI18n();
  const router = useRouter();

  const state = reactive({
    dialog: false,
  });

  const cnDict: { [key: string]: any } = {
    version: i18nLocal.t('about.dashboard_version'),
    date: i18nLocal.t('about.dashboard_release_time'),
    GitVersion: i18nLocal.t('about.api_version'),
    GitCommit: 'Commit',
    BuildDate: i18nLocal.t('about.api_release_time'),
    GoVersion: i18nLocal.t('about.go_version'),
    Compiler: i18nLocal.t('about.compile'),
    Platform: i18nLocal.t('about.compile_platform'),
    timezone: i18nLocal.t('about.timezone'),
  };

  const open = (): void => {
    state.dialog = true;
  };

  const version = ref<Version>(new Version());
  const init = async (): Promise<void> => {
    const data = await new Version().getVersion({ noprocessing: true });
    version.value = Object.assign(data, {
      version: import.meta.env.VUE_APP_RELEASE,
      date: import.meta.env.VUE_APP_DATE ? moment(import.meta.env.VUE_APP_DATE).format('lll') : '',
      timezone: `${Intl.DateTimeFormat().resolvedOptions().timeZone} UTC+${0 - new Date().getTimezoneOffset() / 60}`,
    });
  };

  const toProject = (): void => {
    window.open('https://github.com/kubegems/kubegems');
  };
  const toIssue = (): void => {
    window.open('https://github.com/kubegems/kubegems/issues');
  };
  const toStar = (): void => {
    window.open('https://github.com/kubegems/kubegems');
  };
  const toOpenProtocol = (): void => {
    window.open(router.resolve({ name: 'clincense' }).href);
  };

  defineExpose({
    init,
    open,
  });
</script>

<style lang="scss" scoped>
  .v-list-item--dense,
  .v-list--dense .v-list-item {
    min-height: 30px;
  }

  .title {
    &__div {
      line-height: 28px;
    }

    &__pointer {
      cursor: pointer;
    }
  }
</style>
