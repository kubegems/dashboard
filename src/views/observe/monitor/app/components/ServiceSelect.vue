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
  <v-menu
    v-model="menu"
    bottom
    :close-on-content-click="false"
    content-class="menu"
    max-height="450px"
    min-width="275px"
    nudge-bottom="5px"
    offset-y
    origin="top center"
    right
    transition="scale-transition"
  >
    <template #activator="{ on }">
      <div class="float-left">
        <v-btn
          class="mr-2 font-weight-medium primary--text"
          color="white"
          dark
          depressed
          small
          :style="{ marginTop: `${offsetY}px` }"
          v-on="on"
        >
          Service : {{ service }}
          <v-icon v-if="menu" right> mdi-chevron-up </v-icon>
          <v-icon v-else right> mdi-chevron-down </v-icon>
        </v-btn>
        <div class="kubegems__clear-float" />
      </div>
    </template>
    <v-card class="pa-2 py-3" flat height="450px">
      <div class="text-subtitle-2 mx-2 kubegems__text select__title">
        <div class="float-left"> Service </div>
        <div class="kubegems__clear-float" />
      </div>
      <div class="select__div" :style="{ width: '100%' }">
        <v-text-field
          v-model="search"
          class="mt-2"
          dense
          flat
          hide-details
          prepend-inner-icon="mdi-magnify"
          solo
          @keyup="onSearch"
        />
        <div class="text-caption pa-1 mt-2">Service</div>
        <v-divider class="mb-2" />
        <v-list class="pa-0" dense max-height="300" nav :style="{ overflowY: 'auto' }">
          <v-list-item-group v-model="serviceIndex" color="primary" @change="onServiceChange">
            <v-list-item v-for="item in serviceItemsCopy" :key="item" dense>
              <v-list-item-content>
                <v-list-item-title class="select__list__title pl-2">
                  {{ item }}
                </v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </v-list-item-group>
        </v-list>
      </div>
      <div class="kubegems__clear-float" />
    </v-card>
  </v-menu>
</template>

<script>
  import messages from '../../i18n';
  import { getMetricsLabelValues } from '@/api';

  export default {
    name: 'ServiceSelect',
    i18n: {
      messages: messages,
    },
    props: {
      date: {
        type: Array,
        default: () => [],
      },
      env: {
        type: Object,
        default: () => null,
      },
      offsetY: {
        type: Number,
        default: () => 0,
      },
    },
    data() {
      return {
        menu: false,
        serviceItems: [],
        serviceItemsCopy: [],
        search: '',
        serviceIndex: undefined,
      };
    },
    computed: {
      service() {
        return this.serviceIndex > -1 ? this.serviceItemsCopy[this.serviceIndex] : '';
      },
    },
    watch: {
      value: {
        handler(newValue) {
          if (newValue) {
          }
        },
        deep: true,
        immediate: true,
      },
      env: {
        handler(newValue) {
          if (newValue) {
            this.monitorServiceLabels();
          }
        },
        deep: true,
        immediate: true,
      },
    },
    methods: {
      async monitorServiceLabels() {
        const data = await getMetricsLabelValues(this.env?.clusterName, this.env?.environmentName, {
          noprocessing: true,
          label: 'service',
          expr: `gems_otel_calls_total{namespace="${this.env?.namespace}"}`,
          start: this.$moment(this.date[0]).utc().format(),
          end: this.$moment(this.date[1]).utc().format(),
        });
        const items = data;
        this.serviceItems = items;
        this.serviceItemsCopy = items;
        if (this.serviceItemsCopy && this.serviceItemsCopy.length > 0) {
          this.serviceIndex = 0;
          this.$emit('change', this.serviceItemsCopy[0]);
          this.$emit('input', this.serviceItemsCopy[0]);
        }
      },
      onSearch() {
        if (this.search) {
          this.serviceItemsCopy = this.serviceItems.filter((v) => {
            return v.value.indexOf(this.search) > -1;
          });
        } else {
          this.serviceItemsCopy = this.serviceItems;
        }
      },
      onServiceChange() {
        if (this.serviceIndex > -1) {
          this.$emit('change', this.serviceItemsCopy[this.serviceIndex]);
          this.$emit('input', this.serviceItemsCopy[this.serviceIndex]);
          this.menu = false;
        }
      },
    },
  };
</script>

<style lang="scss" scoped>
  .select {
    &__div {
      float: left;
      width: 50%;
      padding: 8px;
    }

    &__title {
      line-height: 28px;
      font-weight: 500 !important;
    }

    &__divider {
      min-height: 93%;
      max-height: 93%;
    }

    &__list {
      &__title {
        white-space: inherit !important;
        word-break: break-all !important;
      }
    }
  }

  .menu {
    right: 10px !important;
    left: auto !important;
  }
</style>
