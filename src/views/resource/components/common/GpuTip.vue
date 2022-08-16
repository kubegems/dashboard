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
  <v-flex class="my-1">
    <v-menu
      bottom
      :close-delay="200"
      :close-on-content-click="false"
      max-width="200px"
      offset-y
      open-on-hover
      origin="top center"
      transition="scale-transition"
    >
      <template #activator="{ on }">
        <span class="kubegems__pointer" v-on="on">
          <BaseLogo :icon-name="type" />
        </span>
      </template>
      <v-card flat>
        <v-flex class="text-body-2 text-center primary white--text py-2 font-weight-medium">
          <v-icon color="white" left small> mdi-memory </v-icon>
          <span>{{ type === 'tke' ? 'Tencent Vcuda' : 'Nvidia Gpu' }}</span>
        </v-flex>
        <v-list class="pa-0 kubegems__tip" dense>
          <v-list-item>
            <v-list-item-content>
              <template v-if="type === 'tke'">
                <v-list-item class="float-left pa-0" two-line>
                  <v-list-item-content class="py-0">
                    <v-list-item-title> {{ $root.$t('resource.gpu') }} </v-list-item-title>
                    <v-list-item-content class="text-caption kubegems__text">
                      {{ parseInt(item.TkeGpu || 0) / 100 }} Gpu
                      <div v-if="allocated">
                        {{ $t('tip.used') }} : {{ parseInt(item.AllocatedTkeGpu || 0) / 100 }} Gpu ({{
                          item.TkeGpuPercentage
                        }}%)
                      </div>
                    </v-list-item-content>
                  </v-list-item-content>
                </v-list-item>
                <v-list-item class="float-left pa-0" two-line>
                  <v-list-item-content class="py-0">
                    <v-list-item-title> {{ $root.$t('resource.video_memory') }} </v-list-item-title>
                    <v-list-item-content class="text-caption kubegems__text">
                      {{ parseInt(item.TkeMemory || 0) / 100 }} Gi
                      <div v-if="allocated">
                        {{ $t('tip.used') }} : {{ (parseInt(item.AllocatedTkeMemory || 0) * 256) / 1024 }} Gi ({{
                          item.TkeMemoryPercentage
                        }}%)
                      </div>
                    </v-list-item-content>
                  </v-list-item-content>
                </v-list-item>
              </template>
              <template v-if="type === 'nvidia'">
                <v-list-item class="float-left pa-0" two-line>
                  <v-list-item-content class="py-0">
                    <v-list-item-title> {{ $root.$t('resource.gpu') }} </v-list-item-title>
                    <v-list-item-content class="text-caption kubegems__text">
                      {{ parseInt(item.NvidiaGpu || 0) }} Gpu
                      <div v-if="allocated">
                        {{ $t('tip.used') }} : {{ parseInt(item.AllocatedNvidiaGpu || 0) / 100 }} Gpu ({{
                          item.NvidiaGpuPercentage
                        }}%)
                      </div>
                    </v-list-item-content>
                  </v-list-item-content>
                </v-list-item>
              </template>
            </v-list-item-content>
          </v-list-item>
        </v-list>
      </v-card>
    </v-menu>
  </v-flex>
</template>

<script>
  import messages from '../i18n';

  export default {
    name: 'GpuTip',
    i18n: {
      messages: messages,
    },
    props: {
      allocated: {
        type: Boolean,
        default: () => true,
      },
      item: {
        type: Object,
        default: () => {},
      },
      type: {
        type: String,
        default: () => 'tke',
      },
    },
  };
</script>
