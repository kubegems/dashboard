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
  <div :style="{ height: `${height}px`, overflowY: 'auto' }">
    <v-card flat>
      <v-card-text class="pt-7 px-7">
        <div class="d-flex justify-center my-3 mb-7">
          <div class="text-center" :style="{ wordBreak: 'break-all' }">
            <BaseLogo :icon-name="item ? item.name : ''" large :width="100" />
            <h3 class="text-h6 font-weight-medium primary--text">
              {{ item ? item.name : '' }}
            </h3>
          </div>
        </div>
        <v-divider />
        <div class="py-5">
          <h5 class="text-subtitle-1 kubegems__text">{{ $t('tip.version') }}</h5>
          <h6 class="text-body-2 mb-3">
            {{ item ? item.version : '' }}
          </h6>
          <h5 class="text-subtitle-1 kubegems__text">{{ $t('tip.requirement') }}</h5>
          <h6 class="text-body-2 mb-3">
            <div v-for="(require, index) in item ? item.requirements : []" :key="index">
              <div class="mb-1">
                <span
                  class="v-avatar mr-2"
                  :style="{
                    height: '10px',
                    minWidth: '10px',
                    width: '10px',
                    backgroundColor: `${require.message ? 'var(--warning-color)' : 'var(--success-color)'}`,
                  }"
                />
                <span class="mr-1">{{ require.name }}</span> {{ require.expr }}
                <RequirementTip v-if="require.message" :requirement="require">
                  <template #trigger>
                    <v-icon class="ml-1" color="orange" small>mdi-alert-circle</v-icon>
                  </template>
                </RequirementTip>
              </div>
            </div>
            <div v-if="!item || !item.requirements?.length">-</div>
          </h6>
          <h5 class="text-subtitle-1 kubegems__text">{{ $t('tip.desc') }}</h5>
          <h6 class="text-body-2 mb-3">
            {{ item && item.description ? item.description : '-' }}
          </h6>
          <h5 class="text-subtitle-1 kubegems__text">{{ $t('tip.category') }}</h5>
          <h6 class="text-body-2 mb-3">
            {{ item ? item.category : '' }}
          </h6>
          <h5 class="text-subtitle-1 kubegems__text">{{ $t('tip.deployed_namespace') }}</h5>
          <h6 class="text-body-2 mb-3">
            {{ item && item.installNamespace ? item.installNamespace : '-' }}
          </h6>
          <h5 class="text-subtitle-1 kubegems__text">{{ $t('tip.repository') }}</h5>
          <h6 class="text-body-2 mb-3">
            {{ item ? item.repository : '' }}
          </h6>
        </div>
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
  import { mapState } from 'vuex';

  import messages from '../../i18n';
  import RequirementTip from './RequirementTip';

  export default {
    name: 'PluginInfo',
    i18n: {
      messages: messages,
    },
    components: {
      RequirementTip,
    },
    props: {
      item: {
        type: Object,
        default: () => null,
      },
    },
    data() {
      return {};
    },
    computed: {
      ...mapState(['Admin', 'Scale']),
      height() {
        return parseInt((window.innerHeight - 148) / this.Scale);
      },
    },
  };
</script>
