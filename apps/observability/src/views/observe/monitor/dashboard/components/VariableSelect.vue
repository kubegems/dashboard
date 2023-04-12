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
    :close-on-click="!inForm"
    :close-on-content-click="false"
    max-height="450px"
    max-width="450px"
    :min-width="`${width}px`"
    nudge-bottom="15px"
    nudge-right="60px"
    offset-y
    origin="top center"
    right
    transition="scale-transition"
  >
    <template #activator="{ on }">
      <v-autocomplete
        v-if="inForm"
        class="my-0"
        color="primary"
        hide-no-data
        hide-selected
        :items="[{ text: showText(), value: showText() }]"
        :label="$t('tip.global_var_val')"
        multiple
        :no-data-text="$root.$t('data.no_data')"
        :value="showVal || edit ? showText() : undefined"
        v-on="on"
      >
        <template #selection>
          <v-chip v-if="showText()" color="primary" small>
            <span>{{ showText() }}</span>
          </v-chip>
        </template>
      </v-autocomplete>
      <div v-else class="float-left">
        <v-btn
          class="mr-2 mt-1 font-weight-medium primary--text"
          color="white"
          dark
          depressed
          small
          :style="{ marginTop: `${offsetY}px` }"
          v-on="on"
        >
          {{ $t('tip.global_var') }}{{ variable }} {{ showText() }}
          <v-icon v-if="menu" right> mdi-chevron-up </v-icon>
          <v-icon v-else right> mdi-chevron-down </v-icon>
        </v-btn>
        <div class="kubegems__clear-float" />
      </div>
    </template>
    <v-card class="pa-2 py-3" flat height="450px">
      <div class="text-subtitle-2 mx-2 kubegems__text select__title">
        <div class="float-left"> {{ $t('tip.global_var') }} </div>
        <div class="float-right">
          <v-btn class="mx-1" color="primary" small @click="reset">{{ $root.$t('operate.reset') }}</v-btn>
          <v-btn v-if="inForm" class="mx-1" color="primary" small @click="selectAll">{{ $t('operate.all') }}</v-btn>
          <v-btn class="ml-1" color="primary" small @click="setLabelPairs">
            {{ $root.$t('operate.confirm') }}
          </v-btn>
        </div>
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
        <div class="text-caption pa-1 mt-2">{{ variable }}</div>
        <v-divider class="mb-2" />
        <v-list class="pa-0" dense max-height="300" nav :style="{ overflowY: 'auto' }">
          <v-list-item-group color="primary">
            <v-list-item v-for="(item, index) in variableItemsCopy" :key="item.value" dense>
              <v-list-item-action class="mx-2">
                <v-checkbox v-model="item.active" />
              </v-list-item-action>
              <v-list-item-content @click="selectItem(item, index)">
                <v-list-item-title class="select__list__title pl-2">
                  {{ item.value }}
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
  import { deepCopy } from '@kubegems/libs/utils/helpers';

  import messages from '../../i18n';

  export default {
    name: 'VariableSelect',
    i18n: {
      messages: messages,
    },
    props: {
      edit: {
        type: Boolean,
        default: () => false,
      },
      formVariables: {
        type: Array,
        default: () => [],
      },
      inForm: {
        type: Boolean,
        default: () => false,
      },
      lp: {
        type: Object,
        default: () => ({}),
      },
      offsetY: {
        type: Number,
        default: () => 0,
      },
      variable: {
        type: String,
        default: () => '',
      },
      variableSelectItems: {
        type: Array,
        default: () => [],
      },
      variableValues: {
        type: Array,
        default: () => [],
      },
      width: {
        type: Number,
        default: () => 275,
      },
    },
    data() {
      return {
        menu: false,
        variableItems: [],
        variableItemsCopy: [],
        labelpairs: {},
        search: '',
        showVal: false,
      };
    },
    computed: {
      selectedItems() {
        return this.variableItemsCopy.filter((v) => {
          return v.active;
        });
      },
    },
    watch: {
      menu: {
        handler(newValue) {
          if (newValue) {
            this.showVal = false;
          }
        },
        deep: true,
        immediate: true,
      },
      variable: {
        handler(newValue) {
          if (newValue) {
            const lps = Object.values(this.lp).map((l) => {
              return l.split('|');
            });
            const items = this.variableValues.map((d) => {
              const active = lps.some((l) => {
                return l.some((sl) => {
                  return sl === d;
                });
              });
              return {
                text: d,
                value: d,
                active: active,
              };
            });
            this.variableItems = items;
            this.variableItemsCopy = items;
          } else {
            this.variableItems = [];
            this.variableItemsCopy = [];
          }
        },
        deep: true,
        immediate: true,
      },
      variableSelectItems: {
        handler(newValue) {
          if (newValue && newValue.length > 0) {
            const items = newValue.map((d) => {
              return {
                text: d,
                value: d,
                active: false,
              };
            });
            this.variableItems = items;
            this.variableItemsCopy = items;
            if (this.formVariables) {
              this.variableItemsCopy.forEach((v, index) => {
                if (this.formVariables.indexOf(v.value) > -1) {
                  v.active = true;
                  this.$set(this.variableItemsCopy, index, v);
                }
              });
            }
          }
        },
        deep: true,
        immediate: true,
      },
    },
    methods: {
      onSearch() {
        if (this.search) {
          this.variableItemsCopy = this.variableItems.filter((v) => {
            return v.value.indexOf(this.search) > -1;
          });
        } else {
          this.variableItemsCopy = this.variableItems;
        }
      },
      setLabelPairs() {
        if (this.inForm) {
          const items = this.selectedItems.map((i) => {
            return i.value;
          });
          this.$emit('input', items);
          this.$emit('change', items);
          this.showVal = true;
        } else {
          this.labelpairs[`labelpairs[${this.variable}]`] = this.selectedItems.reduce(
            (pre, current, index, arr) =>
              (pre?.value || pre) + (current?.value || current) + `${index === arr.length - 1 ? '' : '|'}`,
            '',
          );
          this.$emit('input', this.labelpairs);
          this.$emit('change', this.labelpairs);
          this.$emit('loadMetrics');
        }
        this.menu = false;
      },
      reset() {
        this.variableItems.forEach((v, index) => {
          v.active = false;
          this.$set(this.variableItems, index, v);
        });
        this.variableItemsCopy = deepCopy(this.variableItems);
        this.labelpairs = {};
      },
      showText() {
        if (this.selectedItems.length > 1) {
          return `${this.selectedItems[0].value} (+${this.selectedItems.length - 1})`;
        } else if (this.selectedItems.length > 0) {
          return `${this.selectedItems[0].value}`;
        }
        return '';
      },
      selectAll() {
        this.variableItems.forEach((v, index) => {
          v.active = !v.active;
          this.$set(this.variableItems, index, v);
        });
        this.variableItemsCopy = deepCopy(this.variableItems);
      },
      selectItem(item, index) {
        this.variableItemsCopy.forEach((item, index) => {
          item.active = false;
          this.$set(this.variableItemsCopy, index, item);
        });
        item.active = true;
        this.$set(this.variableItemsCopy, index, item);
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
</style>
