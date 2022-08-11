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
  <v-card flat>
    <v-card-text class="pa-7">
      <div class="d-flex justify-center my-3">
        <div class="text-center">
          <BaseLogo :icon-name="appName" large :width="100" />
          <h3 class="mt-2 text-h6 font-weight-medium primary--text">
            {{ appName }}
          </h3>
          <div v-if="showVersion" class="mx-1">
            <div class="text-body-2 float-left version__tip">chart {{ $t('tip.version') }}</div>
            <v-menu
              v-model="chartMenu"
              bottom
              left
              nudge-bottom="5px"
              offset-y
              origin="top center"
              transition="scale-transition"
              z-index="4"
            >
              <template #activator="{ on }">
                <v-btn class="primary--text font-weight-medium px-2" color="white" text v-on="on">
                  {{ selectVersionBind }}
                  <v-icon v-if="chartMenu" right> mdi-chevron-up </v-icon>
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
                  <v-card class="app-overflow-y" flat max-height="300">
                    <v-list v-for="item in props.items" :key="item.text" dense>
                      <v-flex class="text-subtitle-2 text-center ma-2">
                        <span>{{ $t('tip.version') }}</span>
                      </v-flex>
                      <v-divider class="mx-2" />
                      <v-list-item
                        v-for="(version, index) in item.values"
                        :key="index"
                        class="text-body-2 text-center font-weight-medium mx-2"
                        link
                        :style="{ color: version === selectVersionBind ? `#1e88e5 !important` : `` }"
                        @click="setVersion(version)"
                      >
                        <v-list-item-content>
                          <span>{{ version }}</span>
                        </v-list-item-content>
                      </v-list-item>
                    </v-list>
                  </v-card>
                </template>
              </v-data-iterator>
            </v-menu>
          </div>
        </div>
      </div>
      <v-divider />
      <div class="py-5">
        <h5 class="text-subtitle-1 kubegems__text">{{ $t('tip.registry') }}</h5>
        <h6 class="text-body-2 mb-3">
          {{ selectRepo }}
        </h6>
        <h5 class="text-subtitle-1 kubegems__text">{{ $t('tip.app_version') }}</h5>
        <h6 class="text-body-2 mb-2">{{ currentApp.appVersion }}</h6>
        <h5 class="text-subtitle-1 kubegems__text">{{ $t('tip.desc') }}</h5>
        <h6 class="text-body-2 mb-3">
          {{ currentApp.description }}
        </h6>
        <h5 class="text-subtitle-1 kubegems__text">{{ $t('tip.create_at') }}</h5>
        <h6 class="text-body-2 mb-3">
          {{ currentApp.created ? $moment(currentApp.created).format('lll') : '' }}
        </h6>
        <template v-if="currentApp.maintainers && currentApp.maintainers.length > 0">
          <h5 class="text-subtitle-1 kubegems__text">{{ $t('tip.maintainer') }}</h5>
          <h6 class="text-body-2 mb-3">
            <div v-for="(maintainer, index) in currentApp.maintainers" :key="index" class="mb-3">
              <span v-if="maintainer.name" class="mr-2">
                <v-icon small>mdi-account-circle</v-icon>
                {{ maintainer.name }}
              </span>
              <span v-if="maintainer.email" class="mr-2">
                <v-icon left small>mdi-email</v-icon>
                <a :href="`mailto:${maintainer.email}`">{{ maintainer.email }}</a>
              </span>
            </div>
          </h6>
        </template>
      </div>
    </v-card-text>
  </v-card>
</template>

<script>
  import messages from '../i18n';

  export default {
    name: 'AppInfo',
    i18n: {
      messages: messages,
    },
    props: {
      appName: {
        type: String,
        default: () => '',
      },
      currentApp: {
        type: Object,
        default: () => null,
      },
      selectRepo: {
        type: String,
        default: () => '',
      },
      showVersion: {
        type: Boolean,
        default: () => true,
      },
      selectVersion: {
        type: String,
        default: () => '',
      },
      versions: {
        type: Array,
        default: () => [],
      },
    },

    data: () => ({
      selectVersionBind: '',
      chartMenu: false,
    }),
    watch: {
      selectVersion() {
        this.selectVersionBind = this.selectVersion;
      },
    },
    methods: {
      setVersion(version) {
        this.selectVersionBind = version;
        this.$emit('changeAppVersion', this.selectVersionBind);
      },
    },
  };
</script>

<style lang="scss" scoped>
  .app-overflow-y {
    overflow-y: auto;
  }

  .version__tip {
    line-height: 36px;
  }
</style>
