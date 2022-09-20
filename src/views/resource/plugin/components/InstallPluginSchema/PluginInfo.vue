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
          <h5 class="text-subtitle-1 kubegems__text">{{ $t('tip.desc') }}</h5>
          <h6 class="text-body-2 mb-3">
            {{ item ? item.message : '' }}
          </h6>
          <h5 class="text-subtitle-1 kubegems__text">{{ $t('tip.category') }}</h5>
          <h6 class="text-body-2 mb-3">
            {{ item ? item.category : '' }}
          </h6>
          <h5 class="text-subtitle-1 kubegems__text">{{ $root.$t('resource.namespace') }}</h5>
          <h6 class="text-body-2 mb-3">
            {{ item ? item.namespace : '' }}
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

  export default {
    name: 'PluginInfo',
    i18n: {
      messages: messages,
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
