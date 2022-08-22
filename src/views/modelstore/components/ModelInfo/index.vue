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
    <v-card v-if="item && item.recommentContent" :class="{ 'mb-3': true, 'mt-3': noVersion }" color="success" dark flat>
      <v-card-title>
        <span class="text-body-1 font-weight-medium">{{ $t('tip.platform_recomment') }}</span>
      </v-card-title>

      <v-card-text class="text-subtitle-2 font-weight-medium">
        {{ `"${item ? item.recommentContent : ''}"` }}
      </v-card-text>
    </v-card>
    <v-card flat>
      <v-card-text class="pt-7 px-7">
        <div class="d-flex justify-center my-3">
          <div class="text-center" :style="{ wordBreak: 'break-all' }">
            <BaseLogo icon-name="ai-model" large :width="100" />
            <h3 class="text-h6 font-weight-medium primary--text">
              {{ $route.params.name }}
            </h3>
            <VersionSelect v-if="!noVersion" v-model="version" :versions="item ? item.versions : []" />
          </div>
        </div>
        <v-divider />
        <div class="py-5">
          <div>
            <div class="float-left model__rate">
              <h5 class="text-subtitle-1 kubegems__text">{{ $t('tip.user_comment') }}</h5>
              <h6 class="text-body-2 mb-3 model__rate__div">
                <div class="float-left model__rate__div__fraction mr-3">
                  {{ item && item.rating ? item.rating.rating.toFixed(1) : 0 }}
                </div>
                <div class="float-left">
                  <v-rating
                    background-color="orange lighten-3"
                    class="model__rate__div__star"
                    color="orange"
                    dense
                    half-increments
                    readonly
                    small
                    :value="item && item.rating ? item.rating.rating : 0"
                  />
                  <div class="text-caption">
                    {{ item && item.rating ? item.rating.count : 0 }}{{ $t('tip.comment') }}
                  </div>
                </div>
                <div class="kubegems__clear-float" />
              </h6>
            </div>
            <div class="float-left model__rate">
              <h5 class="text-subtitle-1 kubegems__text">{{ $t('tip.platform_recomment') }}</h5>
              <h6 class="text-body-2 mb-2">
                <div :class="`float-left model__rate__div__recommend mr-3 ${getMarginLeft(item)}`">
                  <div>
                    <v-icon v-if="item && item.recomment >= 80" class="mt-n1" color="error">mdi-fire</v-icon>
                    {{ item ? item.recomment : 0 }}
                  </div>
                </div>
              </h6>
            </div>
            <div class="kubegems__clear-float" />
          </div>
          <h5 v-if="item && item.tags.length > 0" class="text-subtitle-1 kubegems__text">Tag</h5>
          <h6 class="text-body-2 mb-3">
            <v-chip v-for="(tag, index) in item ? item.tags : []" :key="index" class="ma-1" small>
              <v-avatar v-if="hasLogo(tag)" left>
                <BaseLogo class="model__logo" default-logo="tag" :icon-name="tag" :ml="0" :width="18" />
              </v-avatar>
              {{ tag }}
            </v-chip>
          </h6>
          <h5 class="text-subtitle-1 kubegems__text">{{ $root.$t('resource.type') }}</h5>
          <h6 class="text-body-2 mb-3">
            {{ item ? item.source : '' }}
          </h6>
          <h5 class="text-subtitle-1 kubegems__text">{{ $t('tip.library') }}</h5>
          <h6 class="text-body-2 mb-3">
            {{ item ? item.framework : '' }}
          </h6>
          <h5 class="text-subtitle-1 kubegems__text">{{ $t('tip.task_type') }}</h5>
          <h6 class="text-body-2 mb-3">
            {{ item ? item.task : '' }}
          </h6>
          <h5 class="text-subtitle-1 kubegems__text">{{ $t('tip.protocol') }}</h5>
          <h6 class="text-body-2 mb-3">
            {{ item ? item.license : '' }}
          </h6>
          <h5 class="text-subtitle-1 kubegems__text">{{ $t('tip.publish_status') }}</h5>
          <h6 class="text-body-2 mb-3">
            <v-icon color="success" left small>mdi-check-circle</v-icon>{{ $t('tip.published') }}
          </h6>
        </div>
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
  import { mapState } from 'vuex';

  import messages from '../../i18n';
  import VersionSelect from './VersionSelect';

  export default {
    name: 'ModelInfo',
    i18n: {
      messages: messages,
    },
    components: {
      VersionSelect,
    },
    props: {
      item: {
        type: Object,
        default: () => null,
      },
      noVersion: {
        type: Boolean,
        default: () => false,
      },
    },
    data() {
      return {
        version: undefined,
      };
    },
    computed: {
      ...mapState(['Admin', 'Scale']),
      height() {
        return parseInt((window.innerHeight - 148) / this.Scale);
      },
    },
    watch: {
      version: {
        handler(newValue) {
          if (newValue) {
            this.$emit('selcetVersion', newValue);
          }
        },
        deep: true,
        immediate: true,
      },
    },
    methods: {
      hasLogo(tag) {
        return this.$MODEL_FRAMEWORK.some((i) => {
          return tag.toLowerCase().indexOf(i) > -1;
        });
      },
      refresh() {
        this.$emit('refresh');
      },
      getMarginLeft(item) {
        if (item && item.recomment >= 80) {
          return '';
        }
        if (item && item.recomment >= 10) {
          return 'ml-5';
        }
        return 'ml-6';
      },
    },
  };
</script>

<style lang="scss" scoped>
  .model {
    &__rate {
      width: 50%;

      &__div {
        line-height: 40px;

        &__fraction {
          font-weight: bold;
          font-size: 20px;
        }

        &__recommend {
          font-weight: bold;
          font-size: 20px;
          line-height: 40px;
        }

        &__star {
          line-height: 20px;
        }
      }
    }

    &__logo {
      margin-top: 2px;
    }
  }
</style>
