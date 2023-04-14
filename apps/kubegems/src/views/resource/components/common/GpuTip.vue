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
    <v-menu
      bottom
      :close-delay="200"
      :close-on-content-click="false"
      max-width="300px"
      offset-y
      open-on-hover
      origin="top center"
      transition="scale-transition"
    >
      <template #activator="{ on }">
        <span class="kubegems__pointer" v-on="on">
          <BaseLogo icon-name="gpu" :top="top" :ml="1" />
        </span>
      </template>
      <v-card flat>
        <v-flex class="text-body-2 text-center primary white--text pa-2 font-weight-medium">
          <v-icon color="white" left small> mdi-memory </v-icon>
          <span>{{ i18nLocal.t('tip.gpu_resource') }}</span>
        </v-flex>

        <v-list class="pa-0 kubegems__tip" dense>
          <v-list-item>
            <v-list-item-content>
              <v-list-item-title>
                <div class="float-left">
                  <BaseLogo icon-name="tke" :ml="0" />
                </div>
                <div class="logo"> Tke Gpu </div>
              </v-list-item-title>
              <v-row>
                <v-col class="py-1">
                  <v-list-item class="float-left pa-0 gpu__item" two-line>
                    <v-list-item-content class="text-caption kubegems__text">
                      {{ i18nLocal.t('tip.gpu_core') }} : {{ parseInt(item.TkeGpu || 0) / 100 }} Gpu
                      <div v-if="allocated">
                        {{ i18nLocal.t('tip.used') }} : {{ parseInt(item.AllocatedTkeGpu || 0) / 100 }} Gpu
                        <v-progress-linear
                          class="rounded font-weight-medium mt-1"
                          :color="getColor(item.TkeGpuPercentage)"
                          height="10"
                          :value="item.TkeGpuPercentage"
                        >
                          <span class="white--text">{{ item.TkeGpuPercentage }}% </span>
                        </v-progress-linear>
                      </div>
                    </v-list-item-content>
                  </v-list-item>
                </v-col>
                <v-col class="py-1">
                  <v-list-item class="float-left pa-0 gpu__item" two-line>
                    <v-list-item-content class="text-caption kubegems__text">
                      {{ i18nLocal.t('tip.gpu_memory') }} : {{ (parseInt(item.TkeMemory || 0) * 256) / 1024 }} Gi
                      <div v-if="allocated">
                        {{ i18nLocal.t('tip.used') }} : {{ (parseInt(item.AllocatedTkeMemory || 0) * 256) / 1024 }} Gi
                        <v-progress-linear
                          class="rounded font-weight-medium mt-1"
                          :color="getColor(item.TkeMemoryPercentage)"
                          height="10"
                          :value="item.TkeMemoryPercentage"
                        >
                          <span class="white--text">{{ item.TkeMemoryPercentage }}% </span>
                        </v-progress-linear>
                      </div>
                    </v-list-item-content>
                  </v-list-item>
                </v-col>
              </v-row>

              <v-list-item-title>
                <div class="float-left">
                  <BaseLogo icon-name="nvidia" :ml="0" />
                </div>
                <div class="logo"> Nvidia Gpu </div>
              </v-list-item-title>
              <v-row>
                <v-col class="py-1" cols="6">
                  <v-list-item class="float-left pa-0 gpu__item" two-line>
                    <v-list-item-content class="text-caption kubegems__text">
                      {{ i18nLocal.t('tip.gpu_core') }} : {{ parseInt(item.NvidiaGpu || 0) }} Gpu
                      <div v-if="allocated">
                        {{ i18nLocal.t('tip.used') }} : {{ parseInt(item.AllocatedNvidiaGpu || 0) }} Gpu
                        <v-progress-linear
                          class="rounded font-weight-medium mt-1"
                          :color="getColor(item.NvidiaGpuPercentage)"
                          height="10"
                          :value="item.NvidiaGpuPercentage"
                        >
                          <span class="white--text">{{ item.NvidiaGpuPercentage }}% </span>
                        </v-progress-linear>
                      </div>
                    </v-list-item-content>
                  </v-list-item>
                </v-col>
              </v-row>
            </v-list-item-content>
          </v-list-item>
        </v-list>
      </v-card>
    </v-menu>
  </v-flex>
</template>

<script lang="ts" setup>
  import { useI18n } from '../i18n';

  const i18nLocal = useI18n();

  withDefaults(
    defineProps<{
      allocated?: boolean;
      item?: any;
      top?: number;
    }>(),
    {
      allocated: true,
      item: undefined,
      top: 0,
    },
  );

  const getColor = (percentage: number): string => {
    return percentage ? (percentage < 60 ? 'primary' : percentage < 80 ? 'warning' : 'red darken-1') : 'primary';
  };
</script>

<style lang="scss" scoped>
  .logo {
    float: left;
    line-height: 20px;
    margin-left: 4px;
  }

  .gpu {
    &__item {
      min-height: 40px !important;
    }
  }
</style>
