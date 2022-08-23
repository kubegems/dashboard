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
  <v-flex class="mb-3">
    <v-row class="ma-0 pa-0">
      <v-col class="pa-0" cols="1" sm="12">
        <v-card class="custom-shaodow pa-0" :flat="flat" height="64">
          <v-card-text class="breadcrumb__flex">
            <v-icon v-if="breadcrumb.icon != undefined" left>
              {{ breadcrumb.icon }}
            </v-icon>
            <div class="text-subtitle-2 kubegems__text font-weight-medium breadcrumb__font">
              {{ $root.$t(breadcrumb.title) }}
            </div>
            <v-icon v-if="breadcrumb.tip !== undefined" class="breadcrumb__bg mr-1" right small>
              mdi-help-rhombus
            </v-icon>
            <div
              v-if="breadcrumb.tip !== undefined"
              class="text-overline breadcrumb__bg breadcrumb__tip font-weight-regular"
            >
              {{ breadcrumb.tip }}
            </div>
            <slot name="extend" />
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-flex>
</template>

<script>
  export default {
    name: 'BaseBreadcrumb',
    props: {
      flat: {
        type: Boolean,
        default: () => true,
      },
    },
    computed: {
      breadcrumb() {
        return {
          title: this.$route.meta.title,
          tip: this.$t(`breadcrumb.${this.$route.meta.tip}`),
          icon: this.$route.meta.icon,
        };
      },
    },
  };
</script>

<style lang="scss" scoped>
  .breadcrumb {
    &__flex {
      display: flex;
    }

    &__font {
      line-height: 2rem !important;

      @media (max-width: 1000px) {
        min-width: 75px;
      }
    }

    &__bg {
      color: rgba(0, 0, 0, 0.6);
      text-transform: capitalize !important;
    }

    &__tip {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      width: 1000px;

      @media (max-width: 1000px) {
        width: 600px;
      }
    }
  }
</style>
